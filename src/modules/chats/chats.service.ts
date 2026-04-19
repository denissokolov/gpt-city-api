import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ModelMessage, streamText } from 'ai';

import { ChatEntity, CreateChatEntityInput } from './chat.entity';
import { MessageEntity } from './message.entity';
import { MessageRole } from './message.enum';
import { CharacterFacade } from '../characters/character.facade';
import { LocationFacade } from '../locations/location.facade';
import { UserFacade } from '../users/user.facade';
import { SendMessageDto } from './chat.dto';
import { ChatPromptHelper } from './chatPrompt.helper';

@Injectable()
export class ChatsService {
  private readonly MAX_MESSAGE_HISTORY_LENGTH = 100;

  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly characterFacade: CharacterFacade,
    private readonly locationFacade: LocationFacade,
    private readonly userFacade: UserFacade,
    private readonly chatPromptHelper: ChatPromptHelper,
  ) {}

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
    dto: SendMessageDto,
  ): Promise<ReturnType<typeof streamText>> {
    const [chat, user, history] = await Promise.all([
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

    messages.push({
      role: MessageRole.User,
      content: dto.message,
    });

    await this.messageRepository.save(
      this.messageRepository.create({
        chatId: chat.id,
        userId: chat.userId,
        role: MessageRole.User,
        content: dto.message,
        characterId: null,
      }),
    );

    const characters = await this.characterFacade.findByIds(chat.characterIds);
    const character = characters[0];

    const hasMoreMessages = history.length > this.MAX_MESSAGE_HISTORY_LENGTH;

    const systemPrompt = this.chatPromptHelper.buildSystemPrompt(
      character,
      user,
      chat,
      hasMoreMessages,
    );

    console.log(JSON.stringify(messages, null, 2));

    return streamText({
      model: `${character.provider}/${character.model}`,
      system: systemPrompt,
      messages,
      experimental_telemetry: {
        isEnabled: true,
      },
      onFinish: async ({ text }) => {
        if (!text) {
          return;
        }
        await this.messageRepository.save(
          this.messageRepository.create({
            chatId: chat.id,
            userId: chat.userId,
            role: MessageRole.Assistant,
            content: text,
            characterId: character.id,
          }),
        );
      },
    });
  }
}
