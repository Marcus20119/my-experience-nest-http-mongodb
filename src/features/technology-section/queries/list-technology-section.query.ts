import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { IPaginatedResponse, OrderDto, PaginationDto } from '@/common/types'
import DBCommand from '@/common/utils/command'
import BuildQuery from '@/common/utils/helper'
import PaginationHelper from '@/common/utils/pagination-helper'
import { TechnologySection } from '@/db/entities/technology-section.entity'

import { TechnologySectionResponse } from '../core/interfaces/technology-section.interface'

export class ListTechnologySectionQueryInput {
  constructor(
    public params: {
      pagination: PaginationDto
      orderBy: OrderDto
    },
  ) {}
}

@QueryHandler(ListTechnologySectionQueryInput)
export class ListTechnologySectionQueryHandler
  implements IQueryHandler<ListTechnologySectionQueryInput>
{
  constructor(
    @InjectModel(TechnologySection.name)
    private readonly technologySectionModel: Model<TechnologySection>,
  ) {}

  async execute(
    command: ListTechnologySectionQueryInput,
  ): Promise<IPaginatedResponse<TechnologySectionResponse>> {
    const payload = await this.handleFilter(command)

    const { limit, offset } = payload

    const { items, total } = await DBCommand.runGetMany<TechnologySection>(
      this.technologySectionModel,
      payload,
    )

    const results = await Promise.all(items.map(async (i) => new TechnologySectionResponse(i)))

    return PaginationHelper.pagination({
      items: results,
      limit,
      offset,
      totalItems: total,
    })
  }

  private async handleFilter(command: ListTechnologySectionQueryInput) {
    const { orderBy, pagination } = command.params

    const payload = BuildQuery.getManyRequest({
      orderBy,
      pagination,
    })

    return payload
  }
}
