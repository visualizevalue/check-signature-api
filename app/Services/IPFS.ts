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
      { noise },
      { yamux },
      { bootstrap },
      { tcp },
      { webSockets },
      { createLibp2p },
      { identifyService },
    ] = await Promise.all([
      // FIXME: Proper ESM imports
      await eval(`import('helia')`),
      await eval(`import('@helia/json')`),
      await eval(`import('blockstore-fs')`),
      await eval(`import('datastore-fs')`),
      await eval(`import('@chainsafe/libp2p-noise')`),
      await eval(`import('@chainsafe/libp2p-yamux')`),
      await eval(`import('@libp2p/bootstrap')`),
      await eval(`import('@libp2p/tcp')`),
      await eval(`import('@libp2p/websockets')`),
      await eval(`import('libp2p')`),
      await eval(`import('libp2p/identify')`),
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

    const libp2p = await createLibp2p({
      datastore,
      transports: [
        tcp(),
        webSockets(),
      ],
      connectionEncryption: [
        noise()
      ],
      streamMuxers: [
        yamux()
      ],
      peerDiscovery: [
        bootstrap({
          list: [
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
            '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
          ]
        })
      ],
      services: {
        identify: identifyService()
      }
    })

    const helia = await createHelia({
      blockstore,
      datastore,
      libp2p,
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
