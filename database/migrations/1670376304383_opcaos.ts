import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'opcaos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('texto')
      table.boolean('correta').defaultTo(false)
      table.integer('cod_atividade').defaultTo(null).unsigned()//.references('id').inTable('atividades').onDelete('CASCADE')
      table.timestamp('criado_em', {useTz:true})
      table.timestamp('cancelado_em', {useTz:true}).defaultTo(null).nullable();
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
