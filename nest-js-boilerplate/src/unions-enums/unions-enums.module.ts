import { Module } from '@nestjs/common';
import { SearchResolver } from './search.resolver';

// GraphQL unions (createUnionType) and enums (registerEnumType).
@Module({
  providers: [SearchResolver],
})
export class UnionsEnumsModule {}
