import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1777166093470 implements MigrationInterface {
  name = 'CreateUsersTable1777166093470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // The original "users" table was renamed to "avatars" in
    // RenameUsersToAvatars1777165049688, but its primary key constraint kept
    // the auto-generated name TypeORM would also pick for the new users table.
    // Rename it first to avoid the collision.
    await queryRunner.query(
      `ALTER TABLE "avatars" RENAME CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" TO "PK_avatars_id"`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "googleId" character varying(255) NOT NULL, "email" character varying(255) NOT NULL, "name" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_f382af58ab36057334fb262efd5" UNIQUE ("googleId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(
      `ALTER TABLE "avatars" RENAME CONSTRAINT "PK_avatars_id" TO "PK_a3ffb1c0c8416b9fc6f907b7433"`,
    );
  }
}
