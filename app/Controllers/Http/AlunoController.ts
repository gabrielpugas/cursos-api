import Matricula from "App/Models/Matricula";
import Curso from "App/Models/Curso";
import Usuario from "App/Models/Usuario";
import Aula from "App/Models/Aula";
import Visualizacao from "App/Models/Visualizacao";
import Comentario from "App/Models/Comentario";
import Mail from "@ioc:Adonis/Addons/Mail";
import Atividade from "App/Models/Atividade";
import Resposta from "App/Models/Resposta";
import Opcao from "App/Models/Opcao";

export default class AlunoController {
    public async getCursos({ request }) {
        let r = request.body();
        let cursos = (await Curso.query().whereHas('matriculas', q => {
            q.whereNull('cancelado_em').where('cod_aluno', r.usuario.aluno[0].id)
        }).whereNull('cancelado_em').preload('modulos', q => { q.whereNull('cancelado_em').orderBy('sequencia').preload('aulas') }));
        return { success: true, obj: cursos };
    }

    public async getCurso({ request, params }) {
        let r = request.body();
        let curso = (await Curso.query().where('id', params.id).whereHas('matriculas', q => {
            q.whereNull('cancelado_em').where('cod_aluno', r.usuario.aluno[0].id)
        }).whereNull('cancelado_em').preload('modulos', q => { q.whereNull('cancelado_em').orderBy('sequencia').whereHas('aulas', q => q.whereHas('lancamento', q => q.whereNull('cancelado_em'))) })
        .preload('matriculas', q=>{
            q.where('cod_aluno', r.usuario.aluno[0].id)
                .whereNull('cancelado_em')
        }))[0];

        for (let i = 0; i < curso.modulos.length; i++) {
            await curso.modulos[i].load('aulas', q => {
                q.whereNull('cancelado_em')
                    .orderBy('sequencia')
                    .whereHas('lancamento', q => q.whereNull('cancelado_em'))
                    .preload('visualizacoes', q =>{
                        q.whereHas('matricula', q=>{
                            q.whereNull('cancelado_em')
                            .where('cod_aluno', r.usuario.aluno[0].id)
                        })
                    })
            });
            for (let j = 0; j < curso.modulos[i].aulas.length; j++) {
                await curso.modulos[i].aulas[j].load('atividades', q => q.orderBy('sequencia').whereNull('cancelado_em'));
                for (let k = 0; k < curso.modulos[i].aulas[j].atividades.length; k++) {
                    await curso.modulos[i].aulas[j].atividades[k].load('opcoes', q => q.whereNull('cancelado_em'));
                }
            }
        }

        return { success: true, obj: curso };
    }

    public async getCursoAula({ request, params }) {
        let curso = (await Curso.query().whereNull('cancelado_em').whereHas('modulos', q => {
            q.whereNull('cancelado_em').whereHas('aulas', q => {
                q.whereNull('cancelado_em').where('id', params.id).whereHas('lancamento', q => { q.whereNull('cancelado_em') })
            })
        }).whereHas('matriculas', q => {
            q.whereNull('cancelado_em').where('cod_aluno', request.body().usuario.aluno[0].id)
        }).preload('modulos', q => {
            q.preload('aulas', q => {
                q.whereNull('cancelado_em').whereHas('lancamento', q => q.whereNull('cancelado_em')).orderBy('sequencia')
                    .preload('lancamento', q => q.whereNull('cancelado_em'))
            }).orderBy('sequencia')
        }))[0];

        let matricula = (await Matricula.query().where('cod_curso', curso.id).where('cod_aluno', request.body().usuario.aluno[0].id).whereNull('cancelado_em'))[0];

        if (!matricula)
            return { success: false, obj: {} };

        for (let i = 0; i < curso.modulos.length; i++) {
            for (let j = 0; j < curso.modulos[i].aulas.length; j++) {
                let visualizacao = (await Visualizacao.query().where('cod_aula', curso.modulos[i].aulas[j].id).where('cod_matricula', matricula.id))[0];
                curso.modulos[i].aulas[j].assistida = visualizacao != null

            }
        }

        return { success: curso != null, obj: curso }
    }

