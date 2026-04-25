import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSystemInstructionsToCharacters1777138505080 implements MigrationInterface {
  name = 'AddSystemInstructionsToCharacters1777138505080';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "characters" ADD "systemInstructions" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "characters" DROP COLUMN "systemInstructions"`,
    );
  }
}
