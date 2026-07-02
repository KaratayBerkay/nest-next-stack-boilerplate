import { Module } from '@nestjs/common';
import { MediaResolver } from './media.resolver';

// GraphQL interfaces (@InterfaceType) with concrete implementers resolved via resolveType.
@Module({
  providers: [MediaResolver],
})
export class InterfacesModule {}
