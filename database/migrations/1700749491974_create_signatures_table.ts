import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'signatures'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.string('cid').primary()

      table.string('signer')
      table.foreign('signer').references('address').inTable('accounts')

      table.jsonb('subjects').defaultTo('[]')
      table.string('action').index('signatures_action')
      table.string('object')

      table.text('signature')

      table.timestamp('created_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
