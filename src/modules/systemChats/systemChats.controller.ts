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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/auth.service';
import {
  SendSystemMessageDto,
  SystemChatDto,
  SystemMessageDto,
} from './systemChat.dto';
import { SystemChatsService } from './systemChats.service';

@ApiTags('system-chats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('system-chats')
export class SystemChatsController {
  constructor(private readonly systemChatsService: SystemChatsService) {}

  @Get()
  @ApiOperation({ summary: 'List system chats owned by the current user' })
  @ApiResponse({ status: 200, type: [SystemChatDto] })
  list(@CurrentUser() currentUser: JwtPayload): Promise<SystemChatDto[]> {
    return this.systemChatsService.findAllForUser(currentUser.sub);
  }

  @Post()
  @ApiAvatarIdHeader()
  @ApiOperation({
    summary:
      'Create a new system chat for the current user. The title is auto-generated from the first message.',
  })
  @ApiResponse({ status: 201, type: SystemChatDto })
  create(
    @CurrentUser() currentUser: JwtPayload,
    @AvatarIdHeader() avatarId: string,
  ): Promise<SystemChatDto> {
    return this.systemChatsService.create({
      userId: currentUser.sub,
      avatarId,
      title: null,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the system chat to delete',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @ApiOperation({ summary: 'Delete a system chat owned by the current user' })
  @ApiResponse({ status: 204, description: 'Chat deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden – not the owner' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<void> {
    return this.systemChatsService.remove(id, currentUser.sub);
  }

  @Get(':id/messages')
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the system chat',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @ApiOperation({ summary: 'List messages of a system chat' })
  @ApiResponse({ status: 200, type: [SystemMessageDto] })
  @ApiResponse({ status: 403, description: 'Forbidden – not the owner' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  listMessages(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: JwtPayload,
  ): Promise<SystemMessageDto[]> {
    return this.systemChatsService.findMessages(id, currentUser.sub);
  }

  @Post(':id/messages')
  @ApiAvatarIdHeader()
  @ApiLocaleHeader()
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the system chat',
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  })
  @ApiOperation({
    summary: 'Send a message to a system chat (streaming response)',
  })
  @ApiResponse({ status: 200, type: String })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 403, description: 'Forbidden – not the owner' })
  @ApiResponse({ status: 404, description: 'Chat not found' })
  async sendMessage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() currentUser: JwtPayload,
    @AvatarIdHeader() avatarId: string,
    @LocaleHeader() locale: Locale,
    @Body() dto: SendSystemMessageDto,
    @Res() res: FastifyReply,
  ) {
    const stream = await this.systemChatsService.sendMessage(
      id,
      currentUser.sub,
      avatarId,
      locale,
      dto,
    );
    pipeAiStreamToReply(stream, res);
  }
}
