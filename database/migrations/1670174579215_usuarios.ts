import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'usuarios'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nome', 100).notNullable()
      table.string('email', 100).notNullable().unique()
      table.string('telefone', 13)
      table.string('senha').notNullable()
      table.string('img_url')
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
