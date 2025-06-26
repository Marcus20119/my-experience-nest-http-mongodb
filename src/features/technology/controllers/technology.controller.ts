import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { RequiredId } from '@/common/decorators'
import { ApiSuccessResponse } from '@/common/libs/swagger'
import { OrderDto, PaginationDto } from '@/common/types'

import {
  CreateTechnologyCommand,
  CreateTechnologyInput,
} from '../commands/create-technology.command'
import { DeleteTechnologyCommand } from '../commands/delete-technology.command'
import { TechnologyResponse } from '../core/interfaces/technology.interface'
import { DetailTechnologyQuery } from '../queries/detail-technology.query'
import { ListTechnologyQueryInput } from '../queries/list-technology.query'

@ApiTags('Technology')
@Controller('technologies')
export class TechnologyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create technology' })
  @ApiSuccessResponse({ type: TechnologyResponse })
  async createTechnology(@Body() input: CreateTechnologyInput) {
    return await this.commandBus.execute(new CreateTechnologyCommand(input))
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete technology' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTechnology(@RequiredId('id') id: string) {
    return await this.commandBus.execute(new DeleteTechnologyCommand(id))
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detail technology' })
  @ApiSuccessResponse({ type: TechnologyResponse })
  async getDetailTechnology(@RequiredId('id') id: string) {
    return await this.queryBus.execute(new DetailTechnologyQuery(id))
  }

  @Get()
  @ApiOperation({ summary: 'Get list technologies' })
  @ApiSuccessResponse({ type: TechnologyResponse })
  async getListTechnologies(@Query() pagination: PaginationDto, @Query() orderBy: OrderDto) {
    return await this.queryBus.execute(
      new ListTechnologyQueryInput({
        orderBy,
        pagination,
      }),
    )
  }
}
