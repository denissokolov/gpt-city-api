import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatDto, CreateChatDto } from './chat.dto';
import { ChatsService } from './chats.service';

@ApiTags('chats')
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiResponse({ status: 201, type: ChatDto })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  create(@Body() dto: CreateChatDto): Promise<ChatDto> {
    return this.chatsService.create({ ...dto, summary: null });
  }
}
