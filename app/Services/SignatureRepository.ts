import { ethers } from 'ethers'
import Env from '@ioc:Adonis/Core/Env'
import provider, { getBlockTimestamp } from '../Services/RPCProvider'
import Contract from './Contract'
import Account from 'App/Models/Account'
import HandwrittenMark from 'App/Models/HandwrittenMark'
import { delay } from 'App/Helpers/time'
import abi from 'App/Abis/SignatureRepository'

const EVENTS = ['NewSignature']
const START_BLOCK = Env.get('SIGNATURE_REPOSITORY_START_BLOCK')

export default class SignatureTracker extends Contract {
  public static async initialize(address: string): Promise<SignatureTracker> {
    const instance = new SignatureTracker()
    instance.contract = new ethers.Contract(address, Array.from(abi), provider)

    return instance
  }

  public async track() {
    while (true) {
      await this.sync()
      await delay(30_000) // Wait a couple blocks
    }
  }

  public async sync() {
    for (const event of EVENTS) {
      const lastEvent = await HandwrittenMark.getLast()
      const startBlock = lastEvent
        ? parseInt(lastEvent.blockNumber) + 1
        : START_BLOCK

      await this.syncEvents(startBlock, event, this[`on${event}`])
    }
  }

  protected async onNewSignature(event: ethers.EventLog) {
    if (!event.args) {
      console.log(`Error: no args in event`)
      return
    }

    const signer = event.args.signer.toLowerCase()
    const index = event.args.index.toString()

    // Create or update the signer's account
    await Account.updateOrCreate({ address: signer }, {})

    // Record the event
    await HandwrittenMark.updateOrCreate({
      signer,
      index,
      txHash: event.transactionHash.toLowerCase(),
      blockNumber: event.blockNumber.toString(),
      logIndex: event.index.toString(),
    }, {
      createdAt: await getBlockTimestamp(event.blockNumber),
      path: await this.contract.signaturePath(signer, index),
    })
  }

  public async getSvg(
    signer: string,
    index: string,
    color: string = '#000000',
    width: string = '2'
  ): Promise<string> {
    return await this.contract.svg(signer, index, color, width)
  }
}
