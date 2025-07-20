import {
  CopyObjectCommand,
  CopyObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'

import { BucketType, FileCategory } from '@/common/enums'
import { Maybe } from '@/common/types'
import { config } from '@/config'

@Injectable()
export class S3Service {
  client = new S3Client({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
    region: config.aws.region,
  })

  encodeFileName(name: string): string {
    const parts = name.split('.')
    const [fileName, ext] =
      parts.length > 1 ? [parts.slice(0, -1).join('.'), `.${parts.at(-1)}`] : [name, '']

    return Buffer.from(fileName).toString('base64url') + ext
  }

  getFileKey(bucketType: BucketType, key: string) {
    return `${bucketType}|${key}`
  }

  decodeFileKey = (
    fileKey: string,
  ): { bucketType?: BucketType; key?: string; category?: FileCategory; url?: string } => {
    if (!/^\w+\|(.+\/).+$/.test(fileKey)) {
      return { bucketType: undefined, category: undefined, key: undefined, url: undefined }
    }

    const [bucketType, keyAndUrl] = fileKey.split('|')
    const [key, url] = keyAndUrl.split('>')

    return {
      bucketType,
      category: bucketType === BucketType.PUBLIC ? key.split('/')[0] : key.split('/')[1],
      key,
      url,
    } as { bucketType: BucketType; key: string; category: FileCategory; url?: string }
  }

  async copyObjectFromTempToAsset(fileKey: Maybe<string>): Promise<string | undefined> {
    if (!fileKey) return undefined

    const { bucketType, key } = this.decodeFileKey(fileKey)

    if (bucketType && key) {
      const newKey = key.replace('temp/', 'asset/')

      const bucket = config.aws.s3.bucket[bucketType]
      const input: CopyObjectCommandInput = {
        Bucket: bucket,
        CopySource: `${bucket}/${key}`,
        Key: newKey,
      }

      const command = new CopyObjectCommand(input)
      await this.client.send(command)

      return this.getFileKey(bucketType, newKey)
    }

    return undefined
  }

  async deleteFile(fileKey?: string): Promise<void> {
    if (!fileKey) return

    const { bucketType, key } = this.decodeFileKey(fileKey)
    if (!bucketType || !key) return

    const bucket = config.aws.s3.bucket[bucketType]
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    await this.client.send(command)
  }

  async deleteFiles(fileKeys: string[]): Promise<void> {
    const entries = fileKeys
      .map((fileKey) => this.decodeFileKey(fileKey))
      .filter((f): f is { bucketType: BucketType; key: string } => !!(f.bucketType && f.key))

    // Group keys by bucketType
    const bucketMap: Record<BucketType, string[]> = {} as any

    for (const { bucketType, key } of entries) {
      if (!bucketMap[bucketType]) bucketMap[bucketType] = []
      bucketMap[bucketType].push(key)
    }

    for (const bucketType of Object.keys(bucketMap) as BucketType[]) {
      const keys = bucketMap[bucketType]
      const bucket = config.aws.s3.bucket[bucketType]

      const command = new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: keys.map((Key) => ({ Key })),
          Quiet: true,
        },
      })

      await this.client.send(command)
    }
  }
}
