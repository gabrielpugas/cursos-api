import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Administrador from 'App/Models/Administrador'
import Usuario from 'App/Models/Usuario'

export default class extends BaseSeeder {
  public async run() {
    let u = new Usuario();
    u.email = 'admin@a';
    u.nome = 'Admin';
    u.setSenha('admin123');
    await u.save();

    await Administrador.create({
      cod_usuario: u.id
    })
  }
}
