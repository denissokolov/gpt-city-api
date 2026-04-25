import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCharacterMemoriesTable1777145620919 implements MigrationInterface {
  name = 'CreateCharacterMemoriesTable1777145620919';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "character_memories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "characterId" uuid NOT NULL, "userId" uuid NOT NULL, "relationship" character varying(255), "sentiment" character varying(255), "familiarity" character varying(255), "keyFacts" character varying(10000), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_character_memories_character_user" UNIQUE ("characterId", "userId"), CONSTRAINT "PK_0e2c1929c2f271b38b69dc003c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_883361798572dea8a1f91a08f0" ON "character_memories" ("characterId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3c19c81ad93dac0d63ff38f453" ON "character_memories" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "character_memories" ADD CONSTRAINT "FK_883361798572dea8a1f91a08f00" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "character_memories" ADD CONSTRAINT "FK_3c19c81ad93dac0d63ff38f4539" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "character_memories" DROP CONSTRAINT "FK_3c19c81ad93dac0d63ff38f4539"`,
    );
    await queryRunner.query(
      `ALTER TABLE "character_memories" DROP CONSTRAINT "FK_883361798572dea8a1f91a08f00"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3c19c81ad93dac0d63ff38f453"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_883361798572dea8a1f91a08f0"`,
    );
    await queryRunner.query(`DROP TABLE "character_memories"`);
  }
}
