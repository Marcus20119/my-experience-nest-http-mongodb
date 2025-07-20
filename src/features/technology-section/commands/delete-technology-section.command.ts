import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

import { t } from '@/common/utils'
import { Technology, TechnologySection } from '@/db/entities'
import { S3Service } from '@/services/aws/s3/s3.service'

export class DeleteTechnologySectionCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteTechnologySectionCommand)
export class DeleteTechnologySectionCommandHandler
  implements ICommandHandler<DeleteTechnologySectionCommand>
{
  constructor(
    @InjectModel(TechnologySection.name)
    private readonly technologySectionModel: Model<TechnologySection>,
    @InjectModel(Technology.name)
    private readonly technologyModel: Model<Technology>,
    protected readonly s3Service: S3Service,
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async execute(command: DeleteTechnologySectionCommand): Promise<void> {
    const session = await this.connection.startSession()
    session.startTransaction()

    let iconFileKeys: string[] = []

    try {
      const technologySection = await this.technologySectionModel.findById(command.id)

      if (!technologySection) {
        throw new BadRequestException(t('message.technologySection.notFound'))
      }
      // Step 1: Fetch associated technologies
      const technologies = await this.technologyModel
        .find({ technologySectionId: command.id })
        .session(session)

      // Step 2: Extract iconFileKeys (file keys) from associated technologies
      iconFileKeys = technologies.map((t) => t.iconFileKey).filter((url): url is string => !!url)

      // Step 3: Delete technologies
      await this.technologyModel.deleteMany({ technologySectionId: command.id }).session(session)

      // Step 4: Delete the section itself
      await this.technologySectionModel.findByIdAndDelete(command.id).session(session)

      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }

    // 🧹 Step 5: Cleanup S3 + CloudFront outside transaction
    if (iconFileKeys.length > 0) {
      await this.s3Service.deleteFiles(iconFileKeys)
    }
  }
}
