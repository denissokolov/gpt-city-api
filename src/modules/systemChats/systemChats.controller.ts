import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
import {
  SendSystemMessageDto,
  SystemChatDto,
  SystemMessageDto,
} from './systemChat.dto';
import { SystemChatsService } from './systemChats.service';

@ApiTags('system-chats')
@ApiAvatarIdHeader()
@Controller('system-chats')
export class SystemChatsController {
  constructor(private readonly systemChatsService: SystemChatsService) {}

  @Get()
  @ApiOperation({ summary: 'List system chats owned by the current avatar' })
  @ApiResponse({ status: 200, type: [SystemChatDto] })
  list(@AvatarIdHeader() avatarId: string): Promise<SystemChatDto[]> {
    return this.systemChatsService.findAllForAvatar(avatarId);
  }

  @Post()
  @ApiOperation({
    summary:
      'Create a new system chat for the current avatar. The title is auto-generated from the first message.',
  })
  @ApiResponse({ status: 201, type: SystemChatDto })
  create(@AvatarIdHeader() avatarId: string): Promise<SystemChatDto> {
    return this.systemChatsService.create({ avatarId, title: null });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a system chat owned by the current avatar' })
  @ApiResponse({ status: 204, description: 'Chat deleted' })
  @ApiResponse({ status: 403, description: 'Avatar does not own the chat' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AvatarIdHeader() avatarId: string,
  ): Promise<void> {
    return this.systemChatsService.remove(id, avatarId);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'List messages of a system chat' })
  @ApiResponse({ status: 200, type: [SystemMessageDto] })
  @ApiResponse({ status: 403, description: 'Avatar does not own the chat' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  listMessages(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AvatarIdHeader() avatarId: string,
  ): Promise<SystemMessageDto[]> {
    return this.systemChatsService.findMessages(id, avatarId);
  }

  @Post(':id/messages')
  @ApiLocaleHeader()
  @ApiOperation({
    summary: 'Send a message to a system chat (streaming response)',
  })
  @ApiResponse({ status: 200, type: String })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 403, description: 'Avatar does not own the chat' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async sendMessage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @AvatarIdHeader() avatarId: string,
    @LocaleHeader() locale: Locale,
    @Body() dto: SendSystemMessageDto,
    @Res() res: FastifyReply,
  ) {
    const stream = await this.systemChatsService.sendMessage(
      id,
      avatarId,
      locale,
      dto,
    );
    pipeAiStreamToReply(stream, res);
  }
}
