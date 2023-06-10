import Aula from "App/Models/Aula";
import Modulo from "App/Models/Modulo";
import Visualizacao from "App/Models/Visualizacao";
import ImageKit from "imagekit";
import { DateTime } from "luxon";


const imagekit = new ImageKit({
    urlEndpoint: "https://ik.imagekit.io/pugascursos",
    publicKey: "public_9NM+XLBChFAPYWaBaxTSwn5M8KQ=",
    privateKey: "private_lhenqPmn7Jn2zE2hSM39jdc8wo8="
})

export default class AulaController {
    public async criar({ request }) {
        let req = request.body();
        let modulo = (await Modulo.query()
            .where('id', req.body.cod_modulo)
            .whereHas('curso', q => {
                q.where('cod_instrutor', req.usuario.instrutor[0].id);
                q.whereNull('cancelado_em');
            }).whereNull('cancelado_em').preload('aulas', q => q.whereNull('cancelado_em').orderBy('sequencia')))[0];

        if (modulo) {
            let aula = new Aula();
            aula.nome = req.body.nome;
            aula.descricao = req.body.descricao;
            aula.sequencia = req.body.sequencia;
            aula.cod_modulo = req.body.cod_modulo;

            if (aula.sequencia > modulo.aulas.length + 1)
                aula.sequencia = modulo.aulas.length + 1;

            if (aula.sequencia < modulo.aulas.length + 1) {
                let i = aula.sequencia - 1;
                for (i; i < modulo.aulas.length; i++) {
                    modulo.aulas[i].sequencia = i + 2;
                    await (modulo.aulas[i]).save();
                }
            }

            await aula.save();

            if (aula.$isPersisted)
                return { success: true, obj: aula };
            return { success: false, obj: 'Falha na inclusão' };


        } else
            return { success: false, obj: 'Modulo não encontrado' }
    }

    public async get({ request, params }) {
        let req = request.body();

        let aula = (await Aula.query()
            .where('id', params.id)
            .whereHas('modulo', q =>
                q.whereHas('curso', q =>
                    q.where('cod_instrutor', req.usuario.instrutor[0].id)
                        .whereNull('cancelado_em')
                ).whereNull('cancelado_em'))
            .whereNull('cancelado_em')
            .whereNull('cancelado_em'))[0];

        return { success: aula != undefined, obj: aula };
    }

    public async editar({ request, params }) {
        let req = request.body();

        let aula = (await Aula.query()
            .where('id', params.id)
            .whereHas('modulo', q =>
                q.whereHas('curso', q =>
                    q.where('cod_instrutor', req.usuario.instrutor[0].id)
                        .whereNull('cancelado_em')
                ).whereNull('cancelado_em'))
            .whereNull('cancelado_em')
            .whereNull('cancelado_em'))[0];

        if (aula) {
            aula.nome = req.body.nome;
            aula.descricao = req.body.descricao;

            let modulo = (
                await Modulo.query()
                    .where('id', aula.cod_modulo)
                    .preload('aulas', q => q.whereNull('cancelado_em').orderBy('sequencia'))
            )[0];

            let novaSeq = req.body.sequencia;
            if (novaSeq > modulo.aulas.length)
                novaSeq = modulo.aulas.length;

            if (aula.sequencia < novaSeq) {
                for (let i = aula.sequencia - 1; i < novaSeq; i++) {
                    modulo.aulas[i].sequencia = i;
                    await (modulo.aulas[i]).save();
                }
            } else if (aula.sequencia > novaSeq) {
                for (let i = novaSeq - 1; i < aula.sequencia; i++) {
                    modulo.aulas[i].sequencia = i + 2
                    await (modulo.aulas[i]).save();
                }
            }
            aula.sequencia = novaSeq;

            await aula.save();

            if (aula.$isPersisted)
                return { success: true, obj: aula }
            return { success: false }
        }
    }

    public async deletar({ request, params }) {
        let req = request.body();

        let aula = (await Aula.query()
            .where('id', params.id)
            .whereHas('modulo', q =>
                q.whereHas('curso', q =>
                    q.where('cod_instrutor', req.usuario.instrutor[0].id)
                        .whereNull('cancelado_em')
                ).whereNull('cancelado_em'))
            .whereNull('cancelado_em')
            .whereNull('cancelado_em'))[0];

        if (aula) {
            let modulo = (
                await Modulo.query()
                    .where('id', aula.cod_modulo)
                    .preload('aulas', q => q.whereNull('cancelado_em').orderBy('sequencia'))
            )[0];

            aula.cancelado_em = DateTime.now();

            for (let i = aula.sequencia; i < modulo.aulas.length; i++) {
                modulo.aulas[i].sequencia = i;
                await (modulo.aulas[i]).save();
            }

            await aula.save();

            if (aula.$isPersisted)
                return { success: true, obj: aula }
            return { success: false }
        }
    }

    public async salvarImagem({ request }) {

        let aula = (await Aula.query().whereNull('cancelado_em').whereHas('modulo', q => {
            q.whereNull('cancelado_em').whereHas('curso', q => {
                q.whereNull('cancelado_em').whereHas('instrutor', q => {
                    q.whereNull('cancelado_em').where('id', request.body().usuario.instrutor[0].id)
                })
            })
        }).where('id', request.body().body.cod_aula))[0];

        if (aula) {

            if (aula.url_thumbnail != null) {
                imagekit.listFiles({
                    searchQuery: 'name="' + aula.url_thumbnail.substring(1) + '"'
                }, function (error, result) {
                    if (error) console.log(error);
                    else {
                        imagekit.deleteFile(result[0].fileId, function (error) {
                            if (error) console.log(error);
                        });
                    };
                });
            }

            aula.url_thumbnail = request.body().body.url_thumbnail;
            await aula.save();
            return { success: aula.$isPersisted, obj: aula.url_thumbnail };
        }
        return { success: false, obj: null };
    }

    public async salvarVideo({ request }) {

        let aula = (await Aula.query().whereNull('cancelado_em').whereHas('modulo', q => {
            q.whereNull('cancelado_em').whereHas('curso', q => {
                q.whereNull('cancelado_em').whereHas('instrutor', q => {
                    q.whereNull('cancelado_em').where('id', request.body().usuario.instrutor[0].id)
                })
            })
        }).where('id', request.body().body.cod_aula))[0];

        if (aula) {

            if (aula.url_video != null) {
                imagekit.listFiles({
                    searchQuery: 'name="' + aula.url_video.substring(1) + '"'
                }, function (error, result) {
                    if (error) console.log(error);
                    else {
                        imagekit.deleteFile(result[0].fileId, function (error) {
                            if (error) console.log(error);
                        });
                    };
                });
            }

            aula.url_video = request.body().body.url_video;
            await aula.save();
            return { success: aula.$isPersisted, obj: aula.url_video };
        }
        return { success: false, obj: null };
    }

    public async getVisualizacoes({ params }) {
        let visualizacoes = (await Visualizacao.query().where('cod_aula', params.id)
            .preload('matricula', q => {
                q.preload('aluno', q=>{
                    q.preload('usuario')
                })
            }));
        return { obj: visualizacoes };
    }
}