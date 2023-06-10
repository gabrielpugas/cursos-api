import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'token_senhas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('cod_usuario').unsigned().references('id').inTable('usuarios');
      table.string('token').unique();
      
      table.timestamp('criado_em', { useTz: true })
      table.timestamp('usado_em', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
