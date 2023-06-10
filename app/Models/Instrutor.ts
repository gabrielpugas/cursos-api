import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario';
import Administrador from './Administrador';
import Curso from './Curso';

export default class Instrutor extends BaseModel {
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

  @hasMany(()=>Curso, {foreignKey:'cod_instrutor'})
  public cursos : HasMany<typeof Curso>
}
