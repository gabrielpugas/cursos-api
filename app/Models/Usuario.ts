import { DateTime } from 'luxon'
import { BaseModel, beforeSave, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Administrador from './Administrador';
import Hash from '@ioc:Adonis/Core/Hash'
import Aluno from './Aluno';
import Instrutor from './Instrutor';
import Comentario from './Comentario';
import TokenSenha from './TokenSenha';

export default class Usuario extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string;

  @column()
  public email: string;

  @column()
  public telefone: string;

  @column.dateTime({ autoCreate: true })
  public criado_em: DateTime

  @column({ serializeAs: null })
  public criado_por: number;

  @belongsTo(() => Administrador, { foreignKey: 'criado_por' })
  public criadoPor: BelongsTo<typeof Administrador>;

  @column.dateTime()
  public cancelado_em: DateTime;

  @column({ serializeAs: null })
  public cancelado_por: number;

  @belongsTo(() => Administrador, { foreignKey: 'cancelado_por' })
  public canceladoPor: BelongsTo<typeof Administrador>;

  @column({ serializeAs: null })
  public senha: string;

  @column()
  public img_url:string;

  @beforeSave()
  public static async hashPassword(user: Usuario) {
    if (user.$dirty.senha) {
      user.setSenha(await Hash.make(user.senha))
    }
  }
  @beforeSave()
  public static async setImgUrl(user: Usuario) {
    if (user.img_url == null) {
      user.img_url = '/perfil-padrao.jpg';
    }
  }

  public setSenha(senha): void {
    this.senha = senha;
  }

  public async checkSenha(check) {
    let out = await Hash.verify(this.senha, check);

    return out;
  }

  @hasMany(() => Aluno, { foreignKey: 'cod_usuario' })
  public aluno: HasMany<typeof Aluno>

  @hasMany(() => Administrador, { foreignKey: 'cod_usuario' })
  public admin: HasMany<typeof Administrador>

  @hasMany(() => Instrutor, { foreignKey: 'cod_usuario' })
  public instrutor: HasMany<typeof Instrutor>

  @hasMany(() => Comentario, { foreignKey: 'cod_usuario' })
  public comentarios: HasMany<typeof Comentario>;

  public async comentar(c) {
    let comentario = new Comentario();

    comentario.comentario = c.comentario;
    comentario.cod_usuario = this.id;
    comentario.cod_aula = c.cod_aula;
    comentario.cod_comentario_pai = null;

    if (c.cod_comentario_pai != null) {
      let pai = (await Comentario.query().where('id', c.cod_comentario_pai).where('cod_aula', c.cod_aula).whereNull('cancelado_em'))[0];
      if (pai)
        comentario.cod_comentario_pai = pai.id;
    }
    await comentario.save();
    if (comentario.$isPersisted) {
      await comentario.load('usuario');
    }
    return { success: comentario.$isPersisted, obj: comentario };
  }

  @hasMany(()=>TokenSenha, {foreignKey:'cod_usuario'})
  public tokens:HasMany<typeof TokenSenha>;
}
