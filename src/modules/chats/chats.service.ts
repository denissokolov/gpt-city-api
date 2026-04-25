import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { generateText, ModelMessage, streamText } from 'ai';

import { ChatActivity } from './chat.activity.enum';
import { ChatEntity, CreateChatEntityInput } from './chat.entity';
import { MessageEntity } from './message.entity';
import { MessageRole } from './message.enum';
import { CharacterFacade } from '../characters/character.facade';
import { LocationFacade } from '../locations/location.facade';
import { UserFacade } from '../users/user.facade';
import { SendMessageDto } from './chat.dto';
import { PromptsService } from '../../common/prompts/prompts.service';
import { Locale } from '../../common/enums/locale.enum';

@Injectable()
export class ChatsService {
  private readonly logger = new Logger(ChatsService.name);

  private readonly MAX_MESSAGE_HISTORY_LENGTH = 100;
  private readonly SUMMARY_MODEL = 'anthropic/claude-haiku-4.5';

  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly characterFacade: CharacterFacade,
    private readonly locationFacade: LocationFacade,
    private readonly userFacade: UserFacade,
    private readonly promptsService: PromptsService,
  ) {}

  async removeAllByUserId(
    userId: string,
  ): Promise<{ chats: number; messages: number }> {
    const messages = await this.messageRepository.countBy({ userId });
    const chatsResult = await this.chatRepository.delete({ userId });
    return {
      messages,
      chats: chatsResult.affected ?? 0,
    };
  }

  async create(dto: CreateChatEntityInput): Promise<ChatEntity> {
    const place = await this.locationFacade.findPlace(dto.placeId);
    if (!place) {
      throw new NotFoundException(`Place with id "${dto.placeId}" not found`);
    }

    await this.userFacade.findOne(dto.userId);

    const characters = await this.characterFacade.findByIds(dto.characterIds);
    if (characters.length !== dto.characterIds.length) {
      const foundIds = new Set(characters.map((c) => c.id));
      const missingIds = dto.characterIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Character${missingIds.length > 1 ? 's' : ''} with id${missingIds.length > 1 ? 's' : ''} "${missingIds.join(', ')}" not found`,
      );
    }

    const chat = this.chatRepository.create(dto);
    return this.chatRepository.save(chat);
  }

  async sendMessage(
    chatId: string,
    userId: string,
    locale: Locale,
    dto: SendMessageDto,
  ): Promise<ReturnType<typeof streamText>> {
    const [chat, user, history, previousChats] = await Promise.all([
      this.chatRepository.findOne({
        where: { id: chatId },
        relations: ['place', 'place.location'],
      }),
      this.userFacade.findOne(userId),
      this.messageRepository.find({
        where: { chatId: chatId },
        order: { createdAt: 'DESC' },
        take: this.MAX_MESSAGE_HISTORY_LENGTH + 1,
      }),
      this.chatRepository.find({
        where: { userId, summary: Not(IsNull()), id: Not(chatId) },
        order: { createdAt: 'DESC' },
        relations: ['place'],
        take: 10,
      }),
    ]);
    if (!chat) {
      throw new NotFoundException(`Chat with id "${chatId}" not found`);
    }
    if (!user) {
      throw new NotFoundException(`User with id "${userId}" not found`);
    }
    if (chat.userId !== user.id) {
      throw new ForbiddenException(
        `User with id "${userId}" is not the owner of the chat with id "${chatId}"`,
      );
    }

    const messages = history
      .slice(0, this.MAX_MESSAGE_HISTORY_LENGTH)
      .reverse()
      .map<ModelMessage>((m) => ({
        role: m.role,
        content: m.content,
      }));

    let activityContent: string | null = null;
    if (dto.activity === ChatActivity.Silence) {
      activityContent = this.buildSilenceMarker(
        history[0]?.createdAt ?? chat.createdAt,
      );
      messages.push({
        role: MessageRole.User,
        content: activityContent,
      });
    }

    if (dto.message) {
      messages.push({
        role: MessageRole.User,
        content: dto.message,
      });
    }

    const [memory, characters, activityMessage, userMessage] =
      await Promise.all([
        this.characterFacade.findMemory(chat.characterIds[0], user.id),
        this.characterFacade.findByIds(chat.characterIds),
        activityContent
          ? this.messageRepository.save(
              this.messageRepository.create({
                chatId: chat.id,
                userId: chat.userId,
                role: MessageRole.User,
                content: activityContent,
                characterId: null,
              }),
            )
          : Promise.resolve(null),
        dto.message
          ? this.messageRepository.save(
              this.messageRepository.create({
                chatId: chat.id,
                userId: chat.userId,
                role: MessageRole.User,
                content: dto.message,
                characterId: null,
              }),
            )
          : Promise.resolve(null),
      ]);

    const character = characters[0];

    const hasMoreMessages = history.length > this.MAX_MESSAGE_HISTORY_LENGTH;

    return streamText({
      model: `${character.provider}/${character.model}`,
      system: this.promptsService.render('chat/system', {
        character,
        place: chat.place,
        location: chat.place.location,
        user,
        memory: memory ?? undefined,
        historyIsTruncated: hasMoreMessages,
        summary: chat.summary ?? undefined,
        locale,
        previousChats: previousChats.map((c) => ({
          summary: c.summary ?? undefined,
          placeName: c.place.name,
          updatedAt: c.updatedAt,
        })),
      }),
      messages,
      experimental_telemetry: {
        isEnabled: true,
      },
      onFinish: async ({ text }) => {
        if (!text) {
          return;
        }
        const assistantMessage = await this.messageRepository.save(
          this.messageRepository.create({
            chatId: chat.id,
            userId: chat.userId,
            role: MessageRole.Assistant,
            content: text,
            characterId: character.id,
          }),
        );
        const fullHistory = [
          ...history.slice(0, this.MAX_MESSAGE_HISTORY_LENGTH).reverse(),
          ...(activityMessage ? [activityMessage] : []),
          ...(userMessage ? [userMessage] : []),
          assistantMessage,
        ];
        await Promise.all([
          this.updateChatSummary(chat, fullHistory),
          this.characterFacade.updateMemory(
            character,
            user,
            chat.place,
            chat.place.location,
            memory,
            fullHistory,
          ),
        ]);
      },
    });
  }

  private buildSilenceMarker(referenceDate: Date): string {
    const durationSeconds = Math.max(
      0,
      Math.floor((Date.now() - referenceDate.getTime()) / 1000),
    );
    return `<activity type="silence" durationSeconds="${durationSeconds}" />`;
  }

  private async updateChatSummary(
    chat: ChatEntity,
    history: MessageEntity[],
  ): Promise<void> {
    if (history.length === 0) {
      return;
    }

    const { text } = await generateText({
      model: this.SUMMARY_MODEL,
      prompt: this.promptsService.render('chatSummary/prompt', {
        existingSummary: chat.summary ?? undefined,
        messages: history,
      }),
      experimental_telemetry: {
        isEnabled: true,
      },
    });

    const summary = text.trim();
    if (!summary) {
      this.logger.warn(`Failed to generate summary for chat "${chat.id}"`);
      return;
    }
    await this.chatRepository.update(chat.id, { summary });
  }
}
