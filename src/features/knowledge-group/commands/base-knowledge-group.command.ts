import { BadRequestException } from '@nestjs/common'
import { ClientSession, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { BaseKnowledgeGroupResponse } from '@/common/interfaces'
import { t } from '@/common/utils'
import { KnowledgeGroup, Technology } from '@/db/entities'

interface SyncUpdateKnowledgeGroupProps {
  knowledgeGroup: KnowledgeGroup
  oldKnowledgeGroupId?: string
  session?: ClientSession
  syncAction: SyncAction.Update
}

interface SyncCreateKnowledgeGroupProps {
  knowledgeGroup: KnowledgeGroup
  session?: ClientSession
  syncAction: SyncAction.Create
}

interface SyncDeleteKnowledgeGroupProps {
  knowledgeGroup: KnowledgeGroup
  session?: ClientSession
  syncAction: SyncAction.Delete
}

type SyncKnowledgeGroupProps =
  | SyncCreateKnowledgeGroupProps
  | SyncDeleteKnowledgeGroupProps
  | SyncUpdateKnowledgeGroupProps

export class BaseKnowledgeGroupCommand {
  constructor(protected readonly technologyModel: Model<Technology>) {}

  protected async syncKnowledgeGroupInfo({
    knowledgeGroup,
    session,
    syncAction,
    ...props
  }: SyncKnowledgeGroupProps): Promise<void> {
    switch (syncAction) {
      case SyncAction.Create: {
        if (!knowledgeGroup.technologyId) {
          return
        }

        await this.addKnowledgeGroupToTechnology({
          knowledgeGroup,
          session,
          technologyId: knowledgeGroup.technologyId,
        })
        break
      }

      case SyncAction.Update: {
        const { oldKnowledgeGroupId } = props as SyncUpdateKnowledgeGroupProps

        if (
          !knowledgeGroup.technologyId ||
          !oldKnowledgeGroupId ||
          knowledgeGroup.technologyId === oldKnowledgeGroupId
        ) {
          return
        }

        await this.removeKnowledgeGroupFromTechnology({
          knowledgeGroupId: oldKnowledgeGroupId,
          session,
          technologyId: knowledgeGroup.technologyId,
        })
        await this.addKnowledgeGroupToTechnology({
          knowledgeGroup,
          session,
          technologyId: knowledgeGroup.technologyId,
        })
        break
      }

      case SyncAction.Delete: {
        if (!knowledgeGroup.technologyId) {
          return
        }

        await this.removeKnowledgeGroupFromTechnology({
          knowledgeGroupId: knowledgeGroup.id,
          session,
          technologyId: knowledgeGroup.technologyId,
        })
        break
      }
    }
  }

  private async addKnowledgeGroupToTechnology({
    knowledgeGroup,
    session = null,
    technologyId,
  }: {
    knowledgeGroup: KnowledgeGroup
    session?: ClientSession | null
    technologyId: string
  }): Promise<void> {
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
    knowledgeGroupId: string
    session?: ClientSession | null
    technologyId: string
  }): Promise<void> {
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
