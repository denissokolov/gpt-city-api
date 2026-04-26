import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { CharacterFacade } from '../characters/character.facade';
import { ChatFacade } from '../chats/chat.facade';
import { Sex } from './avatar.enum';
import type { UpdateAvatarEntityInput } from './avatar.entity';
import { AvatarsService } from './avatars.service';

export const updateAvatarParams = z.object({
  id: z.uuid().describe('UUID of the avatar to update'),
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

export const clearAvatarHistoryParams = z.object({
  avatarId: z
    .uuid()
    .describe('UUID of the avatar whose history should be cleared'),
});

@Injectable()
export class AvatarsTool {
  constructor(
    private readonly avatarsService: AvatarsService,
    private readonly characterFacade: CharacterFacade,
    private readonly chatFacade: ChatFacade,
  ) {}

  @Tool({
    name: 'update-avatar',
    description: 'Update an existing avatar profile by ID',
    parameters: updateAvatarParams,
    annotations: { readOnlyHint: false },
  })
  async updateAvatar(args: UpdateAvatarEntityInput) {
    const avatar = await this.avatarsService.update(args);
    return JSON.stringify(avatar, null, 2);
  }

  @Tool({
    name: 'clear-avatar-history',
    description:
      "Wipe an avatar's chat history with characters: deletes all character memories about the avatar, all chats they own, and all messages in those chats. Does not touch system chats, system messages, or the avatar profile itself.",
    parameters: clearAvatarHistoryParams,
    annotations: { readOnlyHint: false, destructiveHint: true },
  })
  async clearAvatarHistory({ avatarId }: { avatarId: string }) {
    const avatar = await this.avatarsService.findOne(avatarId);
    const [{ chats, messages }, memories] = await Promise.all([
      this.chatFacade.removeAllByAvatarId(avatar.id),
      this.characterFacade.removeMemoriesByAvatarId(avatar.id),
    ]);
    return JSON.stringify(
      { avatarId: avatar.id, deleted: { memories, chats, messages } },
      null,
      2,
    );
  }
}
