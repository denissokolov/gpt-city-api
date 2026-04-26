import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class ConfigurationService {
  private readonly serverVersion: string;

  constructor() {
    const { version } = JSON.parse(
      readFileSync(join(__dirname, '..', '..', '..', 'package.json'), 'utf8'),
    ) as { version: string };
    this.serverVersion = version;
  }

  getServerVersion(): string {
    return this.serverVersion;
  }

  getWebOrigin(): string | string[] | boolean {
    const value = process.env.WEB_ORIGIN;
    if (value === undefined || value === '') {
      return true;
    }
    if (value === '*') {
      return true;
    }
    const origins = value
      .split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0);
    return origins.length === 1 ? origins[0] : origins;
  }

  getJwtSecret(): string {
    return this.requireEnv('JWT_SECRET');
  }

  getGoogleClientId(): string {
    return this.requireEnv('GOOGLE_CLIENT_ID');
  }

  getRedisUrl(): string {
    return this.requireEnv('REDIS_URL');
  }

  getDatabaseConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      url: this.requireEnv('DATABASE_URL'),
      ssl:
        process.env.DATABASE_SSL !== 'false'
          ? { rejectUnauthorized: false }
          : false,
      autoLoadEntities: true,
      synchronize: false,
      migrations: [join(__dirname, '..', 'database', 'migrations', '*.js')],
      migrationsRun: false,
    };
  }

  private requireEnv(key: string): string {
    const value = process.env[key];
    if (value === undefined || value === '') {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }
}
