import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { CharacterFacade } from '../characters/character.facade';
import { ChatFacade } from '../chats/chat.facade';
import { Sex } from './user.enum';
import type { UpdateUserEntityInput } from './user.entity';
import { UsersService } from './users.service';

export const updateUserParams = z.object({
  id: z.uuid().describe('UUID of the user to update'),
  firstName: z.string().max(255).optional().describe('New first name'),
  lastName: z.string().max(255).optional().describe('New last name'),
  age: z.int().min(0).max(150).optional().describe('New age in years'),
  sex: z.enum(Sex).optional().describe('New sex'),
  title: z
    .string()
    .max(255)
    .optional()
    .describe('New title or role in the city'),
  backstory: z
    .string()
    .optional()
    .describe('New backstory — where they came from and what shaped them'),
});

export const clearUserHistoryParams = z.object({
  userId: z.uuid().describe('UUID of the user whose history should be cleared'),
});

@Injectable()
export class UsersTool {
  constructor(
    private readonly usersService: UsersService,
    private readonly characterFacade: CharacterFacade,
    private readonly chatFacade: ChatFacade,
  ) {}

  @Tool({
    name: 'update-user',
    description: 'Update an existing user profile by ID',
    parameters: updateUserParams,
    annotations: { readOnlyHint: false },
  })
  async updateUser(args: UpdateUserEntityInput) {
    const user = await this.usersService.update(args);
    return JSON.stringify(user, null, 2);
  }

  @Tool({
    name: 'clear-user-history',
    description:
      "Wipe a user's chat history with characters: deletes all character memories about the user, all chats they own, and all messages in those chats. Does not touch system chats, system messages, or the user profile itself.",
    parameters: clearUserHistoryParams,
    annotations: { readOnlyHint: false, destructiveHint: true },
  })
  async clearUserHistory({ userId }: { userId: string }) {
    const user = await this.usersService.findOne(userId);
    const [{ chats, messages }, memories] = await Promise.all([
      this.chatFacade.removeAllByUserId(user.id),
      this.characterFacade.removeMemoriesByUserId(user.id),
    ]);
    return JSON.stringify(
      { userId: user.id, deleted: { memories, chats, messages } },
      null,
      2,
    );
  }
}
