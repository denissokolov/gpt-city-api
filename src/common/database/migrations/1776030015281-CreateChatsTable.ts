import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChatsTable1776030015281 implements MigrationInterface {
  name = 'CreateChatsTable1776030015281';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "characterIds" uuid array NOT NULL, "place" character varying(255) NOT NULL, "summary" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "chats"`);
  }
}
