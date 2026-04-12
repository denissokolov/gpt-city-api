---
name: generate-migration
description: Generate a TypeORM migration after entity changes. Use when the user modifies an entity file, adds new fields, creates a new entity, or asks to generate a migration.
---

# Generate Migration

## Steps

1. **Identify changed entities** — review the modified `*.entity.ts` files to understand what changed (new table, added columns, renamed fields, etc.).

2. **Derive a meaningful migration name** in `PascalCase` that describes the change. Examples:
   - Added `createdAt`/`updatedAt` to `Character` → `AddTimestampsToCharacters`
   - New `User` entity → `CreateUsersTable`
   - Added `email` column to `User` → `AddEmailToUsers`

3. **Run the generate command:**

```bash
npm run migration:generate -- src/common/database/migrations/<MigrationName>
```

TypeORM auto-prepends a timestamp, producing a file like:
`src/common/database/migrations/1744489200000-AddTimestampsToCharacters.ts`

4. **Review the generated file** — open the new migration and verify the `up`/`down` SQL reflects the expected schema changes. Fix any issues manually if needed.

5. **Verify the name matches the generated SQL** — TypeORM generates SQL based on the diff between the entity and the current database schema. The actual SQL may differ from what you expected:
   - If the generated `up` contains `CREATE TABLE` → rename to `CreateXxxTable`
   - If the generated `up` contains `ALTER TABLE ... ADD COLUMN` → name like `AddXxxToYyy`
   - If the generated `up` contains `ALTER TABLE ... DROP COLUMN` → name like `RemoveXxxFromYyy`

   Rename both the **file** and the **class name** inside it to match.

## Notes

- Always run the command from the project root.
- The data source is at `src/common/database/data-source.ts` (already wired into the npm script).
- Never put migrations in any other directory.
- After generating, remind the user to run `npm run migration:run` to apply it.
