import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'instrutors'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('cod_usuario').unsigned()//.references('id').inTable('usuarios')
      table.timestamp('criado_em', {useTz:true})
      table.integer('criado_por').defaultTo(null).unsigned()//.references('id').inTable('administradors').onDelete('CASCADE')
      table.timestamp('cancelado_em', {useTz:true}).defaultTo(null).nullable();
      table.integer('cancelado_por').defaultTo(null).unsigned()//.references('id').inTable('administradors').onDelete('CASCADE')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
