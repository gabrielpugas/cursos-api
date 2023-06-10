import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Matricula from './Matricula';
import Aula from './Aula';

export default class Visualizacao extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({serializeAs:null})
  public cod_aula:number;

  @column({serializeAs:null})
  public cod_matricula:number;

  @column.dateTime({ autoCreate: true })
  public criado_em: DateTime

  @belongsTo(()=>Matricula, {foreignKey:'cod_matricula'})
  public matricula:BelongsTo<typeof Matricula>

  @belongsTo(()=>Aula, {foreignKey:'cod_aula'})
  public aula:BelongsTo<typeof Aula>
}
