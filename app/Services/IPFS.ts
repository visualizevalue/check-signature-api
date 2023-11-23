// @ts-ignore
import type { Helia } from '@helia/interface'
import { CID } from 'multiformats/cid'
import Env from '@ioc:Adonis/Core/Env'
import s3Client from './S3Client'
import { S3Datastore } from './JSStore/S3DataStore'
import { S3Blockstore } from './JSStore/S3BlockStore'

class IFPS {
  private _setup: boolean = false
  public helia: Helia
  public json: any // FIXME: Import ESM JSON type

  async setup (): Promise<void> {
    if (this._setup) return

    const [
      { createHelia },
      { json },
    ] = await Promise.all([
      await eval(`import('helia')`), // FIXME: Proper ESM imports
      await eval(`import('@helia/json')`), // FIXME: Proper ESM imports
    ])

    const datastore = new S3Datastore(s3Client, Env.get('S3_BUCKET'))
    const blockstore = new S3Blockstore(s3Client, Env.get('S3_BUCKET'))

    const helia = await createHelia({
      blockstore,
      datastore,
    })

    this.helia = helia
    this.json = json(helia)
    this._setup = true
  }

  async addJson (data: any): Promise<CID> {
    await this.setup()

    return await this.json.add(data)
  }

  async get (cid: CID): Promise<any> {
    await this.setup()

    return await this.json.get(cid)
  }
}

export default new IFPS()
