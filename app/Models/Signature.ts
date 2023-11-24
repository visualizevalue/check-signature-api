import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, beforeSave, belongsTo, column } from '@ioc:Adonis/Lucid/Orm'
import Account from './Account'

export default class Signature extends BaseModel {
  @column({ isPrimary: true })
  public cid: string

  @column()
  public id: string

  @column()
  public signer: string

  @column()
  public signature: string

  @column({
    consume: (value: string) => typeof value === 'string' ? JSON.parse(value) : value,
    prepare: (value: any) => Array.isArray(value) ? JSON.stringify(value) : value,
  })
  public subjects: string[]

  @column()
  public action: string

  @column()
  public object: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @belongsTo(() => Account, {
    localKey: 'address',
    foreignKey: 'signer',
  })
  public signerAccount: BelongsTo<typeof Account>

  public shortendCID () {
    this.id = this.cid.substring(9, 18)
    return this
  }

  @beforeSave()
  public static async shortenCID(signature: Signature) {
    signature.shortendCID()
  }

  @beforeSave()
  public static async lowerCaseAddress(signature: Signature) {
    // Lowercase addresses
    signature.signer = signature.signer.toLowerCase()
    signature.subjects = signature.subjects.map(s => s.toLowerCase())

    // Save accounts
    const addresses = [signature.signer, ...signature.subjects]
    await Promise.all(addresses.map(address => Account.updateOrCreate({ address }, {})))
  }

  static byId (id: string) {
    return this.query()
      .where('id', id)
      .orWhere('cid', id)
  }

}
