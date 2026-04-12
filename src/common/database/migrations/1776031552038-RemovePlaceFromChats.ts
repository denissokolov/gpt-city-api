import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemovePlaceFromChats1776031552038 implements MigrationInterface {
  name = 'RemovePlaceFromChats1776031552038';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "place"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chats" ADD "place" character varying(255) NOT NULL`,
    );
  }
}
