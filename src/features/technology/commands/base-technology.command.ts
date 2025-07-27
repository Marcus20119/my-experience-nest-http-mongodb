import { BadRequestException } from '@nestjs/common'
import { ClientSession, Model } from 'mongoose'

import { IconType, SyncAction } from '@/common/enums'
import { BaseTechnologyResponse } from '@/common/interfaces'
import { t } from '@/common/utils'
import { KnowledgeGroup, KnowledgeItem, Technology, TechnologySection } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'

interface SyncUpdateProps {
  newTechnology: Technology
  oldTechnology: Technology
  session?: ClientSession
  syncAction: SyncAction.Update
}

interface SyncCreateProps {
  session?: ClientSession
  syncAction: SyncAction.Create
  technology: Technology
}

interface SyncDeleteProps {
  session?: ClientSession
  syncAction: SyncAction.Delete
  technology: Technology
}

type SyncDataProps = SyncCreateProps | SyncDeleteProps | SyncUpdateProps

export class BaseTechnologyCommand {
  constructor(
    protected readonly technologySectionModel: Model<TechnologySection>,
    protected readonly knowledgeGroupModel: Model<KnowledgeGroup>,
    protected readonly knowledgeItemModel: Model<KnowledgeItem>,
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

  protected async syncData({ session, syncAction, ...props }: SyncDataProps): Promise<void> {
    switch (syncAction) {
      case SyncAction.Create: {
        const { technology } = props as SyncCreateProps

        await this.addTechnologyToSection({
          session,
          technology,
          technologySectionId: technology.technologySectionId,
        })
        break
      }

      case SyncAction.Update: {
        const { newTechnology, oldTechnology } = props as SyncUpdateProps

        await this.updateRelatedDocuments({ newTechnology, oldTechnology, session })
        break
      }

      case SyncAction.Delete: {
        const { technology } = props as SyncDeleteProps

        await this.deleteRelatedDocuments({ session, technology })
        break
      }
    }
  }

  private async updateRelatedDocuments({
    newTechnology,
    oldTechnology,
    session = null,
  }: {
    newTechnology: Technology
    oldTechnology: Technology
    session?: ClientSession | null
  }) {
    if (newTechnology.technologySectionId !== oldTechnology.technologySectionId) {
      await this.removeTechnologyInSection({
        session,
        technologyId: oldTechnology.id,
        technologySectionId: oldTechnology.technologySectionId,
      })

      await this.addTechnologyToSection({
        session,
        technology: newTechnology,
        technologySectionId: newTechnology.technologySectionId,
      })
    }

    await this.knowledgeGroupModel
      .updateMany(
        {
          technologyId: oldTechnology.id,
        },
        {
          $set: {
            technologySectionId: newTechnology.technologySectionId,
            technologyType: newTechnology.technologyType,
          },
        },
      )
      .session(session)

    await this.knowledgeItemModel
      .updateMany(
        {
          technologyId: oldTechnology.id,
        },
        {
          $set: {
            technologySectionId: newTechnology.technologySectionId,
            technologyType: newTechnology.technologyType,
          },
        },
      )
      .session(session)
  }

  private async deleteRelatedDocuments({
    session = null,
    technology,
  }: {
    session?: ClientSession | null
    technology: Technology
  }) {
    await this.removeTechnologyInSection({
      session,
      technologyId: technology.id,
      technologySectionId: technology.technologySectionId,
    })
    await this.knowledgeGroupModel.deleteMany({ technologyId: technology.id }).session(session)
    await this.knowledgeItemModel.deleteMany({ technologyId: technology.id }).session(session)
  }

  private async addTechnologyToSection({
    session = null,
    technology,
    technologySectionId,
  }: {
    session?: ClientSession | null
    technology: Technology
    technologySectionId?: null | string
  }) {
    if (!technologySectionId || !technology) return

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
    technologyId?: null | string
    technologySectionId?: null | string
  }) {
    if (!technologySectionId || !technologyId) return

    const section = await this.technologySectionModel.findById(technologySectionId).session(session)

    if (!section) {
      throw new BadRequestException(t('message.technologySection.notFound'))
    }

    section.technologies = section.technologies.filter((t) => t.id !== technologyId)
    await section.save({ session })
  }
}
