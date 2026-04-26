import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { SystemMessageRole } from './systemMessage.enum';

export class SystemChatDto {
  @ApiProperty({
    description: 'Unique identifier of the system chat',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the avatar who owns the system chat',
    example: 'c3d4e5f6-a7b8-4012-bdef-123456789012',
  })
  avatarId: string;

  @ApiProperty({
    description:
      'Human-readable title of the system chat. Auto-generated from the first message; null until the avatar sends one.',
    example: 'Tweak personalities of city characters',
    nullable: true,
  })
  title: string | null;

  @ApiProperty({
    description: 'Date and time when the system chat was created',
    example: '2026-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date and time when the system chat was last updated',
    example: '2026-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class SystemMessageDto {
  @ApiProperty({
    description: 'Unique identifier of the message',
    example: 'd4e5f6a7-b8c9-4012-cdef-123456789012',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the system chat this message belongs to',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  systemChatId: string;

  @ApiProperty({
    description: 'ID of the avatar who owns the chat this message belongs to',
    example: 'c3d4e5f6-a7b8-4012-bdef-123456789012',
  })
  avatarId: string;

  @ApiProperty({
    description: 'Role of the message author',
    enum: SystemMessageRole,
    example: SystemMessageRole.User,
  })
  role: SystemMessageRole;

  @ApiProperty({
    description: 'Text content of the message',
    example: 'Please create a new character named Alice.',
  })
  content: string;

  @ApiProperty({
    description: 'Date and time when the message was created',
    example: '2026-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export class SendSystemMessageDto {
  @ApiProperty({
    description: 'The message sent by the avatar to the system assistant',
    example: 'Please create a new character named Alice, age 30.',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
