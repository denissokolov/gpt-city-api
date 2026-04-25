import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelMessage, stepCountIs, streamText, ToolContent } from 'ai';

import { PromptsService } from '../../common/prompts/prompts.service';
import { UserFacade } from '../users/user.facade';
import { SendSystemMessageDto } from './systemChat.dto';
import {
  CreateSystemChatEntityInput,
  SystemChatEntity,
} from './systemChat.entity';
import { SystemMessageEntity } from './systemMessage.entity';
import { SystemMessageRole } from './systemMessage.enum';
import { SystemChatToolsService } from './systemChatTools.service';
import type { Locale } from '../../common/enums/locale.enum';

@Injectable()
export class SystemChatsService {
  private readonly MAX_MESSAGE_HISTORY_LENGTH = 100;
  private readonly MAX_TOOL_STEPS = 30;
  private readonly MAX_TITLE_LENGTH = 80;
  private readonly MODEL = 'anthropic/claude-opus-4.7';

  constructor(
    @InjectRepository(SystemChatEntity)
    private readonly systemChatRepository: Repository<SystemChatEntity>,
    @InjectRepository(SystemMessageEntity)
    private readonly systemMessageRepository: Repository<SystemMessageEntity>,
    private readonly userFacade: UserFacade,
    private readonly promptsService: PromptsService,
    private readonly systemChatToolsService: SystemChatToolsService,
  ) {}

  async findAllForUser(userId: string): Promise<SystemChatEntity[]> {
    await this.userFacade.findOne(userId);
    return this.systemChatRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dto: CreateSystemChatEntityInput): Promise<SystemChatEntity> {
    await this.userFacade.findOne(dto.userId);
    const chat = this.systemChatRepository.create(dto);
    return this.systemChatRepository.save(chat);
  }

  async findMessages(
    chatId: string,
    userId: string,
  ): Promise<SystemMessageEntity[]> {
    const chat = await this.findOwnedChat(chatId, userId);
    const messages = await this.systemMessageRepository.find({
      where: { systemChatId: chat.id },
      order: { createdAt: 'DESC' },
      take: this.MAX_MESSAGE_HISTORY_LENGTH,
    });
    return messages.reverse();
  }

  async sendMessage(
    chatId: string,
    userId: string,
    locale: Locale,
    dto: SendSystemMessageDto,
  ): Promise<ReturnType<typeof streamText>> {
    const [chat, user, history] = await Promise.all([
      this.findOwnedChat(chatId, userId),
      this.userFacade.findOne(userId),
      this.systemMessageRepository.find({
        where: { systemChatId: chatId },
        order: { createdAt: 'DESC' },
        take: this.MAX_MESSAGE_HISTORY_LENGTH,
      }),
    ]);

    const messages = history
      .reverse()
      .map<ModelMessage>((m) => this.mapMessage(m.role, m.content));

    messages.push({
      role: 'user',
      content: dto.message,
    });

    const isFirstMessage = history.length === 0;

    await this.systemMessageRepository.save(
      this.systemMessageRepository.create({
        systemChatId: chat.id,
        userId: chat.userId,
        role: SystemMessageRole.User,
        content: dto.message,
      }),
    );

    if (isFirstMessage && chat.title === null) {
      chat.title = this.deriveTitle(dto.message);
      await this.systemChatRepository.save(chat);
    }

    return streamText({
      model: this.MODEL,
      system: this.promptsService.render('systemChat/system', {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          title: user.title,
        },
        locale,
      }),
      messages,
      tools: this.systemChatToolsService.buildTools(),
      stopWhen: stepCountIs(this.MAX_TOOL_STEPS),
      experimental_telemetry: {
        isEnabled: true,
      },
      onFinish: async ({ text }) => {
        if (!text) {
          return;
        }
        await this.systemMessageRepository.save(
          this.systemMessageRepository.create({
            systemChatId: chat.id,
            userId: chat.userId,
            role: SystemMessageRole.Assistant,
            content: text,
          }),
        );
      },
    });
  }

  private async findOwnedChat(
    chatId: string,
    userId: string,
  ): Promise<SystemChatEntity> {
    const chat = await this.systemChatRepository.findOneBy({ id: chatId });
    if (!chat) {
      throw new NotFoundException(`System chat with id "${chatId}" not found`);
    }
    if (chat.userId !== userId) {
      throw new ForbiddenException(
        `User with id "${userId}" is not the owner of the system chat with id "${chatId}"`,
      );
    }
    return chat;
  }

  private deriveTitle(message: string): string {
    const firstLine = message.trim().split(/\r?\n/)[0].trim();
    if (firstLine.length <= this.MAX_TITLE_LENGTH) {
      return firstLine;
    }
    return firstLine.slice(0, this.MAX_TITLE_LENGTH - 1).trimEnd() + '…';
  }

  private mapMessage(role: SystemMessageRole, text: string): ModelMessage {
    switch (role) {
      case SystemMessageRole.User:
        return { role: 'user', content: text };
      case SystemMessageRole.Assistant:
        return { role: 'assistant', content: text };
      case SystemMessageRole.System:
        return { role: 'system', content: text };
      case SystemMessageRole.Tool:
        return { role: 'tool', content: JSON.parse(text) as ToolContent };
    }
  }
}
