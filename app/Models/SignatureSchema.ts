import { DateTime } from 'luxon'
import { BaseModel, HasMany, column, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Signature from 'App/Models/Signature'

export default class SignatureSchema extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column()
  public version: string

  @column()
  public types: object

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @hasMany(() => Signature, {
    foreignKey: 'schema',
  })
  public signerAccount: HasMany<typeof Signature>

}
