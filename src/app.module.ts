import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ScheduleModule } from '@nestjs/schedule'

import { RequestContextModule } from './common/request-context'
import { TechnologyModule } from './features/technology/technology.module'
import { TechnologySectionModule } from './features/technology-section/technology-section.module'
import { DatabaseModule } from './modules/database.module'
import { LocalizationModule } from './modules/localization.module'
import { S3Module } from './services/aws/s3/s3.module'

@Module({
  imports: [
    // Common Modules
    CqrsModule.forRoot(),
    ScheduleModule.forRoot(),
    LocalizationModule,
    RequestContextModule,
    DatabaseModule,
    S3Module,

    // Feature Modules
    TechnologySectionModule,
    TechnologyModule,
  ],
})
export class AppModule {}
