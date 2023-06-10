import Curso from "App/Models/Curso";
import { DateTime } from "luxon";
import Matricula from "App/Models/Matricula";
import Visualizacao from "App/Models/Visualizacao";

export default class CursoController {
    public async criar({ request }) {
        let curso = new Curso();
        let req = request.body();
        curso.nome = req.body.nome;
        curso.cod_hotmart = req.body.cod_hotmart;
        curso.cod_instrutor = req.usuario.instrutor[0].id;

        await curso.save();

        if (curso.$isPersisted) {
            return { success: true, obj: curso }
        }
    }

    public async get({ request, params }) {
        let curso = (await Curso.query()
            .where('id', params.id)
            .where('cod_instrutor', request.body().usuario.instrutor[0].id).preload('modulos', q => {
                q.whereNull('cancelado_em').orderBy('sequencia')
                    .preload('aulas', q => {
                        q.whereNull('cancelado_em').orderBy('sequencia')
                            .preload('atividades', q => {
                                q.orderBy('sequencia').whereNull('cancelado_em')
                                    .preload('opcoes', q => { q.whereNull('cancelado_em') })
                            })
                            .preload('lancamento', q => { q.whereNull('cancelado_em') })
                    })
            }))[0];

        return { success: curso != null, obj: curso }
    }

    public async editar({ request, params }) {
        let curso = (await Curso.query()
            .where('id', params.id)
            .where('cod_instrutor', request.body().usuario.instrutor[0].id))[0]

        if (curso) {
            curso.nome = request.body().body.nome;
            curso.cod_hotmart = request.body().body.cod_hotmart;

            await curso.save();
            return { success: curso.$isPersisted, obj: curso }
        }
        return { success: false }

    }

    public async deletar({ request, params }) {
        let curso = (await Curso.query()
            .where('id', params.id)
            .where('cod_instrutor', request.body().usuario.instrutor[0].id))[0]

        if (curso) {
            curso.cancelado_em = DateTime.now();

            await curso.save();
            return { success: curso.$isPersisted, obj: curso }
        }
        return { success: false }
    }

    public async matriculados({ params }) {
        let matriculas = (await Matricula.query().whereHas('curso', q => {
            q.where('cod_curso', params.id)
        }).preload('aluno', q => {
            q.preload('usuario')
        }).whereNull('cancelado_em'));
        return { success: matriculas.length > 0, obj: matriculas };
    }

    public async getSelect() {
        let cursos = (await Curso.all());
        return { obj: cursos };
    }

    public async getMatriculas({ params }) {
        let matriculas = (await Matricula.query().whereHas('curso', q => {
            q.where('cod_curso', params.id)
        }).preload('aluno', q => {
            q.preload('usuario')
        }).preload('criadoPor')
            .preload('canceladoPor'));
        return { obj: matriculas };
    }

    public async getVisualizacoes({ params }) {
        let visualizacoes = (await Visualizacao.query().whereHas('aula', q => {
            q.whereHas('modulo', q => {
                q.where('cod_curso', params.id)
            })
        }).preload('aula')
            .preload('matricula', q => {
                q.preload('aluno', q => {
                    q.preload('usuario')
                })
            }));
        return { obj: visualizacoes };
    }
}