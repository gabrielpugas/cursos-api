import Aula from "App/Models/Aula";
import Comentario from "App/Models/Comentario";
import Curso from "App/Models/Curso";
import Usuario from "App/Models/Usuario";

export default class InstrutorController {
    public async getCursos({ request }) {
        let cursos = await Curso.query()
            .where('cod_instrutor', request.body().usuario.instrutor[0].id)
            .whereNull('cancelado_em');
        return { success: true, obj: cursos };
    }

    public async comentar({ request }) {
        let r = request.body();
        let aula = (await Aula.query().where('id', r.body.cod_aula)
            .whereNull('cancelado_em').whereHas('lancamento', q => q.whereNull('cancelado_em'))
            .whereHas('modulo', q => {
                q.whereNull('cancelado_em').whereHas('curso', q => {
                    q.whereNull('cancelado_em').whereHas('instrutor', q => {
                        q.whereNull('cancelado_em').where('cod_instrutor', r.usuario.instrutor[0].id)
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

    public async getCursoAula({ request, params }) {
        let r = request.body();

        let curso = (await Curso.query().whereNull('cancelado_em').whereHas('modulos', q => {
            q.whereNull('cancelado_em').whereHas('aulas', q => {
                q.whereNull('cancelado_em').where('id', params.id).whereHas('lancamento', q => { q.whereNull('cancelado_em') })
            })
        }).whereHas('instrutor', q => {
            q.whereNull('cancelado_em').where('cod_instrutor', r.usuario.instrutor[0].id)
        }).preload('modulos', q => {
            q.preload('aulas', q => {
                q.whereNull('cancelado_em').whereHas('lancamento', q => q.whereNull('cancelado_em')).orderBy('sequencia')
                    .preload('lancamento', q => q.whereNull('cancelado_em'))
            }).orderBy('sequencia')
        }))[0];

        return { success: curso != null, obj: curso }
    }

    public async getAula({ request, params }) {
        let r = request.body();
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
                    q.whereNull('cancelado_em').whereHas('instrutor', q => {
                        q.whereNull('cancelado_em').where('cod_instrutor', r.usuario.instrutor[0].id)
                    })
                })
            }).preload('atividades', q => {
                q.whereNull('cancelado_em').orderBy('sequencia').preload('opcoes', q => {
                    q.whereNull('cancelado_em')
                })
            }).preload('comentarios', q => { q.whereNull('cod_comentario_pai').whereNull('cancelado_em').preload('usuario').orderBy('criado_em', 'desc') }))[0];
        
        if (aula)
            await loadRespostas(aula.comentarios);

        return { success: aula != null, obj: aula };
    }
}
