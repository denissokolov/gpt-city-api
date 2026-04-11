import { Injectable } from '@nestjs/common';
import { version } from '../../package.json';
import { HealthResponseDto } from './health.dto';

@Injectable()
export class HealthService {
  check(): HealthResponseDto {
    return {
      status: 'ok',
      version,
      time: new Date().toISOString(),
    };
  }
}
