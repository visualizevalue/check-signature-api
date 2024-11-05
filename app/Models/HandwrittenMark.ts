import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, beforeSave, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Account from 'App/Models/Account'

export default class HandwrittenMark extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public signer: string

  @column()
  public index: number

  @column()
  public path: string

  @column()
  public blockNumber: string

  @column()
  public logIndex: string

  @column()
  public txHash: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @belongsTo(() => Account, {
    localKey: 'address',
    foreignKey: 'signer',
  })
  public signerAccount: BelongsTo<typeof Account>

  @beforeSave()
  public static async lowerCaseAddress(mark: HandwrittenMark) {
    // Lowercase addresses
    mark.signer = mark.signer.toLowerCase()

    // Save accounts
    await Account.updateOrCreate({ address: mark.signer }, {})
  }

  public static async getLast () {
    return HandwrittenMark.query()
      .orderByRaw('block_number::int desc')
      .first()
  }

}
