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
      { noise },
      { yamux },
      { bootstrap },
      { tcp },
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
      await eval(`import('libp2p')`),
      await eval(`import('libp2p/identify')`),
    ])

    const blockstore = new FsBlockstore(Application.tmpPath('block'))
    const datastore = new FsDatastore(Application.tmpPath('data'))

    const libp2p = await createLibp2p({
      datastore,
      addresses: {
        listen: [
          '/ip4/127.0.0.1/tcp/0'
        ]
      },
      transports: [
        tcp()
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
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
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
