import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { ApiSuccessResponse } from '@/common/libs/swagger'

import {
  CreatePreSignedUrlCommand,
  CreatePreSignedUrlInput,
} from '../commands/create-pre-signed-url.command'
import { PreSignedUrlResponse } from '../core/interfaces/s3.interface'

@ApiTags('S3')
@Controller('s3')
export class S3Controller {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('pre-signed-url')
  @ApiOperation({ summary: 'Create pre-signed url' })
  @ApiSuccessResponse({ type: PreSignedUrlResponse })
  async createPreSignedUrl(@Body() input: CreatePreSignedUrlInput) {
    return await this.commandBus.execute(new CreatePreSignedUrlCommand(input))
  }
}
