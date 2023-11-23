import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Account from 'App/Models/Account'
import { isAddress } from 'ethers'

export default class AccountsController {

  public async show({ params, response }: HttpContextContract) {
    const account = await Account.byId(params.account).first()

    if (! account) {
      return isAddress(params.account)
        ? await Account.create({ address: params.account })
        : response.notFound()
    }

    account.updateNames()

    return account
  }

}
