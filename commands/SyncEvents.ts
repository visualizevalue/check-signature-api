import { BaseCommand } from '@adonisjs/core/ace'
import env from '@adonisjs/core/services/env'
import SignatureRepository from '../app/Services/SignatureRepository.js'

export default class SyncEvents extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  static commandName = 'sync:events'

  /**
   * Command description is displayed in the "help" output
   */
  static description = ''

  static options = {
    loadApp: true,
    staysAlive: false,
  }

  async run() {
    await (await SignatureRepository.initialize(env.get('SIGNATURE_REPOSITORY_ADDRESS'))).sync()
  }
}
