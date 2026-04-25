import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocationIdToCharacters1777128956940 implements MigrationInterface {
  name = 'AddLocationIdToCharacters1777128956940';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "characters" ADD "locationId" uuid`);

    await queryRunner.query(
      `UPDATE "characters" c SET "locationId" = lc."locationEntityId"
         FROM "location_characters" lc
        WHERE lc."characterEntityId" = c."id"`,
    );

    const orphans = (await queryRunner.query(
      `SELECT COUNT(*)::int AS count FROM "characters" WHERE "locationId" IS NULL`,
    )) as Array<{ count: number }>;
    if (orphans[0].count > 0) {
      throw new Error(
        `Cannot run AddLocationIdToCharacters: ${orphans[0].count} character(s) are not linked to any location. Assign every character to a location before running this migration.`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "characters" ALTER COLUMN "locationId" SET NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "location_characters" DROP CONSTRAINT "FK_location_characters_character"`,
    );
    await queryRunner.query(
      `ALTER TABLE "location_characters" DROP CONSTRAINT "FK_location_characters_location"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_location_characters_character"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_location_characters_location"`,
    );
    await queryRunner.query(`DROP TABLE "location_characters"`);

    await queryRunner.query(
      `ALTER TABLE "characters" ADD CONSTRAINT "FK_8aa06b804e5ca26d51eb8147b3c" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "location_characters" ("locationEntityId" uuid NOT NULL, "characterEntityId" uuid NOT NULL, CONSTRAINT "PK_location_characters" PRIMARY KEY ("locationEntityId", "characterEntityId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_location_characters_location" ON "location_characters" ("locationEntityId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_location_characters_character" ON "location_characters" ("characterEntityId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "location_characters" ADD CONSTRAINT "FK_location_characters_location" FOREIGN KEY ("locationEntityId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "location_characters" ADD CONSTRAINT "FK_location_characters_character" FOREIGN KEY ("characterEntityId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await queryRunner.query(
      `INSERT INTO "location_characters" ("locationEntityId", "characterEntityId")
         SELECT "locationId", "id" FROM "characters" WHERE "locationId" IS NOT NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "characters" DROP CONSTRAINT "FK_8aa06b804e5ca26d51eb8147b3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "characters" DROP COLUMN "locationId"`,
    );
  }
}
