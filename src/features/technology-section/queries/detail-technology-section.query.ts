import { BadRequestException } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { t } from '@/common/utils'
import { TechnologySection } from '@/db/entities'

import { TechnologySectionResponse } from '../core/interfaces/technology-section.interface'

export class DetailTechnologySectionQueryInput {
  constructor(public readonly id: string) {}
}

@QueryHandler(DetailTechnologySectionQueryInput)
export class DetailTechnologySectionQueryHandler
  implements IQueryHandler<DetailTechnologySectionQueryInput>
{
  constructor(
    @InjectModel(TechnologySection.name)
    private readonly technologySectionModel: Model<TechnologySection>,
  ) {}

  async execute(query: DetailTechnologySectionQueryInput): Promise<TechnologySectionResponse> {
    const technologySection = await this.technologySectionModel.findById(query.id)

    if (!technologySection) {
      throw new BadRequestException(t('message.technologySection.notFound'))
    }

    return new TechnologySectionResponse(technologySection)
  }
}
