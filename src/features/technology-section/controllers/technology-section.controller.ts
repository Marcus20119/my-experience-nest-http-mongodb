import { Controller, Get, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { ApiSuccessResponse } from '@/common/libs/swagger'
import { OrderDto, PaginationDto } from '@/common/types'

import { TechnologySectionResponse } from '../core/interfaces/technology-section.interface'
import { ListTechnologySectionQueryInput } from '../queries/list-technology-section.query'

@Controller('technology-sections')
@ApiTags('technology-sections')
export class TechnologySectionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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
