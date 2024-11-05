import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import HandwrittenMark from 'App/Models/HandwrittenMark'
import BaseController from './BaseController'

export default class SignaturesController extends BaseController {

  public async list({ request }: HttpContextContract) {
    const {
      page = 1,
      limit = 24,
      filters = {},
      sort = '-created_at',
    } = request.qs()

    const query = HandwrittenMark.query().preload('signerAccount')

    this.applyFilters(query, filters)
    this.applySorts(query, sort)

    return query.paginate(page, limit)
  }

}
