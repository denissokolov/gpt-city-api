import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatsLocationsAndPlaces1776033568316 implements MigrationInterface {
  name = 'AddChatsLocationsAndPlaces1776033568316';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."locations_locale_enum" AS ENUM('en-US', 'ru', 'cs', 'da', 'de', 'el', 'en-GB', 'es', 'fi', 'fr', 'hr', 'it', 'nb', 'nl', 'pl', 'pt-BR', 'pt-PT', 'sk', 'sv', 'tr', 'uk')`,
    );
    await queryRunner.query(
      `CREATE TABLE "locations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text NOT NULL, "locale" "public"."locations_locale_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "places" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" text NOT NULL, "locationId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1afab86e226b4c3bc9a74465c12" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "characterIds" uuid array NOT NULL, "summary" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0117647b3c4a4e5ff198aeb6206" PRIMARY KEY ("id"))`,
    );
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
      `ALTER TABLE "places" ADD CONSTRAINT "FK_33d1340c88129a69c9ab041a3c4" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "location_characters" ADD CONSTRAINT "FK_location_characters_location" FOREIGN KEY ("locationEntityId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "location_characters" ADD CONSTRAINT "FK_location_characters_character" FOREIGN KEY ("characterEntityId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "location_characters" DROP CONSTRAINT "FK_location_characters_character"`,
    );
    await queryRunner.query(
      `ALTER TABLE "location_characters" DROP CONSTRAINT "FK_location_characters_location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "places" DROP CONSTRAINT "FK_33d1340c88129a69c9ab041a3c4"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_location_characters_character"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_location_characters_location"`,
    );
    await queryRunner.query(`DROP TABLE "location_characters"`);
    await queryRunner.query(`DROP TABLE "chats"`);
    await queryRunner.query(`DROP TABLE "places"`);
    await queryRunner.query(`DROP TABLE "locations"`);
    await queryRunner.query(`DROP TYPE "public"."locations_locale_enum"`);
  }
}
