import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './feature-flag.decorator';

// Tagged with a different flag value, to prove filtering selects by value.
@Injectable()
@FeatureFlag('stable')
export class StableService {}
