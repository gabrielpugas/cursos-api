import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'cursos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nome')
      table.string('cod_hotmart')
      table.integer('cod_instrutor').defaultTo(null).unsigned()//.references('id').inTable('instrutors').onDelete('CASCADE')
      table.timestamp('criado_em', {useTz:true})
      table.timestamp('cancelado_em', {useTz:true}).defaultTo(null).nullable();
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
