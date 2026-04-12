import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddModelAndProviderToCharacters1776028412999 implements MigrationInterface {
  name = 'AddModelAndProviderToCharacters1776028412999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "characters" ADD "model" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."characters_provider_enum" AS ENUM('openai', 'anthropic', 'google')`,
    );
    await queryRunner.query(
      `ALTER TABLE "characters" ADD "provider" "public"."characters_provider_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "characters" DROP COLUMN "provider"`);
    await queryRunner.query(`DROP TYPE "public"."characters_provider_enum"`);
    await queryRunner.query(`ALTER TABLE "characters" DROP COLUMN "model"`);
  }
}
