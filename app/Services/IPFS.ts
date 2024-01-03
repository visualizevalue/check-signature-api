import fs from 'fs'
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

    // Get storage path
    const blockPath = Application.makePath(Env.get('IPFS_FS_PATH') + '/block')
    const dataPath = Application.makePath(Env.get('IPFS_FS_PATH') + '/data')

    // Ensure directories exist
    if (!fs.existsSync(blockPath)) fs.mkdirSync(blockPath, { recursive: true })
    if (!fs.existsSync(dataPath)) fs.mkdirSync(dataPath, { recursive: true })

    // Initialize storage
    const blockstore = new FsBlockstore(blockPath)
    const datastore = new FsDatastore(dataPath)

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

    const cid = await this.json.add(data)

    // Do asyncronously
    try {
      setTimeout(async () => await this.helia.pins.add(cid), 10)
    } catch (e) {}

    return cid
  }

  async get (cid: CID): Promise<any> {
    await this.setup()

    return await this.json.get(cid)
  }
}

export default new IFPS()
