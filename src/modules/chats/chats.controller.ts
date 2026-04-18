import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';

import { ChatDto, CreateChatDto, SendMessageDto } from './chat.dto';
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

  @Post(':id/message')
  @ApiOperation({ summary: 'Send a message to a chat' })
  @ApiResponse({ status: 200, type: String })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Res() res: FastifyReply,
  ) {
    const stream = await this.chatsService.sendMessage(id, dto);
    stream.pipeUIMessageStreamToResponse(res.raw);
  }
}
