import { S3 } from '@aws-sdk/client-s3'
import Env from '@ioc:Adonis/Core/Env'

const s3Client = new S3({
    forcePathStyle: false,
    endpoint: Env.get('S3_ENDPOINT'),
    region: Env.get('S3_REGION'),
    credentials: {
      accessKeyId: Env.get('S3_KEY'),
      secretAccessKey: Env.get('S3_SECRET'),
    },
})

export default s3Client
