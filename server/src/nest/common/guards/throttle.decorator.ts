import { SetMetadata } from '@nestjs/common';
import { THROTTLE_KEY, type ThrottleOptions } from './throttle.guard.js';

export const Throttle = (options: ThrottleOptions) => SetMetadata(THROTTLE_KEY, options);
