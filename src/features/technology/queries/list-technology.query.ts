import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { IPaginatedResponse, OrderDto, PaginationDto } from '@/common/types'
import DBCommand from '@/common/utils/command'
import BuildQuery from '@/common/utils/helper'
import PaginationHelper from '@/common/utils/pagination-helper'
import { Technology } from '@/db/entities'

import { TechnologyResponse } from '../core/interfaces/technology.interface'

export class ListTechnologyQueryInput {
  constructor(
    public params: {
      pagination: PaginationDto
      orderBy: OrderDto
    },
  ) {}
}

@QueryHandler(ListTechnologyQueryInput)
export class ListTechnologyQueryHandler implements IQueryHandler<ListTechnologyQueryInput> {
  constructor(
    @InjectModel(Technology.name)
    private readonly technologyModel: Model<Technology>,
  ) {}

  async execute(
    command: ListTechnologyQueryInput,
  ): Promise<IPaginatedResponse<TechnologyResponse>> {
    const payload = await this.handleFilter(command)

    const { limit, offset } = payload

    const { items, total } = await DBCommand.runGetMany<Technology>(this.technologyModel, payload)

    const results = await Promise.all(items.map(async (i) => new TechnologyResponse(i)))

    return PaginationHelper.pagination({
      items: results,
      limit,
      offset,
      totalItems: total,
    })
  }

  private async handleFilter(command: ListTechnologyQueryInput) {
    const { orderBy, pagination } = command.params

    const payload = BuildQuery.getManyRequest({
      orderBy,
      pagination,
    })

    return payload
  }
}
