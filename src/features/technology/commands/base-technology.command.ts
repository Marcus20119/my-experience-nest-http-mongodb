import { BadRequestException } from '@nestjs/common'
import { ClientSession, Model } from 'mongoose'

import { IconType, SyncAction } from '@/common/enums'
import { BaseTechnologyResponse } from '@/common/interfaces'
import { t } from '@/common/utils'
import { Technology, TechnologySection } from '@/db/entities'

export class BaseTechnologyCommand {
  constructor(protected readonly technologySectionModel: Model<TechnologySection>) {}

  protected verifyIcon(technology?: Partial<Technology>): void {
    if (!technology) {
      return
    }

    const { iconName, iconType, iconUrl } = technology

    switch (iconType) {
      case IconType.ICONIFY: {
        if (!iconName) {
          throw new BadRequestException(t('message.technology.shouldContainIconName'))
        }
        break
      }

      case IconType.CUSTOM: {
        if (!iconUrl) {
          throw new BadRequestException(t('message.technology.shouldContainIconUrl'))
        }
        break
      }

      default: {
        break
      }
    }
  }

  protected async syncTechnologySectionInfo({
    session,
    syncAction,
    technology,
    technologySectionId,
  }: {
    session?: ClientSession
    syncAction: SyncAction
    technology: Technology
    technologySectionId?: string
  }): Promise<void> {
    if (!technologySectionId) {
      return
    }

    switch (syncAction) {
      case SyncAction.CREATE: {
        await this.addTechnologyToSection({
          session,
          technology,
          technologySectionId: technology.technologySectionId || technologySectionId,
        })
        break
      }

      case SyncAction.UPDATE: {
        await this.removeTechnologyInSection({
          session,
          technologyId: technology.id,
          technologySectionId,
        })

        if (!technology.technologySectionId) {
          return
        }

        await this.addTechnologyToSection({
          session,
          technology,
          technologySectionId: technology.technologySectionId,
        })
        break
      }

      case SyncAction.DELETE: {
        await this.removeTechnologyInSection({
          session,
          technologyId: technology.id,
          technologySectionId: technology.technologySectionId || technologySectionId,
        })
        break
      }
    }
  }

  private async addTechnologyToSection({
    session = null,
    technology,
    technologySectionId,
  }: {
    session?: ClientSession | null
    technology: Technology
    technologySectionId: string
  }) {
    const section = await this.technologySectionModel
      .findById({
        _id: technologySectionId,
      })
      .session(session)

    if (!section) {
      throw new BadRequestException(t('message.technologySection.notFound'))
    }

    section.technologies.push(new BaseTechnologyResponse(technology))
    await section.save({
      session,
    })
  }

  private async removeTechnologyInSection({
    session = null,
    technologyId,
    technologySectionId,
  }: {
    session?: ClientSession | null
    technologyId: string
    technologySectionId: string
  }) {
    const section = await this.technologySectionModel
      .findById({
        _id: technologySectionId,
      })
      .session(session)

    if (!section) {
      throw new BadRequestException(t('message.technologySection.notFound'))
    }

    const index = section.technologies.findIndex((item) => item.id === technologyId)

    if (index >= 0) {
      section.technologies.splice(index, 1)
      await section.save({
        session,
      })
    }
  }
}
