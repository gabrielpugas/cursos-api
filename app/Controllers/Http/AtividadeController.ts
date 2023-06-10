import Atividade from "App/Models/Atividade";
import Aula from "App/Models/Aula";
import { DateTime } from "luxon";

export default class AtividadeController {
    public async get({ params, request }) {
        let atividade = await Atividade.query()
            .preload('opcoes', q => q.whereNull('cancelado_em'))
            .whereHas('aula', q => {
                q.where('id', params.id);
                q.whereNull('cancelado_em');
                q.whereHas('modulo', q =>
                    q.whereNull('cancelado_em')
                        .whereHas('curso', q => q.whereNull('cancelado_em')
                            .where('cod_instrutor', request.body().usuario.instrutor[0].id)))
            }).whereNull('cancelado_em').orderBy('sequencia');
        return { success: atividade.length > 0, obj: atividade };
    }

    public async criar({ request }) {
        let req = request.body();
        let aula = (await Aula.query().preload('atividades', q =>
            q.whereNull('cancelado_em').
                orderBy('sequencia')
        )
            .where('id', req.body.cod_aula)
            .whereNull('cancelado_em')
            .whereHas('modulo', q =>
                q.whereNull('cancelado_em')
                    .whereHas('curso', q => q.whereNull('cancelado_em')
                        .where('cod_instrutor', req.usuario.instrutor[0].id))))[0];
        if (aula) {
            let atividade = new Atividade();
            atividade.cod_aula = aula.id;
            atividade.pergunta = req.body.pergunta;
            atividade.sequencia = req.body.sequencia;

            if (atividade.sequencia > aula.atividades.length + 1)
                atividade.sequencia = aula.atividades.length + 1;

            if (atividade.sequencia < aula.atividades.length + 1) {
                let i = atividade.sequencia - 1;
                for (i; i < aula.atividades.length; i++) {
                    aula.atividades[i].sequencia = i + 2;
                    await (aula.atividades[i]).save();
                }
            }

            await atividade.save();

            return { success: atividade.$isPersisted, obj: atividade }
        } else {
            return { success: false, obj: 'Acesso negado!' };
        }
    }

    public async editar({ request, params }) {
        let req = request.body();

        let atividade = (await Atividade.query()
            .where('id', params.id)
            .preload('opcoes', q => q.whereNull('cancelado_em'))
            .whereHas('aula', q => {
                q.whereNull('cancelado_em');
                q.whereHas('modulo', q =>
                    q.whereNull('cancelado_em')
                        .whereHas('curso', q => q.whereNull('cancelado_em')
                            .where('cod_instrutor', req.usuario.instrutor[0].id)))
            }).whereNull('cancelado_em').orderBy('sequencia'))[0];

        if (atividade) {
            let aula = (await Aula.query()
                .where('id', req.body.cod_aula)
                .preload('atividades', q =>
                    q.whereNull('cancelado_em')
                        .orderBy('sequencia')))[0];

            atividade.pergunta = req.body.pergunta;

            let novaSeq = req.body.sequencia;
            if (novaSeq > aula.atividades.length)
                novaSeq = aula.atividades.length;

            if (atividade.sequencia < novaSeq) {
                for (let i = atividade.sequencia - 1; i < novaSeq; i++) {
                    aula.atividades[i].sequencia = i;
                    await (aula.atividades[i]).save();
                }
            } else if (atividade.sequencia > novaSeq) {
                for (let i = novaSeq - 1; i < atividade.sequencia; i++) {
                    aula.atividades[i].sequencia = i + 2
                    await (aula.atividades[i]).save();
                }
            }
            atividade.sequencia = novaSeq;

            await atividade.save();

            return { success: atividade.$isPersisted, obj: atividade }

        } else
            return { success: false, obj: 'Atividade não encontrada' }
    }

    public async deletar({ request, params }) {
        let req = request.body();

        let atividade = (await Atividade.query()
            .where('id', params.id)
            .preload('opcoes', q => q.whereNull('cancelado_em'))
            .whereHas('aula', q => {
                q.whereNull('cancelado_em');
                q.whereHas('modulo', q =>
                    q.whereNull('cancelado_em')
                        .whereHas('curso', q => q.whereNull('cancelado_em')
                            .where('cod_instrutor', req.usuario.instrutor[0].id)))
            }).whereNull('cancelado_em').orderBy('sequencia'))[0];

        if (atividade) {
            let aula = (await Aula.query()
                .where('id', atividade.cod_aula)
                .preload('atividades', q =>
                    q.whereNull('cancelado_em')
                        .orderBy('sequencia')))[0];

            atividade.cancelado_em = DateTime.now();

            for (let i = atividade.sequencia; i < aula.atividades.length; i++) {
                aula.atividades[i].sequencia = i;
                await (aula.atividades[i]).save();
            }

            await atividade.save();

            return { success: atividade.$isPersisted, obj: atividade }

        } else
            return { success: false, obj: 'Atividade não encontrada' }
    }
}