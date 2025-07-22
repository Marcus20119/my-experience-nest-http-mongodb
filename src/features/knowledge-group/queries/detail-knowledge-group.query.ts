import { BadRequestException } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { t } from '@/common/utils'
import { KnowledgeGroup } from '@/db/entities'

import { KnowledgeGroupResponse } from '../core/interfaces/knowledge-group.interface'

export class DetailKnowledgeGroupQueryInput {
  constructor(public readonly id: string) {}
}

@QueryHandler(DetailKnowledgeGroupQueryInput)
export class DetailKnowledgeGroupQueryHandler
  implements IQueryHandler<DetailKnowledgeGroupQueryInput>
{
  constructor(
    @InjectModel(KnowledgeGroup.name)
    private readonly knowledgeGroupModel: Model<KnowledgeGroup>,
  ) {}

  async execute(query: DetailKnowledgeGroupQueryInput): Promise<KnowledgeGroupResponse> {
    const knowledgeGroup = await this.knowledgeGroupModel.findById(query.id)

    if (!knowledgeGroup) {
      throw new BadRequestException(t('message.knowledgeGroup.notFound'))
    }

    return new KnowledgeGroupResponse(knowledgeGroup)
  }
}
