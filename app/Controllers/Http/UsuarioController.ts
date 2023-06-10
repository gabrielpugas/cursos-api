import Usuario from "App/Models/Usuario";
import { DateTime } from "luxon";
import Administrador from "App/Models/Administrador";
import Aluno from "App/Models/Aluno";
import Instrutor from "App/Models/Instrutor";
import Mail from "@ioc:Adonis/Addons/Mail";
import ImageKit from "imagekit";
import TokenSenha from "App/Models/TokenSenha";

const imagekit = new ImageKit({
    urlEndpoint: "https://ik.imagekit.io/pugascursos",
    publicKey: "public_9NM+XLBChFAPYWaBaxTSwn5M8KQ=",
    privateKey: "private_lhenqPmn7Jn2zE2hSM39jdc8wo8="
})

export default class UsuarioController {
    public async get({ request }) {
        let usuario = (await Usuario.query().where('id', request.body().usuario.id).preload('admin', q =>
            q.whereNull('cancelado_em')
        ).preload('aluno', q =>
            q.whereNull('cancelado_em')
        ).preload('instrutor', q =>
            q.whereNull('cancelado_em'))
        )[0];
        return { success: true, obj: usuario }
    }

    public async editar({ request }) {
        let req = request.body();

        let usuario = (await Usuario.query().where('id', request.body().usuario.id))[0];

        usuario.nome = req.body.nome;
        usuario.email = req.body.email;
        usuario.telefone = req.body.telefone;

        await usuario.save();

        return { success: usuario.$isPersisted }
    }

    public async criar({ request }) {
        function makeid(length) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
            return result;
        }

        let usuario = new Usuario();
        let body = request.body();


        let conf = (await Usuario.query().where('email', body.body.email))[0];
        if (conf)
            return { success: false, obj: 'E-mail já cadastrado' }


        usuario.nome = body.body.nome;
        usuario.email = body.body.email;
        let senha = makeid(15);
        usuario.setSenha(senha)//senha;//body.body.senha;
        usuario.telefone = body.body.telefone ? body.body.telefone : '';
        usuario.criado_por = body.usuario.admin[0].id;

