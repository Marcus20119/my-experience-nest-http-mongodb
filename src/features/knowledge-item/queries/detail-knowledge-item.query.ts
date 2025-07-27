import { BadRequestException } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { t } from '@/common/utils'
import { KnowledgeItem } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'
import { S3Service } from '@/services/aws/s3/s3.service'

import { KnowledgeItemResponse } from '../core/interfaces/knowledge-item.interface'

export class DetailKnowledgeItemQueryInput {
  constructor(public readonly id: string) {}
}

@QueryHandler(DetailKnowledgeItemQueryInput)
export class DetailKnowledgeItemQueryHandler
  implements IQueryHandler<DetailKnowledgeItemQueryInput>
{
  constructor(
    protected readonly cloudfrontService: CloudfrontService,
    protected readonly s3Service: S3Service,
    @InjectModel(KnowledgeItem.name)
    private readonly knowledgeItemModel: Model<KnowledgeItem>,
  ) {}

  async execute(query: DetailKnowledgeItemQueryInput): Promise<KnowledgeItemResponse> {
    const knowledgeItem = await this.knowledgeItemModel.findById(query.id)

    if (!knowledgeItem) {
      throw new BadRequestException(t('message.knowledgeItem.notFound'))
    }

    const iconFileName = await this.s3Service.getObjectName(knowledgeItem.iconFileKey)
    const iconSignedUrl = this.cloudfrontService.getSignedUrl(knowledgeItem.iconFileKey)

    if (iconFileName) {
      knowledgeItem.iconFileKey = `${iconSignedUrl}>${iconFileName}`
    }

    return new KnowledgeItemResponse(knowledgeItem, this.cloudfrontService)
  }
}
