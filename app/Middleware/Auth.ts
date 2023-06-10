import { AuthenticationException } from '@adonisjs/auth/build/standalone'
import { Exception } from '@adonisjs/core/build/standalone'
import type { GuardsList } from '@ioc:Adonis/Addons/Auth'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Usuario from 'App/Models/Usuario'

export default class AuthMiddleware {
  protected redirectTo = '/login'

  protected async authenticate(auth: HttpContextContract['auth'], guards: (keyof GuardsList)[]) {

    let guardLastAttempted: string | undefined

    for (let guard of guards) {
      guardLastAttempted = guard

      if (await auth.use(guard).check()) {
        auth.defaultGuard = guard
        return true
      }
    }

    throw new AuthenticationException(
      'Unauthorized access',
      'E_UNAUTHORIZED_ACCESS',
      guardLastAttempted,
      this.redirectTo,
    )
  }

  /**
   * Handle request
   */
  public async handle(
    { request, auth }: HttpContextContract,
    next: () => Promise<void>,
    perfil?: string
  ) {

    const guards = [auth.name];
    await this.authenticate(auth, guards)

    await auth.use('api').authenticate()
    let a = auth.use('api');
    let usuario;
    if(a.user)
      usuario = await Usuario.findOrFail(a.user.id);
    let erro = false;

    perfil = perfil?.at(0);

    switch (perfil) {
      case 'aluno':
        await usuario.load('aluno', q => {
          q.whereNull('cancelado_em')
        });
        
        if (usuario.aluno.length == 0)
          erro = true;
        break;
      case 'admin':
        await usuario.load('admin');
        if (usuario.admin.length == 0)
          erro = true;
        break;
      case 'instrutor':
        await usuario.load('instrutor', q => {
          q.whereNull('cancelado_em')
        });
        if (usuario.instrutor.length == 0)
          erro = true;
        break;
    }

    if (erro)
      throw new Exception('Não autorizado!');

    request.updateBody({
      usuario,
      body:request.body()
    });
    
    await next()
  }
}
