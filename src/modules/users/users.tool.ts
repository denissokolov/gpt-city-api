import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
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

@Injectable()
export class UsersTool {
  constructor(private readonly usersService: UsersService) {}

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
}
