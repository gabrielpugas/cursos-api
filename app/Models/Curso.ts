import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Instrutor from './Instrutor'
import Modulo from './Modulo';
import Matricula from './Matricula';

export default class Curso extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string;

  @column()
  public cod_hotmart: string;

  @column.dateTime({ autoCreate: true })
  public criado_em: DateTime

  @column.dateTime()
  public cancelado_em: DateTime

  @column({ serializeAs: null })
  public cod_instrutor: number;

  @belongsTo(() => Instrutor, { foreignKey: 'cod_instrutor' })
  public instrutor: BelongsTo<typeof Instrutor>;

  @hasMany(() => Modulo, { foreignKey: 'cod_curso' })
  public modulos: HasMany<typeof Modulo>;

  @hasMany(() => Matricula, { foreignKey: 'cod_curso' })
  public matriculas: HasMany<typeof Matricula>

}
