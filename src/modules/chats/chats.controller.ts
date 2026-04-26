import { Body, Controller, Param, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';

import {
  ApiAvatarIdHeader,
  AvatarIdHeader,
} from '../../common/decorators/avatarIdHeader.decorator';
import {
  ApiLocaleHeader,
  LocaleHeader,
} from '../../common/decorators/localeHeader.decorator';
import { Locale } from '../../common/enums/locale.enum';
import { pipeAiStreamToReply } from '../../common/utils/pipeAiStreamToReply';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatDto, CreateChatDto, SendMessageDto } from './chat.dto';
import { ChatsService } from './chats.service';

@ApiTags('chats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiAvatarIdHeader()
@ApiLocaleHeader()
@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiResponse({ status: 201, type: ChatDto })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  create(
    @AvatarIdHeader() avatarId: string,
    @Body() dto: CreateChatDto,
  ): Promise<ChatDto> {
    return this.chatsService.create({ ...dto, avatarId, summary: null });
  }

  @Post(':id/message')
  @ApiOperation({ summary: 'Send a message to a chat' })
  @ApiResponse({ status: 200, type: String })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  async sendMessage(
    @Param('id') id: string,
    @AvatarIdHeader() avatarId: string,
    @LocaleHeader() locale: Locale,
    @Body() dto: SendMessageDto,
    @Res() res: FastifyReply,
  ) {
    const stream = await this.chatsService.sendMessage(
      id,
      avatarId,
      locale,
      dto,
    );
    pipeAiStreamToReply(stream, res);
  }
}
