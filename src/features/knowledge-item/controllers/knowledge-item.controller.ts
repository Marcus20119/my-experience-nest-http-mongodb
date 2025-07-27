import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'

import { RequiredId } from '@/common/decorators'
import { ApiSuccessPaginatedResponse, ApiSuccessResponse } from '@/common/libs/swagger'
import { OrderDto, PaginationDto } from '@/common/types'

import {
  CreateKnowledgeItemCommand,
  CreateKnowledgeItemInput,
} from '../commands/create-knowledge-item.command'
import { DeleteKnowledgeItemCommand } from '../commands/delete-knowledge-item.command'
import {
  UpdateKnowledgeItemCommand,
  UpdateKnowledgeItemInput,
} from '../commands/update-knowledge-item.command'
import {
  KnowledgeItemQueryFilter,
  KnowledgeItemResponse,
} from '../core/interfaces/knowledge-item.interface'
import { DetailKnowledgeItemQueryInput } from '../queries/detail-knowledge-item.query'
import { ListKnowledgeItemQueryInput } from '../queries/list-knowledge-item.query'

@ApiTags('Knowledge Item')
@Controller('knowledge-items')
export class KnowledgeItemController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create knowledge item' })
  @ApiSuccessResponse({ type: KnowledgeItemResponse })
  async createKnowledgeItem(@Body() input: CreateKnowledgeItemInput) {
    return await this.commandBus.execute(new CreateKnowledgeItemCommand(input))
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update knowledge item' })
  @ApiSuccessResponse({ type: KnowledgeItemResponse })
  async updateKnowledgeItem(@Body() input: UpdateKnowledgeItemInput, @RequiredId('id') id: string) {
    return await this.commandBus.execute(new UpdateKnowledgeItemCommand(id, input))
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete knowledge item' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteKnowledgeItem(@RequiredId('id') id: string) {
    return await this.commandBus.execute(new DeleteKnowledgeItemCommand(id))
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detail knowledge item' })
  @ApiSuccessResponse({ type: KnowledgeItemResponse })
  async getDetailKnowledgeItem(@RequiredId('id') id: string) {
    return await this.queryBus.execute(new DetailKnowledgeItemQueryInput(id))
  }

  @Get()
  @ApiExtraModels(KnowledgeItemQueryFilter)
  @ApiOperation({ summary: 'Get list knowledge items' })
  @ApiSuccessPaginatedResponse({ type: KnowledgeItemResponse })
  async getListKnowledgeItems(
    @Query() filter: KnowledgeItemQueryFilter,
    @Query() pagination: PaginationDto,
    @Query() orderBy: OrderDto,
  ) {
    return await this.queryBus.execute(
      new ListKnowledgeItemQueryInput({
        filter,
        orderBy,
        pagination,
      }),
    )
  }
}
