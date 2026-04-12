import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthResponseDto } from './health.dto';
import { ConfigurationService } from '../configuration/configuration.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly dataSource: DataSource,
  ) {}

  async check(): Promise<HealthResponseDto> {
    let database: string;
    try {
      await this.dataSource.query('SELECT 1');
      database = 'ok';
    } catch {
      database = 'error';
    }

    return {
      status: database === 'ok' ? 'ok' : 'degraded',
      version: this.configurationService.getServerVersion(),
      time: new Date().toISOString(),
      database,
    };
  }
}
