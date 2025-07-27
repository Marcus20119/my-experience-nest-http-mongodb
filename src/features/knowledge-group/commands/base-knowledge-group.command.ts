import { BadRequestException } from '@nestjs/common'
import { ClientSession, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { BaseKnowledgeGroupResponse } from '@/common/interfaces'
import { t } from '@/common/utils'
import { KnowledgeGroup, KnowledgeItem, Technology } from '@/db/entities'

interface SyncUpdateProps {
  newKnowledgeGroup: KnowledgeGroup
  oldKnowledgeGroup: KnowledgeGroup
  session?: ClientSession
  syncAction: SyncAction.Update
}

interface SyncCreateProps {
  knowledgeGroup: KnowledgeGroup
  session?: ClientSession
  syncAction: SyncAction.Create
}

interface SyncDeleteProps {
  knowledgeGroup: KnowledgeGroup
  session?: ClientSession
  syncAction: SyncAction.Delete
}

type SyncDataProps = SyncCreateProps | SyncDeleteProps | SyncUpdateProps

export class BaseKnowledgeGroupCommand {
  constructor(
    protected readonly technologyModel: Model<Technology>,
    protected readonly knowledgeItemModel: Model<KnowledgeItem>,
  ) {}

  protected async syncData({ session, syncAction, ...props }: SyncDataProps): Promise<void> {
    switch (syncAction) {
      case SyncAction.Create: {
        const { knowledgeGroup } = props as SyncCreateProps

        await this.addKnowledgeGroupToTechnology({
          knowledgeGroup,
          session,
          technologyId: knowledgeGroup.technologyId,
        })
        break
      }

      case SyncAction.Update: {
        const { newKnowledgeGroup, oldKnowledgeGroup } = props as SyncUpdateProps

        await this.updateRelatedDocuments({ newKnowledgeGroup, oldKnowledgeGroup, session })
        break
      }

      case SyncAction.Delete: {
        const { knowledgeGroup } = props as SyncDeleteProps

        await this.deleteRelatedDocuments({ knowledgeGroup, session })
        break
      }
    }
  }

  private async updateRelatedDocuments({
    newKnowledgeGroup,
    oldKnowledgeGroup,
    session = null,
  }: {
    newKnowledgeGroup: KnowledgeGroup
    oldKnowledgeGroup: KnowledgeGroup
    session?: ClientSession | null
  }) {
    if (newKnowledgeGroup.technologyId !== oldKnowledgeGroup.technologyId) {
      await this.removeKnowledgeGroupFromTechnology({
        knowledgeGroupId: oldKnowledgeGroup.id,
        session,
        technologyId: oldKnowledgeGroup.technologyId,
      })

      await this.addKnowledgeGroupToTechnology({
        knowledgeGroup: newKnowledgeGroup,
        session,
        technologyId: newKnowledgeGroup.technologyId,
      })
    }

    await this.knowledgeItemModel
      .updateMany(
        {
          knowledgeGroupId: oldKnowledgeGroup.id,
        },
        {
          $set: {
            technologyId: newKnowledgeGroup.id,
            technologySectionId: newKnowledgeGroup.technologySectionId,
            technologyType: newKnowledgeGroup.technologyType,
          },
        },
      )
      .session(session)
  }

  private async deleteRelatedDocuments({
    knowledgeGroup,
    session = null,
  }: {
    knowledgeGroup: KnowledgeGroup
    session?: ClientSession | null
  }) {
    await this.removeKnowledgeGroupFromTechnology({
      knowledgeGroupId: knowledgeGroup.id,
      session,
      technologyId: knowledgeGroup.technologyId,
    })
    await this.knowledgeItemModel
      .deleteMany({ knowledgeGroupId: knowledgeGroup.id })
      .session(session)
  }

  private async addKnowledgeGroupToTechnology({
    knowledgeGroup,
    session = null,
    technologyId,
  }: {
    knowledgeGroup: KnowledgeGroup
    session?: ClientSession | null
    technologyId?: string
  }): Promise<void> {
    if (!technologyId || !knowledgeGroup) return

    const technology = await this.technologyModel.findById(technologyId).session(session)

    if (!technology) {
      throw new BadRequestException(t('message.technology.notFound'))
    }

    technology.knowledgeGroups.push(new BaseKnowledgeGroupResponse(knowledgeGroup))
    await technology.save({ session })
  }

  private async removeKnowledgeGroupFromTechnology({
    knowledgeGroupId,
    session = null,
    technologyId,
  }: {
    knowledgeGroupId?: string
    session?: ClientSession | null
    technologyId?: string
  }): Promise<void> {
    if (!technologyId || !knowledgeGroupId) return

    const technology = await this.technologyModel.findById(technologyId).session(session)

    if (!technology) {
      throw new BadRequestException(t('message.technology.notFound'))
    }

    technology.knowledgeGroups = technology.knowledgeGroups.filter(
      (kg) => kg.id !== knowledgeGroupId,
    )
    await technology.save({ session })
  }
}
