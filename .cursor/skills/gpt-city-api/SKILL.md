---
name: gpt-city-api
description: Manage GPT City via MCP tools — characters, locations, and places. Use when the user asks to add/remove/list characters, create locations or places, assign characters to locations, or interact with the city world.
---

# GPT City API

Interact with the GPT City game through the `user-gpt-city` MCP server.

## Language

All generated text data (names, descriptions, personality, backstory) MUST be in **Russian** unless a different locale is explicitly specified for a location.

## Tools

All tools live on the `user-gpt-city` MCP server. Read the tool descriptors at runtime to get the current schema — do not rely on a hardcoded list.

### Characters

| Tool | Description |
|------|-------------|
| `get-character` | Get a single character by UUID |
| `create-character` | Create a new character (all fields required) |
| `update-character` | Partial update of a character by UUID |
| `delete-character` | Delete a character by UUID |

### Locations

| Tool | Description |
|------|-------------|
| `list-locations` | List all locations (without nested characters or places) |
| `get-location` | Get a location by UUID with its characters and places |
| `create-location` | Create a new location (name, description, locale required; optionally assign characterIds) |
| `update-location` | Partial update of a location by UUID (can reassign characterIds) |
| `delete-location` | Delete a location and its places |

### Places

Places live inside a location. They have no separate list/get — use `get-location` to see a location's places.

| Tool | Description |
|------|-------------|
| `create-place` | Create a place within a location (name, description, locationId required) |
| `update-place` | Partial update of a place by UUID (can move to another location via locationId) |
| `delete-place` | Delete a place by UUID |

## Creating a character

1. If the user gives a vague description, flesh it out into a believable person — pick a fitting Russian name, realistic age, and a rich personality/backstory.
2. Pick an appropriate AI model and provider for the character's personality (e.g. `gpt-4o` / `openai`, `claude-sonnet-4-20250514` / `anthropic`, `gemini-2.5-flash` / `google`).
3. Call `create-character` with all required fields.
4. Summarise the created character back to the user.

### Example

User: "Добавь бариста"

```json
{
  "firstName": "Марина",
  "lastName": "Соколова",
  "title": "Бариста в кофейне «Утренний свет»",
  "age": 26,
  "sex": "female",
  "personality": "Общительная и внимательная, запоминает заказы постоянных клиентов наизусть. Любит шутить по утрам, но становится задумчивой к вечеру. Тихо мечтает открыть собственную обжарку.",
  "backstory": "Выросла в пригороде, после школы уехала в город учиться на дизайнера, но влюбилась в кофейную культуру на подработке. Бросила учёбу на третьем курсе и прошла путь от стажёра до старшего бариста. Откладывает деньги на поездку в Колумбию — увидеть кофейные плантации своими глазами.",
  "model": "gpt-4o",
  "provider": "openai"
}
```

## Creating a location

1. Choose a fitting name, description, and locale for the location.
2. Optionally assign existing characters via their UUIDs.
3. Call `create-location` with the required fields.
4. After creating a location, offer to add places within it.

### Example

User: "Создай центральный район"

```json
{
  "name": "Центральный район",
  "description": "Оживлённое сердце города с магазинами, кафе и офисными зданиями. Здесь всегда многолюдно, а по вечерам загораются неоновые вывески.",
  "locale": "ru"
}
```

## Creating a place

1. A place always belongs to an existing location — get the `locationId` first (use `list-locations` if needed).
2. Call `create-place` with name, description, and locationId.

### Example

User: "Добавь кофейню в центральный район"

```json
{
  "name": "Кофейня «Утренний свет»",
  "description": "Уютная кофейня на углу главной улицы. Запах свежеобжаренного кофе чувствуется ещё за квартал.",
  "locationId": "<uuid центрального района>"
}
```
