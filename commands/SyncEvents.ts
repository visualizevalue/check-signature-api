import { BaseCommand } from '@adonisjs/core/build/standalone'
import Env from '@ioc:Adonis/Core/Env'
import SignatureRepository from 'App/Services/SignatureRepository';

export default class SyncEvents extends BaseCommand {
  /**
   * Command name is used to run the command
   */
  public static commandName = 'sync:events'

  /**
   * Command description is displayed in the "help" output
   */
  public static description = ''

  public static settings = {
    loadApp: true,
    stayAlive: false,
  }

  public async run() {
    await (await SignatureRepository.initialize(Env.get('SIGNATURE_REPOSITORY_ADDRESS'))).sync()
  }
}
