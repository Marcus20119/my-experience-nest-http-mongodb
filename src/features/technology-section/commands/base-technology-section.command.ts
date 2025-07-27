import { ClientSession, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { KnowledgeGroup, KnowledgeItem, Technology, TechnologySection } from '@/db/entities'

interface SyncUpdateProps {
  newTechnologySection: TechnologySection
  oldTechnologySection: TechnologySection
  session?: ClientSession
  syncAction: SyncAction.Update
}

interface SyncDeleteProps {
  session?: ClientSession
  syncAction: SyncAction.Delete
  technologySection: TechnologySection
}

type SyncDataProps = SyncDeleteProps | SyncUpdateProps

export class BaseTechnologySectionCommand {
  constructor(
    protected readonly technologyModel: Model<Technology>,
    protected readonly knowledgeGroupModel: Model<KnowledgeGroup>,
    protected readonly knowledgeItemModel: Model<KnowledgeItem>,
  ) {}

  protected async syncData({ session, syncAction, ...props }: SyncDataProps): Promise<void> {
    switch (syncAction) {
      case SyncAction.Delete: {
        const { technologySection } = props as SyncDeleteProps
        await this.deleteRelatedDocuments({ session, technologySectionId: technologySection.id })
        break
      }
      case SyncAction.Update: {
        const { newTechnologySection, oldTechnologySection } = props as SyncUpdateProps
        await this.updateRelatedDocuments({ newTechnologySection, oldTechnologySection, session })
        break
      }
    }
  }

  private async updateRelatedDocuments({
    newTechnologySection,
    oldTechnologySection,
    session = null,
  }: {
    newTechnologySection: TechnologySection
    oldTechnologySection: TechnologySection
    session?: ClientSession | null
  }) {
    await this.technologyModel
      .updateMany(
        {
          technologySectionId: oldTechnologySection.id,
        },
        {
          $set: {
            technologyType: newTechnologySection.technologyType,
          },
        },
      )
      .session(session)

    await this.knowledgeGroupModel
      .updateMany(
        {
          technologySectionId: oldTechnologySection.id,
        },
        {
          $set: {
            technologyType: newTechnologySection.technologyType,
          },
        },
      )
      .session(session)

    await this.knowledgeItemModel
      .updateMany(
        {
          technologySectionId: oldTechnologySection.id,
        },
        {
          $set: {
            technologySectionId: newTechnologySection.id,
            technologyType: newTechnologySection.technologyType,
          },
        },
      )
      .session(session)
  }

  private async deleteRelatedDocuments({
    session = null,
    technologySectionId,
  }: {
    session?: ClientSession | null
    technologySectionId: string
  }) {
    await this.technologyModel.deleteMany({ technologySectionId }).session(session)
    await this.knowledgeGroupModel.deleteMany({ technologySectionId }).session(session)
    await this.knowledgeItemModel.deleteMany({ technologySectionId }).session(session)
  }
}
