import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToAvatars1777166847617 implements MigrationInterface {
  name = 'AddUserIdToAvatars1777166847617';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "avatars" ADD "userId" uuid NOT NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_b22f4499b339d4362f86c87dfb" ON "avatars" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "avatars" ADD CONSTRAINT "FK_b22f4499b339d4362f86c87dfbe" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "avatars" DROP CONSTRAINT "FK_b22f4499b339d4362f86c87dfbe"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b22f4499b339d4362f86c87dfb"`,
    );
    await queryRunner.query(`ALTER TABLE "avatars" DROP COLUMN "userId"`);
  }
}
