import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';

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
}
