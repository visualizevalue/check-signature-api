import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Account from 'App/Models/Account'
import Signature from 'App/Models/Signature'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import BaseController from './BaseController'
import CID from 'App/Services/CID'

const signatureSchema = schema.create({
  signer: schema.string([rules.address()]),
  signature: schema.string(),
  subjects: schema.array().members(schema.string([rules.address()])),
  action: schema.string(),
  object: schema.string(),
})

export default class SignaturesController extends BaseController {

  public async create({ request }: HttpContextContract) {
    const data = await request.validate({ schema: signatureSchema })

    const cid = await CID.getJsonCID(data)

    return await Signature.updateOrCreate({ cid: cid.toString() }, data)
  }

  public async forAccount({ params, request }: HttpContextContract) {
    let account = await Account.byId(params.account).first()
    const {
      page = 1,
      limit = 24,
    } = request.qs()

    if (! account) {
      account = await Account.create({ address: params.account })
    }

    const query = Signature.query().where('signer', account.address)

    query.orderBy('created_at', 'desc')

    return query.paginate(page, limit)
  }

  public async list({ request }: HttpContextContract) {
    const {
      page = 1,
      limit = 24,
      filters = {},
    } = request.qs()

    const query = Signature.query().preload('signerAccount')

    this.applyFilters(query, filters)

    query.orderBy('created_at', 'desc')

    return query.paginate(page, limit)
  }

  public async show({ params }: HttpContextContract) {
    return Signature.byId(params.cid).firstOrFail()
  }

}