    public async getAula({ request, params }) {
        async function loadRespostas(comentarios: Comentario[]) {
            for (let i = 0; i < comentarios.length; i++) {
                await comentarios[i].load('respostas', q => {
                    q.whereNull('cancelado_em').preload('usuario').orderBy('criado_em', 'desc');
                });

                if (comentarios[i].respostas.length > 0)
                    await loadRespostas(comentarios[i].respostas);
            }
        }

        let aula = (await Aula.query().where('id', params.id).whereNull('cancelado_em')
            .whereHas('modulo', q => {
                q.whereNull('cancelado_em').whereHas('curso', q => {
                    q.whereNull('cancelado_em').whereHas('matriculas', q => {
                        q.whereNull('cancelado_em').where('cod_aluno', request.body().usuario.aluno[0].id)
                    })
                })
            }).whereHas('lancamento', q => {
                q.whereNull('cancelado_em')
            }).preload('atividades', q => {
                q.whereNull('cancelado_em').orderBy('sequencia').preload('opcoes', q => {
                    q.whereNull('cancelado_em')
                })
            }).preload('comentarios', q => { q.whereNull('cod_comentario_pai').whereNull('cancelado_em').preload('usuario').orderBy('criado_em', 'desc') }))[0];

        await loadRespostas(aula.comentarios);

        return { success: aula != null, obj: aula };
    }

    public async setVisualizacao({ request }) {
        let r = request.body();

        let aula = (await Aula.query().where('id', r.body.cod_aula)
            .whereNull('cancelado_em').whereHas('lancamento', q => q.whereNull('cancelado_em'))
            .whereHas('modulo', q => {
                q.whereNull('cancelado_em').whereHas('curso', q => {
                    q.whereNull('cancelado_em').whereHas('matriculas', q => {
                        q.whereNull('cancelado_em').where('cod_aluno', r.usuario.aluno[0].id)
                    })
                })
            }))[0];
        if (aula) {
            let matricula = (await Matricula.query().where('cod_aluno', r.usuario.aluno[0].id)
                .whereNull('cancelado_em').whereHas('curso', q => {
                    q.whereNull('cancelado_em').whereHas('modulos', q => {
                        q.whereNull('cancelado_em').whereHas('aulas', q => {
                            q.whereNull('cancelado_em').where('id', r.body.cod_aula).whereHas('lancamento', q => {
                                q.whereNull('cancelado_em')
                            })
                        })
                    })
                }))[0];

            let visualizacao = new Visualizacao();
            visualizacao.cod_aula = aula.id;
            visualizacao.cod_matricula = matricula.id;

            await visualizacao.save();

            return { success: visualizacao.$isPersisted };
        } else
            return { success: false };
    }

    public async comentar({ request }) {
        let r = request.body();
        let aula = (await Aula.query().where('id', r.body.cod_aula)
            .whereNull('cancelado_em').whereHas('lancamento', q => q.whereNull('cancelado_em'))
            .whereHas('modulo', q => {
                q.whereNull('cancelado_em').whereHas('curso', q => {
                    q.whereNull('cancelado_em').whereHas('matriculas', q => {
                        q.whereNull('cancelado_em').where('cod_aluno', r.usuario.aluno[0].id)
                    })
                })
            }))[0];
        if (aula) {
            let usuario = (await Usuario.query().where('id', r.usuario.id))[0];

            return await usuario.comentar({ ...r.body });
        } else {
            return { success: false, obj: 'Aula não encontrada' };
        }
    }

    public async solicitarSuporte({ request }) {
        let r = request.body();

        await Mail.sendLater((message) => {
            message
                .from('no-reply@cursos.pugastrader.com.br')
                .to('suporte@cursos.pugastrader.com.br')
                .replyTo(r.usuario.email)
                .subject('Pugas Cursos - ' + r.body.assunto)
                .htmlView('emails/suporte', { usuario: r.usuario, ...r.body })
        });

        return { success: true };
    }