        await usuario.save();
        if (usuario.$isPersisted) {

            await usuario.load('criadoPor');
            await usuario.criadoPor.load('usuario');


            let al: Aluno = new Aluno();
            let ins: Instrutor = new Instrutor();
            let ad: Administrador = new Administrador();
            let perfil = '';

            switch (body.body.perfil) {
                case 'Al':
                    al = new Aluno();
                    al.cod_usuario = usuario.id;
                    al.criado_por = body.usuario.admin[0].id;
                    perfil = 'Aluno';

                    await al.save();

                    usuario.load('aluno', q => q.whereNull('cancelado_em'));
                    break;
                case 'In':
                    ins = new Instrutor();
                    ins.cod_usuario = usuario.id;
                    ins.criado_por = body.usuario.admin[0].id;
                    perfil = 'Instrutor';

                    await ins.save();

                    usuario.load('instrutor', q => q.whereNull('cancelado_em'));
                    break;
                case 'Ad':
                    ad = new Administrador();
                    ad.cod_usuario = usuario.id;
                    ad.criado_por = body.usuario.admin[0].id;
                    perfil = 'Administrador';

                    await ad.save();

                    usuario.load('admin', q => q.whereNull('cancelado_em'));
                    break;
            }

            await Mail.sendLater((message) => {
                message
                    .from('no-reply@cursos.pugastrader.com.br')
                    .to(usuario.email)
                    .subject('Pugas Cursos - Bem-vindo!')
                    .htmlView('emails/primeiro_acesso', { usuario, senha, perfil })
            })

        }
        return {
            success: usuario.$isPersisted, obj: { usuario, senha }
        };
    }

    public async deletar({ params, request }) {
        let usuario = await Usuario.findOrFail(params.id);
        usuario.cancelado_em = DateTime.now();
        usuario.cancelado_por = request.body().usuario.admin[0].id;
        await usuario.save();

        let admin = await Administrador.query().where('cod_usuario', params.id).whereNull('cancelado_em');
        for (let i = 0; i < admin.length; i++) {
            admin[i].cancelado_em = DateTime.now();
            admin[i].cancelado_por = request.body().usuario.admin[0].id;
            await admin[i].save();
        }
        let aluno = await Aluno.query().where('cod_usuario', params.id).whereNull('cancelado_em');
        for (let i = 0; i < aluno.length; i++) {
            aluno[i].cancelado_em = DateTime.now();
            aluno[i].cancelado_por = request.body().usuario.admin[0].id;
            await aluno[i].save();
        }
        let instrutor = await Instrutor.query().where('cod_usuario', params.id).whereNull('cancelado_em');
        for (let i = 0; i < instrutor.length; i++) {
            instrutor[i].cancelado_em = DateTime.now();
            instrutor[i].cancelado_por = request.body().usuario.admin[0].id;
            await instrutor[i].save();
        }

        return {
            success: usuario.$isPersisted
        };
    }

    public async getAll() {
        async function loadRelations(obj: Usuario) {
            if (obj.criado_por != null) {
                await obj.load('criadoPor');
                await obj.criadoPor.load('usuario');
            }
            if (obj.cancelado_por != null) {
                await obj.load('canceladoPor');
                await obj.canceladoPor.load('usuario');
            }
            await obj.load('admin', q => {
                q.whereNull('cancelado_em')
            });
            await obj.load('aluno', q => {
                q.whereNull('cancelado_em')
            });
            await obj.load('instrutor', q => {
                q.whereNull('cancelado_em')
            });
        }

        let usuarios = await Usuario.all();

        for (let i = 0; i < usuarios.length; i++) {
            await loadRelations(usuarios[i]);
        }

        return { success: true, obj: usuarios };
    }

    public async login({ auth, request }) {
        const email = request.input('email')
        const password = request.input('senha')
        const acesso = request.input('perfil')

        // Lookup user manually
        const user = await Usuario
            .query()
            .where('email', email)
            .whereNull('cancelado_em')
            .first()

        if (user == null)
            return { success: false, obj: 'Usuário não encontrado' };

        // Verify password
        if (! await user.checkSenha(password)) {
            return { success: false, obj: 'Usuário não encontrado' };
        }

        let err = false;

        switch (acesso) {
            case 'Al':
                await user.load('aluno', q => {
                    q.whereNull('cancelado_em')
                });

                if (user.aluno.length == 0)
                    err = true;

                break;
            case 'Ad':
                await user.load('admin', q => {
                    q.whereNull('cancelado_em')
                });

                if (user.admin.length == 0)
                    err = true;

                break;
            case 'In':
                await user.load('instrutor', q => {
                    q.whereNull('cancelado_em')
                })

                if (user.instrutor.length == 0)
                    err = true;
        }

        if (err) {
            return { success: false, obj: 'Usuário não encontrado' };
        }

        // Generate token
        const token = await auth.use('api').generate(user, {
            expiresIn: '1 day'
        });

        return {
            success: true,
            obj: {
                usuario: {
                    ...(user.serialize()),
                    token: token.token
                }
            }
        }

    }

    public async concederAcesso({ request }) {
        let body = request.body();
        let acesso: Administrador | Aluno | Instrutor | null = null;
        let check: Administrador[] | Aluno[] | Instrutor[] = [];

        let perfil = '';

        switch (body.body.tipo) {
            case 'admin':
                perfil = 'Administrador';
                check = await Administrador.query().
                    where('cod_usuario', body.body.cod_usuario).whereNull('cancelado_em');
                if (check.length == 0)
                    acesso = new Administrador();
                break;
            case 'aluno':
                perfil = 'Aluno';
                check = await Aluno.query().
                    where('cod_usuario', body.body.cod_usuario).whereNull('cancelado_em');
                if (check.length == 0)
                    acesso = new Aluno();
                break;
            case 'instrutor':
                perfil = 'Instrutor';
                check = await Instrutor.query().
                    where('cod_usuario', body.body.cod_usuario).whereNull('cancelado_em');
                if (check.length == 0)
                    acesso = new Instrutor();
        }
        if (acesso != null) {
            acesso.cod_usuario = body.body.cod_usuario;
            acesso.criado_por = body.usuario.admin[0].id;

            await acesso.save();
            let out = acesso.$isPersisted;

            if (out) {
                let u = (await Usuario.query().where('id', body.body.cod_usuario).whereNull('cancelado_em'))[0];
                await Mail.sendLater(message => {
                    message
                        .from('no-reply@cursos.pugastrader.com.br')
                        .to(u.email)
                        .subject('Pugas Cursos - Alteração de Perfil de Acesso')
                        .htmlView('emails/novo-perfil', { usuario: u, perfil })
                })
            }

            return { success: out };
        } else
            return { success: false };
    }

    public async revogarAcesso({ params, request }) {
        let body = request.body();
        let acesso: Administrador | Aluno | Instrutor | null = null;

        let perfil = '';
        switch (params.acesso) {
            case 'admin':
                perfil = 'Administrador';
                acesso = await Administrador.query().
                    where('cod_usuario', params.id).whereNull('cancelado_em').first();
                break;
            case 'aluno':
                perfil = 'Aluno';
                acesso = await Aluno.query().
                    where('cod_usuario', params.id).whereNull('cancelado_em').first();
                break;
            case 'instrutor':
                perfil = 'Instrutor';
                acesso = await Instrutor.query().
                    where('cod_usuario', params.id).whereNull('cancelado_em').first();
        }
        if (acesso != null) {
            acesso.cancelado_por = body.usuario.admin[0].id;
            acesso.cancelado_em = DateTime.now();

            await acesso.save();
            let out = acesso.$isPersisted;

            if (out) {
                let u = (await Usuario.query().where('id', params.id).whereNull('cancelado_em'))[0];
                await Mail.sendLater(message => {
                    message
                        .from('no-reply@cursos.pugastrader.com.br')
                        .to(u.email)
                        .subject('Pugas Cursos - Alteração de Perfil de Acesso')
                        .htmlView('emails/exclusao-perfil', { usuario: u, perfil })
                })
            }

            return { success: out };
        } else
            return { success: false };
    }

    public async trocarSenha({ request }) {
        let usuario = await Usuario.find(request.body().usuario.id);
        let out = false;
        if (usuario) {
            if (await usuario.checkSenha(request.body().body.atual)) {
                usuario.setSenha(request.body().body.nova);

                await usuario.save();
                out = usuario.$isPersisted;
            }
        }

        return { success: out };

    }

    public async salvarFotoPerfil({ request }) {
        let usuario = (await Usuario.find(request.body().usuario.id));
        if (usuario) {

            if (usuario.img_url != '/perfil-padrao.jpg') {
                imagekit.listFiles({
                    searchQuery: 'name="' + usuario.img_url.substring(1) + '"'
                }, function (error, result) {
                    if (error) console.log(error);
                    else {
                        imagekit.deleteFile(result[0].fileId, function (error) {
                            if (error) console.log(error);
                        });
                    };
                });
            }

            usuario.img_url = request.body().body.url == '' ?  '/perfil-padrao.jpg' : request.body().body.url;
            await usuario.save();
            return { success: usuario.$isPersisted, obj: usuario.img_url };
        }
        return { success: false, obj: null };
    }

    public async esqueceuASenha({ request }) {
        let email = request.input('email');
        let usuario = (await Usuario.query().whereNull('cancelado_em').where('email', email))[0];
        if (usuario) {
            let token = new TokenSenha();
            token.cod_usuario = usuario.id;
            await token.save();

            await Mail.sendLater((message) => {
                message
                    .from('no-reply@cursos.pugastrader.com.br')
                    .to(email)
                    .subject('Pugas Cursos - Esqueci minha senha')
                    .htmlView('emails/forgot-password', { usuario, token })
            });

        }
        return { success: true };
    }

    public async restaurarSenha({ request }) {
        let token = (await TokenSenha.query().whereNull('usado_em').where('token', request.input('token')))[0];

        if (token) {
            let usuario = (await Usuario.query().where('id', token.cod_usuario))[0];
            usuario.senha = request.input('senha');
            await usuario.save();
            token.usado_em = DateTime.now();

            await token.save();

            if (usuario.$isPersisted) {
                return { success: true }
            } else
                return { success: false }
        }
        else
            return { success: false }
    }
}
