import { BadRequestException } from '@nestjs/common'
import { ClientSession, Model } from 'mongoose'

import { IconType, SyncAction } from '@/common/enums'
import { BaseKnowledgeItemResponse } from '@/common/interfaces'
import { t } from '@/common/utils'
import { KnowledgeGroup, KnowledgeItem } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'

interface SyncUpdateProps {
  newKnowledgeItem: KnowledgeItem
  oldKnowledgeItem: KnowledgeItem
  session?: ClientSession
  syncAction: SyncAction.Update
}

interface SyncCreateProps {
  knowledgeItem: KnowledgeItem
  session?: ClientSession
  syncAction: SyncAction.Create
}

interface SyncDeleteProps {
  knowledgeItem: KnowledgeItem
  session?: ClientSession
  syncAction: SyncAction.Delete
}

type SyncDataProps = SyncCreateProps | SyncDeleteProps | SyncUpdateProps

export class BaseKnowledgeItemCommand {
  constructor(
    protected readonly knowledgeGroupModel: Model<KnowledgeGroup>,
    protected readonly cloudfrontService: CloudfrontService,
  ) {}

  protected verifyIcon(knowledgeItem?: Partial<KnowledgeItem>): void {
    if (!knowledgeItem) {
      return
    }

    const { iconFileKey, iconName, iconType } = knowledgeItem

    switch (iconType) {
      case IconType.Iconify: {
        if (!iconName) {
          throw new BadRequestException(t('message.knowledgeItem.shouldContainIconName'))
        }
        break
      }

      case IconType.Custom: {
        if (!iconFileKey) {
          throw new BadRequestException(t('message.knowledgeItem.shouldContainIconUrl'))
        }
        break
      }

      default: {
        break
      }
    }
  }

  private async updateRelatedDocuments({
    newKnowledgeItem,
    oldKnowledgeItem,
    session = null,
  }: {
    newKnowledgeItem: KnowledgeItem
    oldKnowledgeItem: KnowledgeItem
    session?: ClientSession | null
  }) {
    if (newKnowledgeItem.knowledgeGroupId !== oldKnowledgeItem.knowledgeGroupId) {
      await this.addKnowledgeItemInGroup({
        knowledgeGroupId: newKnowledgeItem.knowledgeGroupId,
        knowledgeItem: newKnowledgeItem,
        session,
      })
      await this.removeKnowledgeItemInGroup({
        knowledgeGroupId: oldKnowledgeItem.knowledgeGroupId,
        knowledgeItemId: oldKnowledgeItem.id,
        session,
      })
    }
  }

  protected async syncData({ session, syncAction, ...props }: SyncDataProps) {
    switch (syncAction) {
      case SyncAction.Create: {
        const { knowledgeItem } = props as SyncCreateProps
        await this.addKnowledgeItemInGroup({
          knowledgeGroupId: knowledgeItem.knowledgeGroupId,
          knowledgeItem,
          session,
        })
        break
      }

      case SyncAction.Update: {
        const { newKnowledgeItem, oldKnowledgeItem } = props as SyncUpdateProps
        await this.updateRelatedDocuments({ newKnowledgeItem, oldKnowledgeItem, session })
        break
      }

      case SyncAction.Delete: {
        const { knowledgeItem } = props as SyncDeleteProps
        await this.deleteRelatedDocuments({ knowledgeItem, session })
        break
      }
    }
  }

  private async deleteRelatedDocuments({
    knowledgeItem,
    session = null,
  }: {
    knowledgeItem: KnowledgeItem
    session?: ClientSession | null
  }) {
    await this.removeKnowledgeItemInGroup({
      knowledgeGroupId: knowledgeItem.knowledgeGroupId,
      knowledgeItemId: knowledgeItem.id,
      session,
    })
  }

  private async addKnowledgeItemInGroup({
    knowledgeGroupId,
    knowledgeItem,
    session = null,
  }: {
    knowledgeGroupId?: null | string
    knowledgeItem?: KnowledgeItem
    session?: ClientSession | null
  }) {
    if (!knowledgeGroupId || !knowledgeItem) return

    const knowledgeGroup = await this.knowledgeGroupModel
      .findById(knowledgeGroupId)
      .session(session)

    if (!knowledgeGroup) {
      throw new BadRequestException(t('message.knowledgeGroup.notFound'))
    }

    knowledgeGroup.knowledgeItems.push(
      new BaseKnowledgeItemResponse(knowledgeItem, this.cloudfrontService),
    )
    await knowledgeGroup.save({ session })
  }

  private async removeKnowledgeItemInGroup({
    knowledgeGroupId,
    knowledgeItemId,
    session = null,
  }: {
    knowledgeGroupId?: null | string
    knowledgeItemId?: null | string
    session?: ClientSession | null
  }) {
    if (!knowledgeGroupId || !knowledgeItemId) return

    const knowledgeGroup = await this.knowledgeGroupModel
      .findById(knowledgeGroupId)
      .session(session)

    if (!knowledgeGroup) {
      throw new BadRequestException(t('message.knowledgeGroup.notFound'))
    }

    knowledgeGroup.knowledgeItems = knowledgeGroup.knowledgeItems.filter(
      (ki) => ki.id !== knowledgeItemId,
    )
    await knowledgeGroup.save({ session })
  }
}
