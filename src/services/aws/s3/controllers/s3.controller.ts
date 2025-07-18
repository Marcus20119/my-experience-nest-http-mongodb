import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { ApiSuccessResponse } from '@/common/libs/swagger'

import {
  CreatePresignedUrlCommand,
  CreatePresignedUrlInput,
} from '../commands/create-presigned-url.command'
import { PresignedUrlResponse } from '../core/interfaces/s3.interface'

@ApiTags('S3')
@Controller('s3')
export class S3Controller {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Create pre-signed url' })
  @ApiSuccessResponse({ type: PresignedUrlResponse })
  async createPresignedUrl(@Body() input: CreatePresignedUrlInput) {
    return await this.commandBus.execute(new CreatePresignedUrlCommand(input))
  }
}
