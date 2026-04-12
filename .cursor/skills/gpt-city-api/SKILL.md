---
name: gpt-city-api
description: Manage characters in GPT City via MCP tools — create, list, get, update, and delete. Use when the user asks to add a character, remove a character, list inhabitants, update personality, or interact with the city population.
---

# GPT City API

Interact with the GPT City game through the `user-gpt-city` MCP server.

## Language

All generated character data (firstName, lastName, title, personality, backstory) MUST be in **Russian**.

## Tools

All tools live on the `user-gpt-city` MCP server. Read the tool descriptors at runtime to get the current schema — do not rely on a hardcoded list.

## Creating a character

1. If the user gives a vague description, flesh it out into a believable person — pick a fitting Russian name, realistic age, and a rich personality/backstory.
2. Call `create-character` on the `user-gpt-city` MCP server with all required fields.
3. Summarise the created character back to the user.

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
  "backstory": "Выросла в пригороде, после школы уехала в город учиться на дизайнера, но влюбилась в кофейную культуру на подработке. Бросила учёбу на третьем курсе и прошла путь от стажёра до старшего бариста. Откладывает деньги на поездку в Колумбию — увидеть кофейные плантации своими глазами."
}
```
