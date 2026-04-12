import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity, CreateChatEntityInput } from './chat.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
  ) {}

  create(dto: CreateChatEntityInput): Promise<ChatEntity> {
    const chat = this.chatRepository.create(dto);
    return this.chatRepository.save(chat);
  }
}
