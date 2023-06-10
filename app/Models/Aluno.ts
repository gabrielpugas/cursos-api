import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Administrador from './Administrador';
import Usuario from './Usuario';

export default class Aluno extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column.dateTime({ autoCreate: true })
  public criado_em: DateTime

  @column({serializeAs:null})
  public criado_por: number;

  @belongsTo(() => Administrador,{foreignKey:'criado_por'})
  public criadoPor: BelongsTo<typeof Administrador>;

  @column.dateTime()
  public cancelado_em: DateTime

  @column({serializeAs:null})
  public cancelado_por: number;

  @belongsTo(() => Administrador,{foreignKey:'cancelado_por'})
  public canceladoPor: BelongsTo<typeof Administrador>;

  @column({serializeAs:null})
  public cod_usuario:number;

  @belongsTo(()=>Usuario, {foreignKey:'cod_usuario'})
  public usuario : BelongsTo<typeof Usuario>;
}
