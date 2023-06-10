import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Matricula from './Matricula'
import Opcao from './Opcao'

export default class Resposta extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({serializeAs:null})
  public cod_matricula:number

  @column({serializeAs:null})
  public cod_opcao:number

  @column()
  public tentativa:number;

  @column.dateTime({ autoCreate: true })
  public criado_em: DateTime

  @belongsTo(() => Matricula, {foreignKey:'cod_matricula'})
  public matricula:BelongsTo<typeof Matricula>

  @belongsTo(() => Opcao, {foreignKey:'cod_opcao'})
  public opcao:BelongsTo<typeof Opcao>
}
