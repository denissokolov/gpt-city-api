import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthResponseDto } from './health.dto';
import { ConfigurationService } from '../../common/configuration/configuration.service';

@Injectable()
export class HealthService {
  private databaseStatus: string | null = null;

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly dataSource: DataSource,
  ) {}

  async check(): Promise<HealthResponseDto> {
    const database = await this.checkDatabase();

    return {
      status: database === 'ok' ? 'ok' : 'degraded',
      version: this.configurationService.getServerVersion(),
      time: new Date().toISOString(),
      database,
    };
  }

  private async checkDatabase(): Promise<string> {
    if (this.databaseStatus !== null) {
      return this.databaseStatus;
    }

    try {
      await this.dataSource.query('SELECT 1');
      this.databaseStatus = 'ok';
    } catch {
      this.databaseStatus = 'error';
    }

    return this.databaseStatus;
  }
}
