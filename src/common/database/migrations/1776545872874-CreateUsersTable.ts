import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1776545872874 implements MigrationInterface {
  name = 'CreateUsersTable1776545872874';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_sex_enum" AS ENUM('male', 'female', 'non_binary')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(255) NOT NULL, "lastName" character varying(255) NOT NULL, "age" integer NOT NULL, "sex" "public"."users_sex_enum" NOT NULL, "title" character varying(255) NOT NULL, "backstory" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_sex_enum"`);
  }
}
