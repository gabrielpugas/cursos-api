import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Aula from './Aula'
import Opcao from './Opcao'

export default class Atividade extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public pergunta:string

  @column()
  public sequencia:number

  @column.dateTime({ autoCreate: true })
  public criado_em: DateTime

  @column.dateTime()
  public cancelado_em: DateTime

  @column({serializeAs:null})
  public cod_aula: number;

  @belongsTo(() => Aula, {foreignKey:'cod_aula'})
  public aula: BelongsTo<typeof Aula>

  @hasMany(()=>Opcao, {foreignKey:'cod_atividade'})
  public opcoes: HasMany<typeof Opcao>
}
