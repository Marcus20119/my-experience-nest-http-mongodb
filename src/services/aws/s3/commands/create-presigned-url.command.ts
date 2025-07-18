import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl as getPresignedUrl } from '@aws-sdk/s3-request-presigner'
import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty } from 'class-validator'

import { BucketType, FileCategory, MimeType } from '@/common/enums'
import { t } from '@/common/utils'
import { config } from '@/config'

import { FILE_CATEGORY_CONFIG } from '../core/constants/s3.constant'
import { PresignedUrlResponse } from '../core/interfaces/s3.interface'
import { S3Service } from '../s3.service'

export class CreatePresignedUrlInput {
  @ApiProperty({
    enum: BucketType,
    enumName: 'BucketType',
    type: String,
  })
  @IsNotEmpty()
  @IsEnum(BucketType)
  bucketType: BucketType

  @ApiProperty({
    enum: FileCategory,
    enumName: 'FileCategory',
    type: String,
  })
  @IsNotEmpty()
  @IsEnum(FileCategory)
  category: FileCategory

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  name: string

  @ApiProperty({
    enum: MimeType,
    enumName: 'MimeType',
    type: String,
  })
  @IsNotEmpty()
  @IsEnum(MimeType)
  mimeType: MimeType

  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  size: number
}

export class CreatePresignedUrlCommand {
  constructor(public input: CreatePresignedUrlInput) {}
}

@CommandHandler(CreatePresignedUrlCommand)
export class CreatePresignedUrlCommandHandler
  implements ICommandHandler<CreatePresignedUrlCommand>
{
  constructor(private readonly s3Service: S3Service) {}

  async execute(command: CreatePresignedUrlCommand): Promise<PresignedUrlResponse> {
    const { bucketType, category, mimeType, size } = command.input

    const { maxSize, mimeTypes } = FILE_CATEGORY_CONFIG[bucketType][category]

    if (size > maxSize) {
      throw new BadRequestException(t('message.aws.s3.maxSizeExceeded'))
    }

    if (!mimeTypes.includes(mimeType)) {
      throw new BadRequestException(t('message.aws.s3.invalidFileType'))
    }

    const name = this.s3Service.encodeFileName(command.input.name)
    const filePath = `temp/${category}/${name}`

    const uploadUrl = await getPresignedUrl(
      this.s3Service.client,
      new PutObjectCommand({
        Bucket: config.aws.s3.bucket[bucketType],
        ContentLength: size,
        ContentType: mimeType,
        Key: filePath,
        Metadata: {
          OriginalName: command.input.name,
        },
      }),
      { expiresIn: config.aws.s3.preSignUrlExpiration },
    )

    return {
      key: this.s3Service.getFileKey(bucketType, filePath),
      uploadUrl,
    }
  }
}
