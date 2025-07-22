import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { IPaginatedResponse, OrderDto, PaginationDto } from '@/common/types'
import DBCommand from '@/common/utils/command'
import BuildQuery from '@/common/utils/helper'
import PaginationHelper from '@/common/utils/pagination-helper'
import { KnowledgeGroup } from '@/db/entities'

import {
  KnowledgeGroupQueryFilter,
  KnowledgeGroupResponse,
} from '../core/interfaces/knowledge-group.interface'

export class ListKnowledgeGroupInput {
  constructor(
    public params: {
      filter: KnowledgeGroupQueryFilter
      pagination: PaginationDto
      orderBy: OrderDto
    },
  ) {}
}

@QueryHandler(ListKnowledgeGroupInput)
export class ListKnowledgeGroupQueryHandler implements IQueryHandler<ListKnowledgeGroupInput> {
  constructor(
    @InjectModel(KnowledgeGroup.name)
    private readonly knowledgeGroupModel: Model<KnowledgeGroup>,
  ) {}

  async execute(
    command: ListKnowledgeGroupInput,
  ): Promise<IPaginatedResponse<KnowledgeGroupResponse>> {
    const payload = await this.handleFilter(command)

    const { limit, offset } = payload

    const { items, total } = await DBCommand.runGetMany<KnowledgeGroup>(
      this.knowledgeGroupModel,
      payload,
    )

    const results = items.map((i) => new KnowledgeGroupResponse(i))

    return PaginationHelper.pagination({
      items: results,
      limit,
      offset,
      totalItems: total,
    })
  }

  private async handleFilter(command: ListKnowledgeGroupInput) {
    const { filter, orderBy, pagination } = command.params

    const payload = BuildQuery.getManyRequest({
      filter,
      orderBy,
      pagination,
    })

    if (filter.technologyId) {
      payload.filters.technologyId = {
        $eq: filter.technologyId,
      }
    }

    return payload
  }
}
