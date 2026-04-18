import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

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
    description: 'Summary of the chat conversation',
    example: 'Discussed the weather and weekend plans.',
    nullable: true,
  })
  summary: string | null;
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
}

export class SendMessageDto {
  @ApiProperty({
    description: 'The message sent by the user',
    example: 'Hello, how are you?',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}