    public async responderAtividade({ request }) {
        let r = request.body();

        let certas = 0;
        let sucesso = true;

        for (let i = 0; i < r.body.length; i++) {
            let atividade = (await Atividade.query().where('id', r.body[i].cod_atividade).whereNull('cancelado_em'))[0];
            let matricula = (await Matricula.query().where('cod_aluno', r.usuario.aluno[0].id).whereNull('cancelado_em').whereHas('curso', q => {
                q.whereNull('cancelado_em').whereHas('modulos', q => {
                    q.whereNull('cancelado_em').whereHas('aulas', q => {
                        q.whereNull('cancelado_em').where('id', atividade.cod_aula)
                    })
                })
            }))[0];

            if (matricula) {
                let t = (await Atividade.query()
                    .where('id', r.body[i].cod_atividade).whereNull('cancelado_em').preload('opcoes', q => {
                        q.whereHas('respostas', q => {
                            q.where('cod_matricula', matricula.id)
                        }).preload('respostas', q => {
                            q.where('cod_matricula', matricula.id)
                        })
                    }))[0];

                let tentativa = 0;
                t.opcoes.forEach(e => {
                    e.respostas.forEach(res => {
                        tentativa = res.tentativa > tentativa ? res.tentativa : tentativa;
                    })
                });
                tentativa++;

                if (!Array.isArray(r.body[i].opcao)) {
                    let resp = new Resposta();
                    resp.cod_matricula = matricula.id;
                    resp.cod_opcao = r.body[i].opcao;
                    resp.tentativa = tentativa;
                    await resp.save();
                    sucesso = sucesso && resp.$isPersisted;
                } else {
                    for (let j = 0; j < r.body[i].opcao.length; j++) {
                        let resp = new Resposta();
                        resp.cod_matricula = matricula.id;
                        resp.cod_opcao = r.body[i].opcao[j];
                        resp.tentativa = tentativa;
                        await resp.save();
                        sucesso = sucesso && resp.$isPersisted;
                    }
                }

                let corretas_ = (await Opcao.query().whereNull('cancelado_em')
                    .where('correta', true)
                    .where('cod_atividade', r.body[i].cod_atividade));
                let corretas: number[] = [];
                corretas_.forEach(e => corretas.push(e.id));

                let acertos = corretas.filter(c => {
                    if (Array.isArray(r.body[i].opcao))
                        return r.body[i].opcao.includes(c)
                    return r.body[i].opcao == c;
                }).length;
                let erros = 0;
                if (Array.isArray(r.body[i].opcao)) {
                    erros = r.body[i].opcao.filter(e => !corretas.includes(e))
                        .concat(corretas.filter(e => !r.body[i].opcao.includes(e))).length;
                }

                certas += ((acertos - erros) < 0 ? 0 : (acertos - erros)) / corretas.length

            } else {
                sucesso = false;
            }
        }

        return { success: sucesso, obj: { certas, total: r.body.length, nota: certas / r.body.length } };
    }

    public async getResultadoAtividade({ request, params }) {
        let r = request.body();
        let matricula = (await Matricula.query().whereNull('cancelado_em')
            .where('cod_aluno', r.usuario.aluno[0].id)
            .whereHas('curso', q => {
                q.whereNull('cancelado_em').whereHas('modulos', q => {
                    q.whereNull('cancelado_em').whereHas('aulas', q => {
                        q.whereNull('cancelado_em').where('id', params.aula)
                    })
                })
            }))[0];
        if (matricula) {
            let _respostas = (await Resposta.query().whereHas('opcao', q => {
                q.whereNull('cancelado_em').whereHas('atividade', q => {
                    q.whereNull('cancelado_em').where('cod_aula', params.aula)
                })
            }).preload('opcao'))
            let respostas: Resposta[][] = [];
            let ultima: number = 0;

            let atividades = (await Atividade.query().whereNull('cancelado_em').where('cod_aula', params.aula).preload('opcoes').orderBy('id'));

            _respostas.forEach(e => {
                if (e.tentativa > ultima)
                    ultima = e.tentativa;
            });

            let respostas_filtradas: Resposta[] = _respostas.filter(o => o.tentativa == ultima);


            let corretas_ = (await Opcao.query().whereNull('cancelado_em')
                .where('correta', true)
                .whereHas('atividade', q => {
                    q.whereNull('cancelado_em').where('cod_aula', params.aula)
                }).orderBy('cod_atividade'));
            let corretas: number[] = [];
            corretas_.forEach(e => corretas.push(e.id));


            let certas_erro: any = [];

            atividades.forEach(a => {
                respostas.push(respostas_filtradas.filter(r => a.id == r.opcao.cod_atividade));
                let c = corretas_.filter(r => r.cod_atividade == a.id);
                let tmp: any = [];
                c.forEach(o => {
                    tmp.push(o.id)
                });
                certas_erro.push(tmp);
            })

            let respostas_erro: any = [];
            respostas.forEach(r => {
                let rs: number[] = [];
                r.forEach(resposta => {
                    rs.push(resposta.cod_opcao)
                })
                respostas_erro.push(rs);
            })

            let certas = 0;

            for (let i = 0; i < respostas.length; i++) {

                let acertos = corretas.filter(c => {
                    return respostas[i].filter(r => r.cod_opcao == c).length > 0;
                }).length;

                let erros = 0;
                erros = respostas_erro[i].filter(e => !certas_erro[i].includes(e))
                    .concat(certas_erro[i].filter(e => !respostas_erro[i].includes(e))).length;

                certas += ((acertos - erros) < 0 ? 0 : (acertos - erros)) / certas_erro[i].length
            }

            return { success: true, obj: { certas, total: atividades.length, nota: certas / atividades.length } };
        } else {
            return { success: false, obj: { msg: 'Matricula não encontrado' } }
        }
    }

    public async getCertificado({ params }) {
        let matricula = (await Matricula.query().where('id', params.id)
            .preload('aluno', q => {
                q.preload('usuario')
            }).preload('curso', q => {
                q.preload('instrutor', q=>{
                    q.preload('usuario')
                })
            })
            .preload('visualizacoes', q => {
                q.orderBy('criado_em');
            }))[0];
        return { obj: matricula };
    }
}