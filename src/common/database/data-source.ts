import 'dotenv/config';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL !== 'false'
      ? { rejectUnauthorized: false }
      : false,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/common/database/migrations/*.ts'],
});
