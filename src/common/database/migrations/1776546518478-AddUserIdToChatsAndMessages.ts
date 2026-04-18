import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToChatsAndMessages1776546518478 implements MigrationInterface {
  name = 'AddUserIdToChatsAndMessages1776546518478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `TRUNCATE TABLE "messages", "chats" RESTART IDENTITY CASCADE`,
    );
    await queryRunner.query(`ALTER TABLE "chats" ADD "userId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "messages" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ae8951c0a763a060593606b7e2" ON "chats" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4838cd4fc48a6ff2d4aa01aa64" ON "messages" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ADD CONSTRAINT "FK_ae8951c0a763a060593606b7e2d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" ADD CONSTRAINT "FK_4838cd4fc48a6ff2d4aa01aa646" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "messages" DROP CONSTRAINT "FK_4838cd4fc48a6ff2d4aa01aa646"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" DROP CONSTRAINT "FK_ae8951c0a763a060593606b7e2d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4838cd4fc48a6ff2d4aa01aa64"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ae8951c0a763a060593606b7e2"`,
    );
    await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN "userId"`);
    await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "userId"`);
  }
}
