import { forwardRef, Module } from '@nestjs/common';
import { CatsModule } from './cats.module';
import { CommonService } from './common.service';

// Module-level circular dependency resolved with forwardRef() on both sides (see CatsModule).
@Module({
  imports: [forwardRef(() => CatsModule)],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
