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
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { RequiredId } from '@/common/decorators'
import { ApiSuccessResponse } from '@/common/libs/swagger'
import { OrderDto, PaginationDto } from '@/common/types'

import {
  CreateTechnologySectionCommand,
  CreateTechnologySectionInput,
} from '../commands/create-technology-section.command'
import { DeleteTechnologySectionCommand } from '../commands/delete-technology-section.command'
import {
  UpdateTechnologySectionCommand,
  UpdateTechnologySectionInput,
} from '../commands/update-technology-section.command'
import { TechnologySectionResponse } from '../core/interfaces/technology-section.interface'
import { DetailTechnologySectionQuery } from '../queries/detail-technology-section.query'
import { ListTechnologySectionQueryInput } from '../queries/list-technology-section.query'

@Controller('technology-sections')
@ApiTags('technology-sections')
export class TechnologySectionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create technology section' })
  @ApiSuccessResponse({ type: TechnologySectionResponse })
  async createTechnologySection(@Body() input: CreateTechnologySectionInput) {
    return await this.commandBus.execute(new CreateTechnologySectionCommand(input))
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update technology section' })
  @ApiSuccessResponse({ type: TechnologySectionResponse })
  async updateTechnologySection(
    @Body() input: UpdateTechnologySectionInput,
    @RequiredId('id') id: string,
  ) {
    return await this.commandBus.execute(new UpdateTechnologySectionCommand(id, input))
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete technology section' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTechnologySection(@RequiredId('id') id: string) {
    return await this.commandBus.execute(new DeleteTechnologySectionCommand(id))
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get detail technology section' })
  @ApiSuccessResponse({ type: TechnologySectionResponse })
  async getDetailTechnologySection(@RequiredId('id') id: string) {
    return await this.queryBus.execute(new DetailTechnologySectionQuery(id))
  }

  @Get()
  @ApiOperation({ summary: 'Get list technology sections' })
  @ApiSuccessResponse({ type: TechnologySectionResponse })
  async getListTechnologySections(@Query() pagination: PaginationDto, @Query() orderBy: OrderDto) {
    return await this.queryBus.execute(
      new ListTechnologySectionQueryInput({
        orderBy,
        pagination,
      }),
    )
  }
}
