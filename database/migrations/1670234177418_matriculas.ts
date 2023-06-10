import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'matriculas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('cod_curso').defaultTo(null).unsigned()//.references('id').inTable('cursos').onDelete('CASCADE')
      table.integer('cod_aluno').defaultTo(null).unsigned()//.references('id').inTable('alunos').onDelete('CASCADE')
      table.timestamp('criado_em', {useTz:true})
      table.integer('criado_por').defaultTo(null).unsigned()//.references('id').inTable('usuarios').onDelete('CASCADE')
      table.timestamp('cancelado_em', {useTz:true}).defaultTo(null).nullable();
      table.integer('cancelado_por').defaultTo(null).unsigned()//.references('id').inTable('usuarios').onDelete('CASCADE')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
