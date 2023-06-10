import Curso from "App/Models/Curso";
import Modulo from "App/Models/Modulo";
import { DateTime } from "luxon";

export default class ModuloController {
    public async criar({ request }) {
        let req = request.body();

        let curso = (await Curso.query()
            .where('id', req.body.cod_curso).whereNull('cancelado_em')
            .where('cod_instrutor', req.usuario.instrutor[0].id).preload('modulos', q => {
                q.whereNull('cancelado_em').orderBy('sequencia')
            }))[0];

        if (curso) {
            let modulo = new Modulo();
            modulo.nome = req.body.nome;
            modulo.sequencia = req.body.sequencia;
            modulo.cod_curso = req.body.cod_curso;

            if (modulo.sequencia > curso.modulos.length + 1)
                modulo.sequencia = curso.modulos.length + 1;

            if (modulo.sequencia < curso.modulos.length + 1) {
                let i = modulo.sequencia - 1;
                for (i; i < curso.modulos.length; i++) {
                    curso.modulos[i].sequencia = i + 2;
                    await (curso.modulos[i]).save();
                }
            }
            await modulo.save();

            return { success: modulo.$isPersisted, obj: modulo };
        }
    }

    public async editar({ request, params }) {
        let req = request.body();

        let curso = (await Curso.query()
            .where('id', req.body.cod_curso).whereNull('cancelado_em')
            .where('cod_instrutor', req.usuario.instrutor[0].id).preload('modulos', q => {
                q.whereNull('cancelado_em').orderBy('sequencia')
            }))[0];

        if (curso) {
            let modulo = (await Modulo.query().where('id', params.id).whereNull('cancelado_em').where('cod_curso', curso.id))[0];

            if (modulo) {

                modulo.nome = req.body.nome;

                let novaSeq = req.body.sequencia;
                if (novaSeq > curso.modulos.length)
                    novaSeq = curso.modulos.length;


                if (modulo.sequencia < novaSeq) {
                    for (let i = modulo.sequencia - 1; i < novaSeq; i++) {
                        curso.modulos[i].sequencia = i;
                        await (curso.modulos[i]).save();
                    }
                } else if (modulo.sequencia > novaSeq) {
                    for (let i = novaSeq - 1; i < modulo.sequencia; i++) {
                        curso.modulos[i].sequencia = i + 2
                        await (curso.modulos[i]).save();
                    }
                }
                modulo.sequencia = novaSeq;

                await modulo.save();

                return { success: modulo.$isPersisted, obj: modulo };
            }
            else
                return { success: false, obj: 'Curso não encontrado' };
        }
    }

    public async deletar({ request, params }) {
        let req = request.body();

        let curso = (await Curso.query()
            .where('id', params.curso).whereNull('cancelado_em')
            .where('cod_instrutor', req.usuario.instrutor[0].id).preload('modulos', q => {
                q.whereNull('cancelado_em').orderBy('sequencia')
            }))[0];

        if (curso) {
            let modulo = (await Modulo.query().where('id', params.id).whereNull('cancelado_em').where('cod_curso', curso.id))[0];

            if (modulo) {

                modulo.cancelado_em = DateTime.now();

                for (let i = modulo.sequencia; i < curso.modulos.length; i++) {
                    curso.modulos[i].sequencia = i;
                    await (curso.modulos[i]).save();
                }


                await modulo.save();

                return { success: modulo.$isPersisted, obj: modulo };
            }
            else
                return { success: false, obj: 'Modulo não encontrado' };
        }
    }
}