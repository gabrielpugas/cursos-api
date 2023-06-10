import Aula from "App/Models/Aula";
import Lancamento from "App/Models/Lancamento";
import Modulo from "App/Models/Modulo";
import { DateTime } from "luxon";

export default class LancamentoController {
    public async aula({ request, params }) {
        let aula = (await Aula.query().whereNull('cancelado_em').whereHas('modulo', q => {
            q.whereNull('cancelado_em').whereHas('curso', q => {
                q.whereNull('cancelado_em').whereHas('instrutor', q => {
                    q.whereNull('cancelado_em').where('id', request.body().usuario.instrutor[0].id);
                })
            })
        }).where('id', params.id).whereDoesntHave('lancamento', q => q.whereNull('cancelado_em')))[0];

        if (aula) {
            let lancamento = new Lancamento();
            lancamento.cod_aula = params.id;

            await lancamento.save();
            return { success: lancamento.$isPersisted };
        } else {
            return { success: false };
        }
    }

    public async removerAula({ request, params }) {
        let aula = (await Aula.query().whereNull('cancelado_em').whereHas('modulo', q => {
            q.whereNull('cancelado_em').whereHas('curso', q => {
                q.whereNull('cancelado_em').whereHas('instrutor', q => {
                    q.whereNull('cancelado_em').where('id', request.body().usuario.instrutor[0].id);
                })
            })
        }).where('id', params.id).whereHas('lancamento', q => q.whereNull('cancelado_em')))[0];

        if (aula) {
            let lancamento = (await Lancamento.query().where('cod_aula', params.id).whereNull('cancelado_em'))[0];
            lancamento.cancelado_em = DateTime.now();

            await lancamento.save();
            return { success: lancamento.$isPersisted };
        } else {
            return { success: false };
        }
    }

    public async modulo({request, params}){
        let aulas = (await Aula.query().whereNull('cancelado_em').whereHas('modulo', q => {
            q.where('id', params.id).whereNull('cancelado_em').whereHas('curso', q => {
                q.whereNull('cancelado_em').whereHas('instrutor', q => {
                    q.whereNull('cancelado_em').where('id', request.body().usuario.instrutor[0].id);
                })
            })
        }).whereDoesntHave('lancamento', q => q.whereNull('cancelado_em')));

        for (let i = 0; i < aulas.length; i++){ 
            let lancamento = new Lancamento();
            lancamento.cod_aula = aulas[i].id;

            await lancamento.save();
        }

        return { success : aulas.length > 0};
    }

    public async removerModulo({ request, params }) {
        let aulas = (await Aula.query().whereNull('cancelado_em').whereHas('modulo', q => {
            q.where('id', params.id).whereNull('cancelado_em').whereHas('curso', q => {
                q.whereNull('cancelado_em').whereHas('instrutor', q => {
                    q.whereNull('cancelado_em').where('id', request.body().usuario.instrutor[0].id);
                })
            })
        }).whereHas('lancamento', q => q.whereNull('cancelado_em')));

        for (let i = 0; i < aulas.length; i++){ 
            let lancamento = (await Lancamento.query().where('cod_aula', aulas[i].id).whereNull('cancelado_em'))[0];
            lancamento.cancelado_em = DateTime.now();

            await lancamento.save();
        } 
        return { success : aulas.length > 0};
    }

    public async getStatusModulo({params}){
        let modulo = (await Modulo.query().where('id', params.id).preload('aulas', q=>q.whereNull('cancelado_em')))[0];
        for(let i = 0; i<modulo.aulas.length; i++)
            await modulo.aulas[i].load('lancamento', q=>q.whereNull('cancelado_em'));
        return {success: true, obj: modulo.status};
    }
}