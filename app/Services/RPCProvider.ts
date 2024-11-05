import { JsonRpcProvider } from 'ethers'
import { DateTime } from 'luxon'
import Env from '@ioc:Adonis/Core/Env'

export const MAX_BLOCK_QUERY = 2000

const PROVIDERS = {
  1: new JsonRpcProvider(Env.get('RPC_PROVIDER'), 1),
}

const BLOCK_CACHE = {}

/**
 * Get a date object of when a given block was created
 */
export const getBlockTimestamp = async (blockHeight: number, chainId: number = 1) => {
  // FIXME: Make cache specific to chain
  if (BLOCK_CACHE[blockHeight]) return DateTime.fromSeconds(BLOCK_CACHE[blockHeight])

  const provider = PROVIDERS[chainId]

  const block = await provider.getBlock(blockHeight)
  if (! block) return

  BLOCK_CACHE[blockHeight] = block.timestamp

  return DateTime.fromSeconds(BLOCK_CACHE[blockHeight])
}

export const getTransaction = async (hash: string, chainId: number = 1) => {
  const provider = PROVIDERS[chainId]

  return provider.getTransaction(hash)
}

export const getTransactionReceipt = async (hash: string, chainId: number = 1) => {
  const provider = PROVIDERS[chainId]

  return provider.getTransactionReceipt(hash)
}

export default PROVIDERS[1]
