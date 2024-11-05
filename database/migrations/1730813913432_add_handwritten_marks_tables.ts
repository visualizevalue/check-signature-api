import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'handwritten_marks'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('signer')
      table.foreign('signer').references('address').inTable('accounts')

      table.integer('index')
      table.text('path')

      table.timestamp('created_at', { useTz: true })
      table.string('block_number')
      table.string('log_index')
      table.string('tx_hash')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
