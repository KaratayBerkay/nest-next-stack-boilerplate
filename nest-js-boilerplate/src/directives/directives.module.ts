import { Module } from '@nestjs/common';
import { AnnouncementsResolver } from './announcements.resolver';

// Custom schema directives. The directive itself (`@upper`) is declared and wired into the
// schema once at the root GraphQLModule via `buildSchemaOptions.directives` + `transformSchema`.
@Module({
  providers: [AnnouncementsResolver],
})
export class DirectivesModule {}
