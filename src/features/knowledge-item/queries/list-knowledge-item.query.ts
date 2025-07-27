import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { IPaginatedResponse, OrderDto, PaginationDto } from '@/common/types'
import DBCommand from '@/common/utils/command'
import BuildQuery from '@/common/utils/helper'
import PaginationHelper from '@/common/utils/pagination-helper'
import { KnowledgeItem } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'

import {
  KnowledgeItemQueryFilter,
  KnowledgeItemResponse,
} from '../core/interfaces/knowledge-item.interface'

export class ListKnowledgeItemQueryInput {
  constructor(
    public params: {
      filter: KnowledgeItemQueryFilter
      orderBy: OrderDto
      pagination: PaginationDto
    },
  ) {}
}

@QueryHandler(ListKnowledgeItemQueryInput)
export class ListKnowledgeItemQueryHandler implements IQueryHandler<ListKnowledgeItemQueryInput> {
  constructor(
    protected readonly cloudfrontService: CloudfrontService,
    @InjectModel(KnowledgeItem.name)
    private readonly knowledgeItemModel: Model<KnowledgeItem>,
  ) {}

  async execute(
    command: ListKnowledgeItemQueryInput,
  ): Promise<IPaginatedResponse<KnowledgeItemResponse>> {
    const payload = await this.handleFilter(command)

    const { limit, offset } = payload

    const { items, total } = await DBCommand.runGetMany<KnowledgeItem>(
      this.knowledgeItemModel,
      payload,
    )

    const results = await Promise.all(
      items.map(async (i) => new KnowledgeItemResponse(i, this.cloudfrontService)),
    )

    return PaginationHelper.pagination({
      items: results,
      limit,
      offset,
      totalItems: total,
    })
  }

  private async handleFilter(command: ListKnowledgeItemQueryInput) {
    const { filter, orderBy, pagination } = command.params

    const payload = BuildQuery.getManyRequest({
      filter,
      orderBy,
      pagination,
    })

    if (filter.knowledgeGroupId) {
      payload.filters.knowledgeGroupId = {
        $eq: filter.knowledgeGroupId,
      }
    }

    return payload
  }
}
