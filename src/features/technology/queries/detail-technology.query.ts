import { BadRequestException } from '@nestjs/common'
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { t } from '@/common/utils'
import { Technology } from '@/db/entities'

import { TechnologyResponse } from '../core/interfaces/technology.interface'

export class DetailTechnologyQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(DetailTechnologyQuery)
export class DetailTechnologyQueryHandler implements IQueryHandler<DetailTechnologyQuery> {
  constructor(
    @InjectModel(Technology.name)
    private readonly technologyModel: Model<Technology>,
  ) {}

  async execute(query: DetailTechnologyQuery): Promise<TechnologyResponse> {
    const technology = await this.technologyModel.findById(query.id)

    if (!technology) {
      throw new BadRequestException(t('message.technology.notFound'))
    }

    return new TechnologyResponse(technology)
  }
}
