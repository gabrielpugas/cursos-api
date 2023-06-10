import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, computed, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Modulo from './Modulo';
import Atividade from './Atividade';
import Lancamento from './Lancamento';
import Comentario from './Comentario';
import Visualizacao from './Visualizacao';

export default class Aula extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string;

  @column()
  public url_thumbnail: string;

  @column()
  public url_video: string;

  @column()
  public descricao: string;

  @column()
  public sequencia: number;

  @column.dateTime({ autoCreate: true })
  public criado_em: DateTime

  @column.dateTime()
  public cancelado_em: DateTime

  @column({serializeAs:null})
  public cod_modulo: number;

  @belongsTo(() => Modulo, {foreignKey:'cod_modulo'})
  public modulo: BelongsTo<typeof Modulo>

  @hasMany(()=>Atividade, {foreignKey:'cod_aula'})
  public atividades: HasMany<typeof Atividade>

  @hasMany(() => Lancamento, {foreignKey:'cod_aula', serializeAs: null})
  public lancamento: HasMany<typeof Lancamento>;

  @computed()
  public get status(){
    if(this.lancamento && this.lancamento.length > 0)
      return 'lancado';
    return 'nao-lancado';
  }

  @hasMany(()=>Visualizacao, {foreignKey:'cod_aula'})
  public visualizacoes:HasMany<typeof Visualizacao>

  @column()
  public assistida : boolean;

  @hasMany(()=>Comentario, {foreignKey: 'cod_aula'})
  public comentarios: HasMany<typeof Comentario>

}
