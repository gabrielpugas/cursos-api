import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, computed, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Curso from './Curso';
import Aula from './Aula';

export default class Modulo extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public nome: string;

  @column()
  public sequencia: number;

  @column.dateTime({ autoCreate: true })
  public criado_em: DateTime

  @column.dateTime()
  public cancelado_em: DateTime

  @column({ serializeAs: null })
  public cod_curso: number;

  @belongsTo(() => Curso, { foreignKey: 'cod_curso' })
  public curso: BelongsTo<typeof Curso>;

  @hasMany(() => Aula, { foreignKey: 'cod_modulo' })
  public aulas: HasMany<typeof Aula>;

  @computed()
  public get status() {
    let lancadas = 0;
    let naolancadas = 0;

    if (this.aulas) {

      this.aulas.forEach(aula => {
        if (aula.status == 'lancado')
          lancadas++;
        else
          naolancadas++;
      })

      if (naolancadas == 0 && lancadas > 0)
        return 'lancado';
      if (naolancadas > 0 && lancadas > 0)
        return 'parcial';
      if (lancadas == 0 && naolancadas > 0)
        return 'nao-lancado';
    }
    return 'sem-aulas';
  }
}
