import { IQueryHandler, QueryHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { TechnologyType } from '@/common/enums'
import { TechnologySection } from '@/db/entities'

import {
  BaseTechnologySectionResponse,
  TechnologySectionSkeleton,
  TechnologySkeletonResponse,
} from '../core/interfaces/technology-section.interface'

export class TechnologySectionSkeletonQueryInput {}

@QueryHandler(TechnologySectionSkeletonQueryInput)
export class TechnologySectionSkeletonQueryHandler
  implements IQueryHandler<TechnologySectionSkeletonQueryInput>
{
  constructor(
    @InjectModel(TechnologySection.name)
    private readonly technologySectionModel: Model<TechnologySection>,
  ) {}
  async execute(
    _command: TechnologySectionSkeletonQueryInput,
  ): Promise<TechnologySkeletonResponse> {
    const types = Object.values(TechnologyType)

    const queries = types.map(async (type) => {
      const sections = await this.technologySectionModel.find({ technologyType: type })

      return {
        technologySections: sections.map((section) => new BaseTechnologySectionResponse(section)),
        technologyType: type,
      } as TechnologySectionSkeleton
    })

    const technologySkeleton = await Promise.all(queries)

    return {
      technologySkeleton,
    }
  }
}
