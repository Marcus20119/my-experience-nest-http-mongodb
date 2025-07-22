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
  CreateKnowledgeGroupCommand,
  CreateKnowledgeGroupInput,
} from '../commands/create-knowledge-group.command'
import { DeleteKnowledgeGroupCommand } from '../commands/delete-knowledge-group.command'
import {
  UpdateKnowledgeGroupCommand,
  UpdateKnowledgeGroupInput,
} from '../commands/update-knowledge-group.command'
import {
  KnowledgeGroupQueryFilter,
  KnowledgeGroupResponse,
} from '../core/interfaces/knowledge-group.interface'
import { DetailKnowledgeGroupQueryInput } from '../queries/detail-knowledge-group.query'
import { ListKnowledgeGroupInput } from '../queries/list-knowledge-group.query'

@ApiTags('Knowledge Group')
@Controller('knowledge-groups')
export class KnowledgeGroupController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create knowledge group' })
  @ApiSuccessResponse({ type: KnowledgeGroupResponse })
  async createKnowledgeGroup(@Body() input: CreateKnowledgeGroupInput) {
    return await this.commandBus.execute(new CreateKnowledgeGroupCommand(input))
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update knowledge group' })
  @ApiSuccessResponse({ type: KnowledgeGroupResponse })
  async updateKnowledgeGroup(
    @Body() input: UpdateKnowledgeGroupInput,
    @RequiredId('id') id: string,
  ) {
    return await this.commandBus.execute(new UpdateKnowledgeGroupCommand(id, input))
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete knowledge group' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteKnowledgeGroup(@RequiredId('id') id: string) {
    return await this.commandBus.execute(new DeleteKnowledgeGroupCommand(id))
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get knowledge group detail' })
  @ApiSuccessResponse({ type: KnowledgeGroupResponse })
  async getDetailKnowledgeGroup(@RequiredId('id') id: string) {
    return await this.queryBus.execute(new DetailKnowledgeGroupQueryInput(id))
  }

  @Get()
  @ApiExtraModels(KnowledgeGroupQueryFilter)
  @ApiOperation({ summary: 'Get list knowledge groups' })
  @ApiSuccessPaginatedResponse({ type: KnowledgeGroupResponse })
  async getListKnowledgeGroups(
    @Query() filter: KnowledgeGroupQueryFilter,
    @Query() pagination: PaginationDto,
    @Query() orderBy: OrderDto,
  ) {
    return await this.queryBus.execute(
      new ListKnowledgeGroupInput({
        filter,
        orderBy,
        pagination,
      }),
    )
  }
}
