import { MigrationInterface, QueryRunner } from 'typeorm';

export class AttachSystemChatsToUser1777167465934 implements MigrationInterface {
  name = 'AttachSystemChatsToUser1777167465934';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "system_chats" DROP CONSTRAINT "FK_373281fc26c9b43e7d53a0c80e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_messages" DROP CONSTRAINT "FK_945e3837bf572cad3ba7e8b170d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_373281fc26c9b43e7d53a0c80e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_945e3837bf572cad3ba7e8b170"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_chats" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_messages" ADD "userId" uuid NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_486323455daeaf71572ef1ba6d" ON "system_chats" ("userId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_51afd93235fc1fba49c08245c5" ON "system_messages" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "system_chats" ADD CONSTRAINT "FK_486323455daeaf71572ef1ba6da" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_messages" ADD CONSTRAINT "FK_51afd93235fc1fba49c08245c54" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "system_messages" DROP CONSTRAINT "FK_51afd93235fc1fba49c08245c54"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_chats" DROP CONSTRAINT "FK_486323455daeaf71572ef1ba6da"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_51afd93235fc1fba49c08245c5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_486323455daeaf71572ef1ba6d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_messages" DROP COLUMN "userId"`,
    );
    await queryRunner.query(`ALTER TABLE "system_chats" DROP COLUMN "userId"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_945e3837bf572cad3ba7e8b170" ON "system_messages" ("avatarId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_373281fc26c9b43e7d53a0c80e" ON "system_chats" ("avatarId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "system_messages" ADD CONSTRAINT "FK_945e3837bf572cad3ba7e8b170d" FOREIGN KEY ("avatarId") REFERENCES "avatars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_chats" ADD CONSTRAINT "FK_373281fc26c9b43e7d53a0c80e3" FOREIGN KEY ("avatarId") REFERENCES "avatars"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
