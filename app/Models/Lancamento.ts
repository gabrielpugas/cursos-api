import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Aula from './Aula';

export default class Lancamento extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({serializeAs:null})
  public cod_aula:number;

  @column.dateTime({ autoCreate: true })
  public criado_em: DateTime

  @column.dateTime()
  public cancelado_em: DateTime

  @belongsTo(() => Aula, {foreignKey:'cod_aula'})
  public aula : BelongsTo<typeof Aula>;
}
