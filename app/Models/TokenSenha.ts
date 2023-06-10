import { DateTime } from 'luxon'
import { BaseModel, beforeSave, BelongsTo, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Usuario from './Usuario'

export default class TokenSenha extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column({serializeAs:null})
  public cod_usuario:number

  @column()
  public token: string

  @column.dateTime({ autoCreate: true })
  public criado_em: DateTime

  @column.dateTime()
  public usado_em:DateTime

  @beforeSave()
  public static gerarToken(tsenha) {

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    function generateString(length) {
      let result = '';
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }

      return result;
    }


    if (!tsenha.token) {
      tsenha.token = generateString(20);
    }
  }

  @belongsTo(()=>Usuario, {foreignKey:'cod_usuario'})
  public usuario:BelongsTo<typeof Usuario>;
}
