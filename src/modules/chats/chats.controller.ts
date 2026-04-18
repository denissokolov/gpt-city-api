import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';

import {
  ApiUserIdHeader,
  UserIdHeader,
} from '../../common/decorators/userIdHeader.decorator';
import { ChatDto, CreateChatDto, SendMessageDto } from './chat.dto';
import { ChatsService } from './chats.service';

@ApiTags('chats')
@ApiUserIdHeader()
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiResponse({ status: 201, type: ChatDto })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  create(
    @UserIdHeader() userId: string,
    @Body() dto: CreateChatDto,
  ): Promise<ChatDto> {
    return this.chatsService.create({ ...dto, userId, summary: null });
  }

  @Post(':id/message')
  @ApiOperation({ summary: 'Send a message to a chat' })
  @ApiResponse({ status: 200, type: String })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async sendMessage(
    @Param('id') id: string,
    @UserIdHeader() userId: string,
    @Body() dto: SendMessageDto,
    @Res() res: FastifyReply,
  ) {
    const stream = await this.chatsService.sendMessage(id, userId, dto);

    // Fastify plugins like @fastify/cors store response headers on the
    // FastifyReply, not on the underlying Node ServerResponse. The AI SDK
    // writes the streaming body directly to `res.raw` (and calls
    // `res.raw.writeHead`), which would otherwise drop those headers — most
    // notably the CORS headers required by the browser on the streamed body.
    // Forward the reply-level headers onto the raw response, then hijack so
    // Fastify doesn't try to send a second response.
    for (const [name, value] of Object.entries(res.getHeaders())) {
      if (value !== undefined && !res.raw.hasHeader(name)) {
        res.raw.setHeader(name, value);
      }
    }
    res.hijack();

    stream.pipeUIMessageStreamToResponse(res.raw);
  }
}
