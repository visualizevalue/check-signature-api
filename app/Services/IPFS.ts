// @ts-ignore
import type { Helia } from '@helia/interface'
import { CID } from 'multiformats/cid'
import Application from '@ioc:Adonis/Core/Application'
import Env from '@ioc:Adonis/Core/Env'

class IFPS {
  private _setup: boolean = false
  public helia: Helia
  public json: any // FIXME: Import ESM JSON type

  async setup (): Promise<void> {
    if (this._setup) return

    const [
      { createHelia },
      { json },
      { FsBlockstore },
      { FsDatastore },
    ] = await Promise.all([
      // FIXME: Proper ESM imports
      await eval(`import('helia')`),
      await eval(`import('@helia/json')`),
      await eval(`import('blockstore-fs')`),
      await eval(`import('datastore-fs')`),
    ])

    const blockstore = new FsBlockstore(Application.tmpPath('block'))
    const datastore = new FsDatastore(Application.tmpPath('data'))

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
