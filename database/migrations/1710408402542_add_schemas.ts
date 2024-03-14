import BaseSchema from '@ioc:Adonis/Lucid/Schema'
import { DateTime } from 'luxon'

export default class extends BaseSchema {
  protected tableName = 'signature_schemas'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name')
      table.string('version')
      table.jsonb('types')
      table.timestamp('created_at', { useTz: true })
    })

    this.schema.alterTable(`signatures`, table => {
      table.integer('schema').references('id').inTable('signature_schemas')
    })

    this.defer(async db => {
      await db.table('signature_schemas').insert({
        name: 'Notability Check',
        version: '1',
        types: {
          'Notability Check': [
            { name: 'Subject', type: 'address[]' },
            { name: 'Action', type: 'string' },
            { name: 'Object', type: 'string' },
          ],
        },
        created_at: DateTime.now(),
      })

      await db.from('signatures').update({
        schema: 1,
      })
    })
  }

  public async down () {
    this.schema.alterTable(`signatures`, table => {
      table.dropColumn('schema')
    })

    this.schema.dropTable(this.tableName)
  }
}
