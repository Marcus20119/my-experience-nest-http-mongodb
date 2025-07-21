import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { PartialType } from '@nestjs/swagger'
import { Connection, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { convertSlug, t } from '@/common/utils'
import { Technology, TechnologySection } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'
import { S3Service } from '@/services/aws/s3/s3.service'

import { TechnologyResponse } from '../core/interfaces/technology.interface'
import { BaseTechnologyCommand } from './base-technology.command'
import { CreateTechnologyInput } from './create-technology.command'

export class UpdateTechnologyInput extends PartialType(CreateTechnologyInput) {}

export class UpdateTechnologyCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateTechnologyInput,
  ) {}
}

@CommandHandler(UpdateTechnologyCommand)
export class UpdateTechnologyCommandHandler
  extends BaseTechnologyCommand
  implements ICommandHandler<UpdateTechnologyCommand>
{
  constructor(
    @InjectModel(Technology.name)
    protected readonly technologyModel: Model<Technology>,
    @InjectModel(TechnologySection.name)
    protected readonly technologySectionModel: Model<TechnologySection>,
    protected readonly cloudfrontService: CloudfrontService,
    protected readonly s3Service: S3Service,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(technologySectionModel, cloudfrontService)
  }

  async execute(command: UpdateTechnologyCommand): Promise<TechnologyResponse> {
    const { id, input } = command
    const {
      color1,
      color2,
      color3,
      description,
      iconFileKey,
      iconName,
      iconType,
      name,
      rate,
      technologySectionId,
      technologyType,
    } = input

    this.verifyIcon(input)

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      if (name) {
        const existedTechnology = await this.technologyModel
          .findOne({
            $or: [{ name }, { slug: convertSlug(name) }],
            _id: { $ne: id },
          })
          .session(session)

        if (existedTechnology) {
          throw new BadRequestException(t('message.technology.existed'))
        }
      }

      const oldTechnology = await this.technologyModel.findById(id).session(session)

      const updatedTechnology = await this.technologyModel.findOneAndUpdate(
        { _id: id },
        {
          color1,
          color2,
          color3,
          description,
          iconFileKey: await this.s3Service.copyObjectFromTempToAsset(iconFileKey),
          iconName,
          iconType,
          name,
          rate,
          search: name ? convertSlug(name) : undefined,
          slug: name ? convertSlug(name) : undefined,
          technologySectionId,
          technologyType,
        },
        { new: true, session },
      )

      if (!updatedTechnology) {
        throw new BadRequestException(t('message.technology.notFound'))
      }

      if (technologySectionId) {
        const technologySection = await this.technologySectionModel
          .findById(input.technologySectionId)
          .session(session)

        if (!technologySection) {
          throw new BadRequestException(t('message.technologySection.notFound'))
        }

        if (technologySection.technologyType !== technologyType) {
          throw new BadRequestException(t('message.technology.technologyTypeNotMatch'))
        }

        await this.syncTechnologySectionInfo({
          oldTechnologySectionId: oldTechnology?.technologySectionId,
          session,
          syncAction: SyncAction.Update,
          technology: updatedTechnology,
        })
      }

      await session.commitTransaction()
      return new TechnologyResponse(updatedTechnology, this.cloudfrontService)
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
