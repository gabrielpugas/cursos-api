import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'atividades'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('pergunta')
      table.integer('sequencia')
      table.integer('cod_aula').defaultTo(null).unsigned()//.references('id').inTable('aula').onDelete('CASCADE')
      table.timestamp('criado_em', {useTz:true})
      table.timestamp('cancelado_em', {useTz:true}).defaultTo(null).nullable();
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
