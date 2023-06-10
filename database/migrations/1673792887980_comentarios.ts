import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'comentarios'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.text('comentario');
      table.integer('cod_usuario').unsigned().references('id').inTable('usuarios');
      table.integer('cod_aula').unsigned().references('id').inTable('aulas');
      table.integer('cod_comentario_pai').unsigned().references('id').inTable('comentarios').defaultTo(null);

      table.timestamp('criado_em', { useTz: true })
      table.timestamp('cancelado_em', { useTz: true }).nullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
