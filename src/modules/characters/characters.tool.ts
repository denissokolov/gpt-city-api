import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { Provider, Sex } from './character.enum';
import type {
  CreateCharacterEntityInput,
  UpdateCharacterEntityInput,
} from './character.entity';
import { CharactersService } from './characters.service';

export const listCharactersParams = z.object({});

export const getCharacterParams = z.object({
  id: z.uuid().describe('UUID of the character'),
});

export const createCharacterParams = z.object({
  firstName: z.string().max(255).describe('First name of the character'),
  lastName: z.string().max(255).describe('Last name of the character'),
  title: z
    .string()
    .max(255)
    .describe('Title or role in the city (e.g. "Professor of Physics")'),
  age: z.int().min(0).describe('Age of the character in years'),
  sex: z.enum(Sex).describe('Sex of the character'),
  personality: z.string().describe('Personality description'),
  backstory: z
    .string()
    .describe('Backstory — where they came from and what shaped them'),
  model: z
    .string()
    .max(255)
    .describe('AI model used to power the character (e.g. "gpt-4o")'),
  provider: z.enum(Provider).describe('AI provider that hosts the model'),
});

export const updateCharacterParams = z.object({
  id: z.uuid().describe('UUID of the character to update'),
  firstName: z.string().max(255).optional().describe('New first name'),
  lastName: z.string().max(255).optional().describe('New last name'),
  title: z.string().max(255).optional().describe('New title or role'),
  age: z.int().min(0).optional().describe('New age'),
  sex: z.enum(Sex).optional().describe('New sex'),
  personality: z.string().optional().describe('New personality description'),
  backstory: z.string().optional().describe('New backstory'),
  model: z.string().max(255).optional().describe('New AI model'),
  provider: z.enum(Provider).optional().describe('New AI provider'),
});

export const deleteCharacterParams = z.object({
  id: z.uuid().describe('UUID of the character to delete'),
});

@Injectable()
export class CharactersTool {
  constructor(private readonly charactersService: CharactersService) {}

  @Tool({
    name: 'list-characters',
    description: 'List all characters in the city',
    parameters: listCharactersParams,
    annotations: { readOnlyHint: true },
  })
  async listCharacters() {
    const characters = await this.charactersService.findAll();
    return JSON.stringify(characters, null, 2);
  }

  @Tool({
    name: 'get-character',
    description: 'Get a single character by ID',
    parameters: getCharacterParams,
    annotations: { readOnlyHint: true },
  })
  async getCharacter({ id }: { id: string }) {
    const character = await this.charactersService.findOne(id);
    return JSON.stringify(character, null, 2);
  }

  @Tool({
    name: 'create-character',
    description: 'Create a new character in the city',
    parameters: createCharacterParams,
    annotations: { readOnlyHint: false },
  })
  async createCharacter(args: CreateCharacterEntityInput) {
    const character = await this.charactersService.create(args);
    return JSON.stringify(character, null, 2);
  }

  @Tool({
    name: 'update-character',
    description: 'Update an existing character by ID',
    parameters: updateCharacterParams,
    annotations: { readOnlyHint: false },
  })
  async updateCharacter(args: UpdateCharacterEntityInput) {
    const character = await this.charactersService.update(args);
    return JSON.stringify(character, null, 2);
  }

  @Tool({
    name: 'delete-character',
    description: 'Delete a character by ID',
    parameters: deleteCharacterParams,
    annotations: { readOnlyHint: false, destructiveHint: true },
  })
  async deleteCharacter({ id }: { id: string }) {
    await this.charactersService.remove(id);
    return `Character ${id} deleted`;
  }
}
