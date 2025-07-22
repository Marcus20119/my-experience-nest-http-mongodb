import { BadRequestException } from '@nestjs/common'
import { ClientSession, Model } from 'mongoose'

import { IconType, SyncAction } from '@/common/enums'
import { BaseTechnologyResponse } from '@/common/interfaces'
import { Maybe } from '@/common/types'
import { t } from '@/common/utils'
import { Technology, TechnologySection } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'

interface SyncUpdateTechnologySectionProps {
  oldTechnologySectionId?: Maybe<string>
  session?: ClientSession
  syncAction: SyncAction.Update
  technology: Technology
}

interface SyncCreateTechnologySectionProps {
  session?: ClientSession
  syncAction: SyncAction.Create
  technology: Technology
}

interface SyncDeleteTechnologySectionProps {
  session?: ClientSession
  syncAction: SyncAction.Delete
  technology: Technology
}

type SyncTechnologySectionProps =
  | SyncCreateTechnologySectionProps
  | SyncDeleteTechnologySectionProps
  | SyncUpdateTechnologySectionProps

export class BaseTechnologyCommand {
  constructor(
    protected readonly technologySectionModel: Model<TechnologySection>,
    protected readonly cloudfrontService: CloudfrontService,
  ) {}

  protected verifyIcon(technology?: Partial<Technology>): void {
    if (!technology) {
      return
    }

    const { iconFileKey, iconName, iconType } = technology

    switch (iconType) {
      case IconType.Iconify: {
        if (!iconName) {
          throw new BadRequestException(t('message.technology.shouldContainIconName'))
        }
        break
      }

      case IconType.Custom: {
        if (!iconFileKey) {
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
    ...props
  }: SyncTechnologySectionProps): Promise<void> {
    switch (syncAction) {
      case SyncAction.Create: {
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

      case SyncAction.Update: {
        const { oldTechnologySectionId } = props as SyncUpdateTechnologySectionProps

        if (
          !technology.technologySectionId ||
          !oldTechnologySectionId ||
          technology.technologySectionId === oldTechnologySectionId
        ) {
          return
        }

        await this.removeTechnologyInSection({
          session,
          technologyId: technology.id,
          technologySectionId: oldTechnologySectionId,
        })

        await this.addTechnologyToSection({
          session,
          technology,
          technologySectionId: technology.technologySectionId,
        })
        break
      }

      case SyncAction.Delete: {
        if (!technology.technologySectionId) {
          return
        }

        await this.removeTechnologyInSection({
          session,
          technologyId: technology.id,
          technologySectionId: technology.technologySectionId,
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
    const section = await this.technologySectionModel.findById(technologySectionId).session(session)

    if (!section) {
      throw new BadRequestException(t('message.technologySection.notFound'))
    }

    section.technologies.push(new BaseTechnologyResponse(technology, this.cloudfrontService))
    await section.save({ session })
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
    const section = await this.technologySectionModel.findById(technologySectionId).session(session)

    if (!section) {
      throw new BadRequestException(t('message.technologySection.notFound'))
    }

    section.technologies = section.technologies.filter((t) => t.id !== technologyId)
    await section.save({ session })
  }
}
