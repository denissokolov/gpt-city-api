import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLocationStatesAndAddStateIdToChats1777159665932 implements MigrationInterface {
  name = 'CreateLocationStatesAndAddStateIdToChats1777159665932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "character_states" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stateId" uuid NOT NULL, "characterId" uuid NOT NULL, "placeId" uuid NOT NULL, "mood" character varying(255) NOT NULL, "activity" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_483d02353b3429e4386425dffed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6c83ad4e9ed9b3c0dfb879b58a" ON "character_states" ("stateId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "location_states" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "locationId" uuid NOT NULL, "userTime" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f9c1c4e258f7e4c468dbf52583d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_976b1c2019c70b0a7f41529b2d" ON "location_states" ("locationId") `,
    );
    await queryRunner.query(`DELETE FROM "chats"`);
    await queryRunner.query(`ALTER TABLE "chats" ADD "stateId" uuid NOT NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_fc0d0914b58adf1c55ef15782b" ON "chats" ("stateId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "character_states" ADD CONSTRAINT "FK_6c83ad4e9ed9b3c0dfb879b58a5" FOREIGN KEY ("stateId") REFERENCES "location_states"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "character_states" ADD CONSTRAINT "FK_cff6340e219f1a23d6f007cf1f5" FOREIGN KEY ("characterId") REFERENCES "characters"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "character_states" ADD CONSTRAINT "FK_dc0f7ddaf4bdbbbcae32fc300eb" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "location_states" ADD CONSTRAINT "FK_976b1c2019c70b0a7f41529b2d5" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chats" ADD CONSTRAINT "FK_fc0d0914b58adf1c55ef15782b6" FOREIGN KEY ("stateId") REFERENCES "location_states"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "chats" DROP CONSTRAINT "FK_fc0d0914b58adf1c55ef15782b6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "location_states" DROP CONSTRAINT "FK_976b1c2019c70b0a7f41529b2d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "character_states" DROP CONSTRAINT "FK_dc0f7ddaf4bdbbbcae32fc300eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "character_states" DROP CONSTRAINT "FK_cff6340e219f1a23d6f007cf1f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "character_states" DROP CONSTRAINT "FK_6c83ad4e9ed9b3c0dfb879b58a5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fc0d0914b58adf1c55ef15782b"`,
    );
    await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "stateId"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_976b1c2019c70b0a7f41529b2d"`,
    );
    await queryRunner.query(`DROP TABLE "location_states"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6c83ad4e9ed9b3c0dfb879b58a"`,
    );
    await queryRunner.query(`DROP TABLE "character_states"`);
  }
}
