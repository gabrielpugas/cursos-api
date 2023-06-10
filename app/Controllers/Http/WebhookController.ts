import Mail from "@ioc:Adonis/Addons/Mail";
import Aluno from "App/Models/Aluno";
import Curso from "App/Models/Curso";
import Matricula from "App/Models/Matricula";
import Usuario from "App/Models/Usuario";

export default class OpcaoController {
    public async processar({ request }) {
        function makeid(length) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        let data = request.input('data');
        let prod;
        if(data){
            if(data.product.id != 0){
                prod = (await Curso.query().whereNull('cancelado_em').where('cod_hotmart', data.product.id))[0];
                if(prod){
                    let buyer = data.buyer;
                    let usuario = (await Usuario.query().where('email', buyer.email))[0];
                    if(!usuario){
                        usuario = new Usuario();
                        usuario.nome = buyer.name;
                        usuario.email = buyer.email;
                        usuario.telefone = buyer.checkout_phone;
                        let senha = makeid(15);
                        usuario.setSenha(senha);

                        await usuario.save();

                        await Mail.sendLater((message) => {
                            message
                                .from('no-reply@cursos.pugastrader.com.br')
                                .to(usuario.email)
                                .subject('Pugas Cursos - Bem-vindo!')
                                .htmlView('emails/primeiro_acesso', { usuario, senha, perfil:"Aluno" })
                        });
                    }

                    await usuario.load('aluno', q => {q.whereNull('cancelado_em')});
                    if(usuario.aluno.length == 0){
                        let aluno = new Aluno();
                        aluno.cod_usuario = usuario.id;
                        await aluno.save();

                        await usuario.load('aluno', q => {q.whereNull('cancelado_em')});
                    }

                    let matricula = (await Matricula.query().where('cod_aluno', usuario.aluno[0].id).where('cod_curso', prod.id).whereNull('cancelado_em'))[0];
                    if(!matricula){
                        matricula = new Matricula();
                        matricula.cod_aluno = usuario.aluno[0].id;
                        matricula.cod_curso = prod.id;
                        await matricula.save();

                        if(matricula.$isPersisted){
                            await Mail.sendLater((message) => {
                                message
                                    .from('no-reply@cursos.pugastrader.com.br')
                                    .to(usuario.email)
                                    .subject('Pugas Cursos - Nova Matrícula!')
                                    .htmlView('emails/nova_matricula', { usuario, curso: prod })
                            });
                        }
                    }
                }
            }
        }
    }
}