import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDetailsToCharacters1776022876336 implements MigrationInterface {
  name = 'AddDetailsToCharacters1776022876336';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "characters" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "characters" ADD "firstName" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "characters" ADD "lastName" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "characters" ADD "title" character varying(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "characters" ADD "age" integer NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."characters_sex_enum" AS ENUM('male', 'female', 'non_binary')`,
    );
    await queryRunner.query(
      `ALTER TABLE "characters" ADD "sex" "public"."characters_sex_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "characters" ADD "backstory" text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "characters" DROP COLUMN "backstory"`);
    await queryRunner.query(`ALTER TABLE "characters" DROP COLUMN "sex"`);
    await queryRunner.query(`DROP TYPE "public"."characters_sex_enum"`);
    await queryRunner.query(`ALTER TABLE "characters" DROP COLUMN "age"`);
    await queryRunner.query(`ALTER TABLE "characters" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "characters" DROP COLUMN "lastName"`);
    await queryRunner.query(`ALTER TABLE "characters" DROP COLUMN "firstName"`);
    await queryRunner.query(
      `ALTER TABLE "characters" ADD "name" character varying(255) NOT NULL`,
    );
  }
}
