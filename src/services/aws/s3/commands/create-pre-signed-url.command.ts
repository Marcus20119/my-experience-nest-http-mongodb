import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty } from 'class-validator'

import { FileCategory, MimeType } from '@/common/enums'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { S3Service } from '../s3.service'
import { PreSignedUrlResponse } from '../core/interfaces/s3.interface'
import { getSignedUrl as getPreSignedUrl } from '@aws-sdk/s3-request-presigner'

export class CreatePreSignedUrlInput {
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

export class CreatePreSignedUrlCommand {
  constructor(public input: CreatePreSignedUrlInput) {}
}

@CommandHandler(CreatePreSignedUrlCommand)
export class CreatePreSignedUrlCommandHandler
  implements ICommandHandler<CreatePreSignedUrlCommand>
{
  constructor(private readonly s3Service: S3Service) {}

  async execute(command: CreatePreSignedUrlCommand): Promise<PreSignedUrlResponse> {
    const { category, mimeType, name, size } = command.input
  }
}
