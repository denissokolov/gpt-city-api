import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSystemChatsTables1777081719735 implements MigrationInterface {
  name = 'CreateSystemChatsTables1777081719735';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "system_chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "title" character varying(255), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5d6847bcc238044ae29f74fa7e3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_486323455daeaf71572ef1ba6d" ON "system_chats" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."system_messages_role_enum" AS ENUM('user', 'assistant', 'system', 'tool')`,
    );
    await queryRunner.query(
      `CREATE TABLE "system_messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "systemChatId" uuid NOT NULL, "userId" uuid NOT NULL, "role" "public"."system_messages_role_enum" NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ca246ef4101e88f99e87a8f0ac2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4c4931c77ba8d49a43f213f99a" ON "system_messages" ("systemChatId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_51afd93235fc1fba49c08245c5" ON "system_messages" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "system_chats" ADD CONSTRAINT "FK_486323455daeaf71572ef1ba6da" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_messages" ADD CONSTRAINT "FK_4c4931c77ba8d49a43f213f99ae" FOREIGN KEY ("systemChatId") REFERENCES "system_chats"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
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
      `ALTER TABLE "system_messages" DROP CONSTRAINT "FK_4c4931c77ba8d49a43f213f99ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_chats" DROP CONSTRAINT "FK_486323455daeaf71572ef1ba6da"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_51afd93235fc1fba49c08245c5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4c4931c77ba8d49a43f213f99a"`,
    );
    await queryRunner.query(`DROP TABLE "system_messages"`);
    await queryRunner.query(`DROP TYPE "public"."system_messages_role_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_486323455daeaf71572ef1ba6d"`,
    );
    await queryRunner.query(`DROP TABLE "system_chats"`);
  }
}
