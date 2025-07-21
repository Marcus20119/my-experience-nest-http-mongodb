import { BadRequestException } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { t } from '@/common/utils'
import { Technology } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'
import { S3Service } from '@/services/aws/s3/s3.service'

import { TechnologyResponse } from '../core/interfaces/technology.interface'

export class DetailTechnologyQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(DetailTechnologyQuery)
export class DetailTechnologyQueryHandler implements IQueryHandler<DetailTechnologyQuery> {
  constructor(
    protected readonly cloudfrontService: CloudfrontService,
    protected readonly s3Service: S3Service,
    @InjectModel(Technology.name)
    private readonly technologyModel: Model<Technology>,
  ) {}

  async execute(query: DetailTechnologyQuery): Promise<TechnologyResponse> {
    const technology = await this.technologyModel.findById(query.id)

    if (!technology) {
      throw new BadRequestException(t('message.technology.notFound'))
    }

    const iconFileName = await this.s3Service.getObjectName(technology.iconFileKey)
    const iconSignedUrl = this.cloudfrontService.getSignedUrl(technology.iconFileKey)

    if (iconFileName) {
      technology.iconFileKey = `${technology.iconFileKey}>${iconSignedUrl}>${iconFileName}`
    }

    return new TechnologyResponse(technology, this.cloudfrontService)
  }
}
