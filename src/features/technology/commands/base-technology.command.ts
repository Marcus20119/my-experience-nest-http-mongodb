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

    switch (syncAction) {
      case SyncAction.CREATE: {
        await this.addTechnologyToSection({
          technology,
          technologySectionId,
        })
        break
      }

      case SyncAction.UPDATE: {
        await this.removeTechnologyInSection({ technologyId: technology.id, technologySectionId })
        await this.addTechnologyToSection({ technology, technologySectionId })
        break
      }

      case SyncAction.DELETE: {
        await this.removeTechnologyInSection({
          technologyId: technology.id,
          technologySectionId,
        })
        break
      }
    }
  }

  private async addTechnologyToSection({
    technology,
    technologySectionId,
  }: {
    technology: Technology
    technologySectionId: string
  }) {
    const section = await this.technologySectionModel.findById(technologySectionId)

    if (!section) {
      throw new BadRequestException(t('message.technologySection.notFound'))
    }

    section.technologies.push(new BaseTechnologyResponse(technology))
    await section.save()
  }

  private async removeTechnologyInSection({
    technologyId,
    technologySectionId,
  }: {
    technologySectionId: string
    technologyId: string
  }) {
    const section = await this.technologySectionModel.findById(technologySectionId)

    if (!section) {
      throw new BadRequestException(t('message.technologySection.notFound'))
    }

    const index = section.technologies.findIndex((item) => item.id === technologyId)

    if (index >= 0) {
      section.technologies.splice(index, 1)
      await section.save()
    }
  }
}
