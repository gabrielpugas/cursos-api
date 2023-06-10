import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Atividade from './Atividade'
import Resposta from './Resposta'

export default class Opcao extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public texto:string

  @column()
  public correta:boolean

  @column.dateTime({ autoCreate: true })
  public criado_em: DateTime

  @column.dateTime()
  public cancelado_em: DateTime

  @column({serializeAs:null})
  public cod_atividade: number;

  @belongsTo(() => Atividade, {foreignKey:'cod_atividade'})
  public atividade: BelongsTo<typeof Atividade>

  @hasMany(()=> Resposta, {foreignKey:'cod_opcao'})
  public respostas: HasMany<typeof Resposta>
}
