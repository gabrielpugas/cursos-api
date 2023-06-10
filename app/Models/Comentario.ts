import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Aula from './Aula';
import Usuario from './Usuario';

export default class Comentario extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public comentario: string;

  @column({ serializeAs: null })
  public cod_usuario: number;

  @column({ serializeAs: null })
  public cod_aula: number;

  @column({ serializeAs: null })
  public cod_comentario_pai: number | null;

  @column.dateTime({ autoCreate: true })
  public criado_em: DateTime

  @column.dateTime()
  public cancelado_em: DateTime

  @belongsTo(() => Aula, { foreignKey: 'cod_aula' })
  public aula: BelongsTo<typeof Aula>;

  @belongsTo(() => Usuario, { foreignKey: 'cod_usuario' })
  public usuario: BelongsTo<typeof Usuario>;

  @belongsTo(() => Comentario, { foreignKey: 'cod_comentario_pai' })
  public comentarioPai: BelongsTo<typeof Comentario>;

  @hasMany(() => Comentario, { foreignKey: 'cod_comentario_pai' })
  public respostas: HasMany<typeof Comentario>;
}
