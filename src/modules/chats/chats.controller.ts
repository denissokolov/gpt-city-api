import { Body, Controller, Param, Post, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';

import {
  ApiLocaleHeader,
  LocaleHeader,
} from '../../common/decorators/localeHeader.decorator';
import {
  ApiUserIdHeader,
  UserIdHeader,
} from '../../common/decorators/userIdHeader.decorator';
import { Locale } from '../../common/enums/locale.enum';
import { pipeAiStreamToReply } from '../../common/utils/pipeAiStreamToReply';
import { ChatDto, CreateChatDto, SendMessageDto } from './chat.dto';
import { ChatsService } from './chats.service';

@ApiTags('chats')
@ApiUserIdHeader()
@ApiLocaleHeader()
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
    @LocaleHeader() locale: Locale,
    @Body() dto: SendMessageDto,
    @Res() res: FastifyReply,
  ) {
    const stream = await this.chatsService.sendMessage(id, userId, locale, dto);
    pipeAiStreamToReply(stream, res);
  }
}
