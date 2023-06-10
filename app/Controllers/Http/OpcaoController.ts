import Atividade from "App/Models/Atividade";
import Opcao from "App/Models/Opcao";
import { DateTime } from "luxon";

export default class OpcaoController {
    public async criar({ request }) {
        let req = request.body();

        let atividade = await Atividade.query()
            .where('id', req.body.cod_atividade).whereNull('cancelado_em')
            .whereHas('aula', q => {
                q.whereNull('cancelado_em');
                q.whereHas('modulo', q => {
                    q.whereNull('cancelado_em');
                    q.whereHas('curso', q => {
                        q.whereNull('cancelado_em');
                        q.where('cod_instrutor', req.usuario.instrutor[0].id)
                    })
                })
            });

        if (atividade) {
            let opcao = new Opcao();
            opcao.texto = req.body.texto;
            opcao.correta = req.body.correta == '' ? false : req.body.correta;
            opcao.cod_atividade = req.body.cod_atividade;

            await opcao.save();
            return { success: opcao.$isPersisted, obj: opcao };
        } else {
            return { success: false, obj: 'Atividade não encontrada' };
        }

    }

    public async editar({ request, params }) {
        let req = request.body();

        let atividade = await Atividade.query()
            .where('id', req.body.cod_atividade).whereNull('cancelado_em')
            .whereHas('aula', q => {
                q.whereNull('cancelado_em');
                q.whereHas('modulo', q => {
                    q.whereNull('cancelado_em');
                    q.whereHas('curso', q => {
                        q.whereNull('cancelado_em');
                        q.where('cod_instrutor', req.usuario.instrutor[0].id)
                    })
                })
            });

        if (atividade) {
            let opcao = await Opcao.find(params.id);
            if (opcao) {
                opcao.texto = req.body.texto;
                opcao.correta = req.body.correta;

                await opcao.save();
                return { success: opcao.$isPersisted, obj: opcao };
            }
            else {
                return { success: false, obj: 'Opção não encontrada' };
            }
        } else {
            return { success: false, obj: 'Atividade não encontrada' };
        }
    }

    public async deletar({request, params}){
        let req = request.body();

        let opcao = (await Opcao.query()
                            .where('id', params.id)
                            .whereNull('cancelado_em')
                            .whereHas('atividade', q=>{
                                q.whereNull('cancelado_em')
                                q.whereHas('aula', q=>{
                                    q.whereNull('cancelado_em')
                                    q.whereHas('modulo', q=>{
                                        q.whereNull('cancelado_em')
                                        q.whereHas('curso', q=>{
                                            q.whereNull('cancelado_em')
                                            q.where('cod_instrutor', req.usuario.instrutor[0].id)
                                        })
                                    })
                                })
                            }))[0];
        if(opcao){
            opcao.cancelado_em = DateTime.now();

            await opcao.save();

            return {success: opcao.$isPersisted, obj: opcao};
        }else{
            return {success: false, obj: "Opção não encontrada"};
        }
    }
}