import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Account from 'App/Models/Account'
import Signature from 'App/Models/Signature'
import { rules, schema } from '@ioc:Adonis/Core/Validator'
import BaseController from './BaseController'
import CID from 'App/Services/CID'
import SignatureSchema from 'App/Models/SignatureSchema'

const signatureSchema = schema.create({
  signer: schema.string([rules.address()]),
  signature: schema.string(),
  subjects: schema.array().members(schema.string([rules.address()])),
  action: schema.string(),
  object: schema.string(),
  schema: schema.object.optional().members({
    name: schema.string(),
    version: schema.string(),
    types: schema.object().anyMembers(),
  }),
})

export default class SignaturesController extends BaseController {

  public async create({ request }: HttpContextContract) {
    const data = await request.validate({ schema: signatureSchema })

    const cid = await CID.getJsonCID(data)

    let schema
    if (data.schema) {
      const payload = { name: data.schema.name, version: data.schema.version, types: data.schema.types }
      schema = await SignatureSchema.firstOrCreate(payload, payload)
    } else {
      schema = await SignatureSchema.findOrFail(1)
    }

    return await Signature.updateOrCreate({ cid: cid.toString() }, { ...data, schema: schema.id })
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

    const query = Signature.query().where('signer', account.address).preload('signatureSchema')

    query.orderBy('created_at', 'desc')

    return query.paginate(page, limit)
  }

  public async list({ request }: HttpContextContract) {
    const {
      page = 1,
      limit = 24,
      filters = {},
      sort = '-created_at',
    } = request.qs()

    const query = Signature.query().preload('signerAccount').preload('signatureSchema')

    this.applyFilters(query, filters)
    this.applySorts(query, sort)

    return query.paginate(page, limit)
  }

  public async show({ params }: HttpContextContract) {
    return Signature.byId(params.cid).preload('signatureSchema').firstOrFail()
  }

}
