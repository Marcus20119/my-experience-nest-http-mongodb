import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { ScheduleModule } from '@nestjs/schedule'

import { RequestContextModule } from './common/request-context'
import { TechnologySectionModule } from './features/technology-section/technology-section.module'
import { DatabaseModule } from './modules/database.module'
import { LocalizationModule } from './modules/localization.module'

@Module({
  imports: [
    // Common Modules
    CqrsModule.forRoot(),
    ScheduleModule.forRoot(),
    LocalizationModule,
    RequestContextModule,
    DatabaseModule,

    // Feature Modules
    TechnologySectionModule,
  ],
})
export class AppModule {}
