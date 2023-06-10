import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'aulas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('nome')
      table.string('url_thumbnail')
      table.string('url_video')
      table.text('descricao')
      table.integer('cod_modulo').defaultTo(null).unsigned()//.references('id').inTable('modulos').onDelete('CASCADE')
      table.integer('sequencia')
      table.timestamp('criado_em', {useTz:true})
      table.timestamp('cancelado_em', {useTz:true}).defaultTo(null).nullable();
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
