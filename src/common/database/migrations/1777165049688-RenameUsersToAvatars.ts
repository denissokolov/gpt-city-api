import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameUsersToAvatars1777165049688 implements MigrationInterface {
  name = 'RenameUsersToAvatars1777165049688';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" RENAME TO "avatars"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_sex_enum" RENAME TO "avatars_sex_enum"`,
    );

    await queryRunner.query(
      `ALTER TABLE "system_chats" RENAME COLUMN "userId" TO "avatarId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_messages" RENAME COLUMN "userId" TO "avatarId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" RENAME COLUMN "userId" TO "avatarId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" RENAME COLUMN "userId" TO "avatarId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "character_memories" RENAME COLUMN "userId" TO "avatarId"`,
    );

    await queryRunner.query(
      `ALTER TABLE "character_memories" RENAME CONSTRAINT "UQ_character_memories_character_user" TO "UQ_character_memories_character_avatar"`,
    );

    await queryRunner.query(
      `ALTER INDEX "public"."IDX_486323455daeaf71572ef1ba6d" RENAME TO "IDX_373281fc26c9b43e7d53a0c80e"`,
    );
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_51afd93235fc1fba49c08245c5" RENAME TO "IDX_945e3837bf572cad3ba7e8b170"`,
    );
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_ae8951c0a763a060593606b7e2" RENAME TO "IDX_82a9d6703a20e46ce040c603c0"`,
    );
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_4838cd4fc48a6ff2d4aa01aa64" RENAME TO "IDX_ce2dc342f93e0e78982f20b800"`,
    );
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_3c19c81ad93dac0d63ff38f453" RENAME TO "IDX_d8b74f309193212cc5a1a31d11"`,
    );

    await queryRunner.query(
      `ALTER TABLE "system_chats" RENAME CONSTRAINT "FK_486323455daeaf71572ef1ba6da" TO "FK_373281fc26c9b43e7d53a0c80e3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_messages" RENAME CONSTRAINT "FK_51afd93235fc1fba49c08245c54" TO "FK_945e3837bf572cad3ba7e8b170d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" RENAME CONSTRAINT "FK_ae8951c0a763a060593606b7e2d" TO "FK_82a9d6703a20e46ce040c603c03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" RENAME CONSTRAINT "FK_4838cd4fc48a6ff2d4aa01aa646" TO "FK_ce2dc342f93e0e78982f20b800d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "character_memories" RENAME CONSTRAINT "FK_3c19c81ad93dac0d63ff38f4539" TO "FK_d8b74f309193212cc5a1a31d11f"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "character_memories" RENAME CONSTRAINT "FK_d8b74f309193212cc5a1a31d11f" TO "FK_3c19c81ad93dac0d63ff38f4539"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" RENAME CONSTRAINT "FK_ce2dc342f93e0e78982f20b800d" TO "FK_4838cd4fc48a6ff2d4aa01aa646"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" RENAME CONSTRAINT "FK_82a9d6703a20e46ce040c603c03" TO "FK_ae8951c0a763a060593606b7e2d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_messages" RENAME CONSTRAINT "FK_945e3837bf572cad3ba7e8b170d" TO "FK_51afd93235fc1fba49c08245c54"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_chats" RENAME CONSTRAINT "FK_373281fc26c9b43e7d53a0c80e3" TO "FK_486323455daeaf71572ef1ba6da"`,
    );

    await queryRunner.query(
      `ALTER INDEX "public"."IDX_d8b74f309193212cc5a1a31d11" RENAME TO "IDX_3c19c81ad93dac0d63ff38f453"`,
    );
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_ce2dc342f93e0e78982f20b800" RENAME TO "IDX_4838cd4fc48a6ff2d4aa01aa64"`,
    );
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_82a9d6703a20e46ce040c603c0" RENAME TO "IDX_ae8951c0a763a060593606b7e2"`,
    );
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_945e3837bf572cad3ba7e8b170" RENAME TO "IDX_51afd93235fc1fba49c08245c5"`,
    );
    await queryRunner.query(
      `ALTER INDEX "public"."IDX_373281fc26c9b43e7d53a0c80e" RENAME TO "IDX_486323455daeaf71572ef1ba6d"`,
    );

    await queryRunner.query(
      `ALTER TABLE "character_memories" RENAME CONSTRAINT "UQ_character_memories_character_avatar" TO "UQ_character_memories_character_user"`,
    );

    await queryRunner.query(
      `ALTER TABLE "character_memories" RENAME COLUMN "avatarId" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "messages" RENAME COLUMN "avatarId" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" RENAME COLUMN "avatarId" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_messages" RENAME COLUMN "avatarId" TO "userId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "system_chats" RENAME COLUMN "avatarId" TO "userId"`,
    );

    await queryRunner.query(
      `ALTER TYPE "public"."avatars_sex_enum" RENAME TO "users_sex_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "avatars" RENAME TO "users"`);
  }
}
