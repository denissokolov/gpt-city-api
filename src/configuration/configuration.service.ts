import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class ConfigurationService {
  private readonly serverVersion: string;

  constructor() {
    const { version } = JSON.parse(
      readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8'),
    ) as { version: string };
    this.serverVersion = version;
  }

  getServerVersion(): string {
    return this.serverVersion;
  }

  getDatabaseConfig(): TypeOrmModuleOptions {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      return {
        type: 'postgres',
        url: databaseUrl,
        ssl:
          process.env.DATABASE_SSL !== 'false'
            ? { rejectUnauthorized: false }
            : false,
        autoLoadEntities: true,
        synchronize: false,
      };
    }

    return {
      type: 'postgres',
      host: this.requireEnv('DATABASE_HOST'),
      port: parseInt(this.requireEnv('DATABASE_PORT'), 10),
      username: this.requireEnv('DATABASE_USERNAME'),
      password: this.requireEnv('DATABASE_PASSWORD'),
      database: this.requireEnv('DATABASE_NAME'),
      ssl:
        process.env.DATABASE_SSL !== 'false'
          ? { rejectUnauthorized: false }
          : false,
      autoLoadEntities: true,
      synchronize: false,
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
