import { Contract as EthersContract, EventLog, Log } from 'ethers'
import Logger from '@ioc:Adonis/Core/Logger'
import provider, { MAX_BLOCK_QUERY } from '../Services/RPCProvider'
import { delay } from 'App/Helpers/time'

const BLOCKS_PER_WEEK = Math.floor(60 * 60 * 24 * 7 / 13)

export default abstract class Contract {
  protected contract: EthersContract

  public async syncEvents(
    startBlock: number,
    eventType: string,
    onEvent: Function
  ): Promise<bigint> {
    const lastSynched = BigInt(startBlock)
    let latestBlock: bigint

    try {
      latestBlock = BigInt(await provider.getBlockNumber())
    } catch (e) {
      Logger.error(e)
      Logger.warn('Waiting 5 seconds and trying again')
      await delay(5_000)
      return this.syncEvents(startBlock, eventType, onEvent)
    }

    const toBlock: bigint = latestBlock > lastSynched + BigInt(BLOCKS_PER_WEEK)
      ? lastSynched + BigInt(BLOCKS_PER_WEEK)
      : latestBlock

    const fromBlockTag = `0x${lastSynched.toString(16)}`
    const toBlockTag = toBlock === latestBlock ? 'latest' : `0x${toBlock.toString(16)}`

    // Store events
    const [events, until] = await this.fetchEvents(fromBlockTag, toBlockTag, eventType)
    for (const event of events) {
      await onEvent.call(this, event)
    }

    const syncedUntil = (until > 0n && until < toBlock) ? until : toBlock
    Logger.info(
      `Synched ${eventType} events from ${startBlock} to block ${
        syncedUntil === latestBlock ? 'latest' : syncedUntil.toString()
      }; Found ${events.length} events.`
    )

    // If we're not fully synched up, continue synching
    if (toBlockTag !== 'latest') {
      return await this.syncEvents(Number(syncedUntil), eventType, onEvent)
    }

    return syncedUntil
  }

  protected async fetchEvents(
    fromBlockTag: string,
    toBlockTag: string | 'latest',
    eventType: string
  ): Promise<[(EventLog | Log)[], bigint]> {
    let events: (EventLog | Log)[] = []
    let until: bigint = 0n

    try {
      events = await this.contract.queryFilter(eventType, fromBlockTag, toBlockTag)
    } catch (e) {
      try {
        // Try the max of 2000 blocks
        until = BigInt(fromBlockTag) + BigInt(MAX_BLOCK_QUERY)
        Logger.info(`Failed on ${toBlockTag}; Trying 2000 blocks until ${until.toString()}`)
        events = await this.contract.queryFilter(
          eventType,
          fromBlockTag,
          `0x${until.toString(16)}`
        )
      } catch (e) {
        Logger.error(e)
      }
    }
    return [events, until]
  }
}
