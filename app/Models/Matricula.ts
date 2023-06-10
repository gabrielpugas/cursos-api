import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario';
import Aluno from './Aluno';
import Curso from './Curso';
import Visualizacao from './Visualizacao';

export default class Matricula extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({serializeAs:null})
  public cod_aluno:number;

  @belongsTo(() => Aluno, {foreignKey:'cod_aluno'})
  public aluno: BelongsTo<typeof Aluno>;

  @column({serializeAs:null})
  public cod_curso:number;

  @belongsTo(() => Curso, {foreignKey:'cod_curso'})
  public curso: BelongsTo<typeof Curso>;

  @column({serializeAs:null})
  public criado_por:number;

  @belongsTo(()=>Usuario, {foreignKey:'criado_por'})
  public criadoPor: BelongsTo<typeof Usuario>

  @column.dateTime({ autoCreate: true })
  public criado_em: DateTime

  @column({serializeAs:null})
  public cancelado_por:number;

  @belongsTo(()=>Usuario, {foreignKey:'cancelado_por'})
  public canceladoPor: BelongsTo<typeof Usuario>

  @column.dateTime()
  public cancelado_em: DateTime

  @hasMany(()=>Visualizacao, {foreignKey:'cod_matricula'})
  public visualizacoes:HasMany<typeof Visualizacao>
}
