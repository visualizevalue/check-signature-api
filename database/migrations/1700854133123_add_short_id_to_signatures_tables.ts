import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'signatures'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('id').index('sig_id')
    })

    // Create the default
    this.defer(async (db) => {
      const sigs = await db.from('signatures').select('*')

      await Promise.all(sigs.map(s =>
        db.from('signatures')
          .where('cid', s.cid)
          .update({ id: s.cid.substring(9, 18) })
        )
      )
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('id')
    })
  }
}
