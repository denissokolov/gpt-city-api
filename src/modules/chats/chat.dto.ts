import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

import { ChatActivity } from './chat.activity.enum';

export class ChatDto {
  @ApiProperty({
    description: 'Unique identifier of the chat',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  id: string;

  @ApiProperty({
    description: 'IDs of the characters participating in the chat',
    example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
  })
  characterIds: string[];

  @ApiProperty({
    description: 'ID of the place where this chat takes place',
    example: 'f1e2d3c4-b5a6-4789-bcde-f12345678901',
  })
  placeId: string;

  @ApiProperty({
    description: 'ID of the avatar who owns the chat',
    example: 'c3d4e5f6-a7b8-4012-bdef-123456789012',
  })
  avatarId: string;

  @ApiProperty({
    description: 'ID of the location state snapshot this chat is anchored to',
    example: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  })
  stateId: string;

  @ApiProperty({
    description: 'Summary of the chat conversation',
    example: 'Discussed the weather and weekend plans.',
    nullable: true,
  })
  summary: string | null;

  @ApiProperty({
    description: 'Setting for sending silence activity',
    example: 30000,
    nullable: true,
  })
  silenceIdleMs: number | null;
}

export class CreateChatDto {
  @ApiProperty({
    description: 'IDs of the characters participating in the chat',
    example: ['a1b2c3d4-e5f6-7890-abcd-ef1234567890'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  characterIds: string[];

  @ApiProperty({
    description: 'ID of the place where this chat takes place',
    example: 'f1e2d3c4-b5a6-4789-bcde-f12345678901',
  })
  @IsUUID('all')
  placeId: string;

  @ApiProperty({
    description:
      'ID of the location state snapshot returned by GET /locations/:id/state. Anchors the chat to a specific placement and mood/activity for its characters.',
    example: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  })
  @IsUUID('all')
  stateId: string;
}

export class SendMessageDto {
  @ApiProperty({
    description:
      'The message sent by the avatar. Either message, activity, or both must be provided.',
    example: 'Hello, how are you?',
    required: false,
  })
  @ValidateIf((o: SendMessageDto) => !o.activity || o.message !== undefined)
  @IsString()
  @IsNotEmpty()
  message?: string;

  @ApiProperty({
    description:
      'An avatar activity reported by the client (e.g. silence after some time). Either message, activity, or both must be provided.',
    enum: ChatActivity,
    example: ChatActivity.Silence,
    required: false,
  })
  @IsOptional()
  @IsEnum(ChatActivity)
  activity?: ChatActivity;
}
