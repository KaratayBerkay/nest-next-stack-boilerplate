import { Injectable } from '@nestjs/common';
import { FeatureFlag } from './feature-flag.decorator';

// Tagged 'experimental' — should be returned by a metadata-filtered scan.
@Injectable()
@FeatureFlag('experimental')
export class ExperimentalService {}
