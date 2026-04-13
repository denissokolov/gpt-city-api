import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlaceIdToChats1776039142112 implements MigrationInterface {
  name = 'AddPlaceIdToChats1776039142112';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "chats" ADD "placeId" uuid NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "chats" ADD CONSTRAINT "FK_43dd63d4abf4237d32c73356dba" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chats" DROP CONSTRAINT "FK_43dd63d4abf4237d32c73356dba"`,
    );
    await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "placeId"`);
  }
}
