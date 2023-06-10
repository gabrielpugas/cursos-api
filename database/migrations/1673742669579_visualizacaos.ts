import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'visualizacaos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('cod_matricula').unsigned().references('id').inTable('matriculas');
      table.integer('cod_aula').unsigned().references('id').inTable('aulas');
      
      table.timestamp('criado_em', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
