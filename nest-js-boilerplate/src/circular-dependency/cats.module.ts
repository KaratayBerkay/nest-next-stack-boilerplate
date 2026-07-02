import { forwardRef, Module } from '@nestjs/common';
import { CatsService } from './cats.service';
import { CommonModule } from './common.module';

// The two modules import each other; forwardRef() on both sides breaks the otherwise-unresolvable
// cycle.
@Module({
  imports: [forwardRef(() => CommonModule)],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
