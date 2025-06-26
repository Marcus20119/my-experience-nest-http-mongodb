import { BadRequestException } from '@nestjs/common'
import { Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { BaseTechnologyResponse } from '@/common/interfaces'
import { t } from '@/common/utils'
import { Technology, TechnologySection } from '@/db/entities'

export class BaseTechnologyCommand {
  constructor(protected readonly technologySectionModel: Model<TechnologySection>) {}

  protected async syncTechnologySectionInfo({
    syncAction,
    technology,
    technologySectionId,
  }: {
    technology: Technology
    technologySectionId?: string
    syncAction: SyncAction
  }): Promise<void> {
    if (!technologySectionId) {
      return
    }

    const section = await this.technologySectionModel.findById(technologySectionId)

    if (!section) {
      throw new BadRequestException(t('message.technologySection.notFound'))
    }

    switch (syncAction) {
      case SyncAction.CREATE: {
        const index = section.technologies.findIndex((item) => item.id === technology.id)

        const updated = new BaseTechnologyResponse(technology)

        if (index >= 0) {
          section.technologies[index] = updated
        } else {
          section.technologies.push(updated)
        }

        break
      }

      case SyncAction.DELETE: {
        const index = section.technologies.findIndex((item) => item.id === technology.id)

        if (index >= 0) {
          section.technologies.splice(index, 1)
        }

        break
      }

      case SyncAction.UPDATE: {
        const index = section.technologies.findIndex((item) => item.id === technology.id)

        if (index >= 0) {
          section.technologies[index] = new BaseTechnologyResponse(technology)
        }

        break
      }
    }

    await section.save()
  }
}
