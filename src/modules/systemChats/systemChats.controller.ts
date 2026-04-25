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
  ApiLocaleHeader,
  LocaleHeader,
} from '../../common/decorators/localeHeader.decorator';
import {
  ApiUserIdHeader,
  UserIdHeader,
} from '../../common/decorators/userIdHeader.decorator';
import { Locale } from '../../common/enums/locale.enum';
import { pipeAiStreamToReply } from '../../common/utils/pipeAiStreamToReply';
import {
  SendSystemMessageDto,
  SystemChatDto,
  SystemMessageDto,
} from './systemChat.dto';
import { SystemChatsService } from './systemChats.service';

@ApiTags('system-chats')
@ApiUserIdHeader()
@Controller('system-chats')
export class SystemChatsController {
  constructor(private readonly systemChatsService: SystemChatsService) {}

  @Get()
  @ApiOperation({ summary: 'List system chats owned by the current user' })
  @ApiResponse({ status: 200, type: [SystemChatDto] })
  list(@UserIdHeader() userId: string): Promise<SystemChatDto[]> {
    return this.systemChatsService.findAllForUser(userId);
  }

  @Post()
  @ApiOperation({
    summary:
      'Create a new system chat for the current user. The title is auto-generated from the first user message.',
  })
  @ApiResponse({ status: 201, type: SystemChatDto })
  create(@UserIdHeader() userId: string): Promise<SystemChatDto> {
    return this.systemChatsService.create({ userId, title: null });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a system chat owned by the current user' })
  @ApiResponse({ status: 204, description: 'Chat deleted' })
  @ApiResponse({ status: 403, description: 'User does not own the chat' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserIdHeader() userId: string,
  ): Promise<void> {
    return this.systemChatsService.remove(id, userId);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'List messages of a system chat' })
  @ApiResponse({ status: 200, type: [SystemMessageDto] })
  @ApiResponse({ status: 403, description: 'User does not own the chat' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  listMessages(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserIdHeader() userId: string,
  ): Promise<SystemMessageDto[]> {
    return this.systemChatsService.findMessages(id, userId);
  }

  @Post(':id/messages')
  @ApiLocaleHeader()
  @ApiOperation({
    summary: 'Send a message to a system chat (streaming response)',
  })
  @ApiResponse({ status: 200, type: String })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 403, description: 'User does not own the chat' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async sendMessage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UserIdHeader() userId: string,
    @LocaleHeader() locale: Locale,
    @Body() dto: SendSystemMessageDto,
    @Res() res: FastifyReply,
  ) {
    const stream = await this.systemChatsService.sendMessage(
      id,
      userId,
      locale,
      dto,
    );
    pipeAiStreamToReply(stream, res);
  }
}
