import { DateTime } from 'luxon'
import Logger from '@ioc:Adonis/Core/Logger'
import { BaseModel, HasMany, beforeSave, column, computed, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Address from 'App/Helpers/Address'
import provider from 'App/Services/RPCProvider'
import Signature from './Signature'

export default class Account extends BaseModel {
  @column({ isPrimary: true })
  public address: string

  @column()
  public ens: string

  @column()
  public data: object

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @computed()
  public get display () {
    if (this.ens) return this.ens

    return Address.short(this.address)
  }

  @hasMany(() => Signature, {
    localKey: 'address',
    foreignKey: 'signer',
  })
  public signatures: HasMany<typeof Signature>

  @beforeSave()
  public static async lowerCaseAddress(account: Account) {
    account.address = account.address.toLowerCase()
  }

  public async updateNames () {
    const timeAgo = Math.floor((Date.now() - +this.updatedAt) / 1000)
    if (timeAgo < 60 * 60 * 24) { // wait for 24 hours between updates
      Logger.info(`Don't update names for ${this.address}, as we've updated them ${timeAgo} seconds ago`)
      return
    }

    await Promise.all([
      this.updateENS(),
    ])

    // Force update updatedAt
    this.updatedAt = DateTime.now()

    try {
      await this.save()
    } catch (e) {
      Logger.error(e)
    }

    return this
  }

  public async updateENS () {
    try {
      this.ens = await provider.lookupAddress(this.address) || ''

      if (this.ens) Logger.info(`ENS for ${this.ens} updated`)
    } catch (e) {
      Logger.error(e)
    }
  }

  static byId (id: string) {
    return this.query()
      .where('address', id.toLowerCase())
      .orWhere('ens', id.toLowerCase())
  }
}
