import { DateTime } from "luxon";
import Matricula from "App/Models/Matricula";
import Curso from "App/Models/Curso";
import Usuario from "App/Models/Usuario";

export default class CursoController {
    public async create({ request }) {
        let r = request.body();
        let curso = (await Curso.query().whereHas('instrutor', q => {
            q.where('cod_instrutor', r.usuario.instrutor[0].id).whereNull('cancelado_em');
        }).where('id', r.body.cod_curso).whereNull('cancelado_em'))[0];

        if (curso) {
            let usuario = (await Usuario.query().where('email', r.body.email).whereNull('cancelado_em').whereHas('aluno', q => {
                q.whereNull('cancelado_em');
            }).preload('aluno'))[0];

            if (usuario) {
                let matricula = (await Matricula.query().where('cod_aluno', usuario.aluno[0].id).where('cod_curso', r.body.cod_curso).whereNull('cancelado_em'))[0];

                if (matricula) {
                    return { success: false, obj: 'Aluno já matriculado' };
                } else {
                    matricula = new Matricula();
                    matricula.criado_por = r.usuario.id;
                    matricula.cod_aluno = usuario.aluno[0].id;
                    matricula.cod_curso = r.body.cod_curso;

                    await matricula.save();

                    return { success: matricula.$isPersisted, obj: matricula };
                }
            } else {
                return { success: false, obj: 'Aluno não encontrado' };
            }
        } else {
            return { success: false, obj: 'Curso não encontrado' };
        }
    }

    public async delete({ request, params }) {
        let mat = (await Matricula.query().where('id', params.id).whereNull('cancelado_em').whereHas('curso', q => {
            q.whereNull('cancelado_em').whereHas('instrutor', q => {
                q.where('id', request.body().usuario.instrutor[0].id);
            })
        }))[0];

        if (mat) {
            mat.cancelado_por = request.body().usuario.id;
            mat.cancelado_em = DateTime.now();

            await mat.save();

            return { success: mat.$isPersisted, obj: mat };
        } else {
            return { success: false, obj: 'Matrícula não encontrada' };
        }
    }
}