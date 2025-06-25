import { BadRequestException } from '@nestjs/common'
import { Model } from 'mongoose'

import { BaseTechnologyResponse } from '@/common/interfaces'
import { t } from '@/common/utils'
import { Technology, TechnologySection } from '@/db/entities'

export class BaseTechnologyCommand {
  constructor(protected readonly technologySectionModel: Model<TechnologySection>) {}

  protected async syncTechnologySectionInfo(
    technologySectionId: string,
    technology: Technology,
  ): Promise<void> {
    const section = await this.technologySectionModel.findById(technologySectionId)

    if (!section) {
      throw new BadRequestException(t('message.technologySection.notFound'))
    }

    const index = section.technologies.findIndex((t) => t.id === technology.id)

    const updated = new BaseTechnologyResponse(technology)

    if (index >= 0) {
      section.technologies[index] = updated // update existing
    } else {
      section.technologies.push(updated) // insert new
    }

    await section.save()
  }
}
