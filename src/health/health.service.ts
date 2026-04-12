import { Injectable } from '@nestjs/common';
import { HealthResponseDto } from './health.dto';
import { ConfigurationService } from '../configuration/configuration.service';

@Injectable()
export class HealthService {
  constructor(private readonly configurationService: ConfigurationService) {}

  check(): HealthResponseDto {
    return {
      status: 'ok',
      version: this.configurationService.getServerVersion(),
      time: new Date().toISOString(),
    };
  }
}
