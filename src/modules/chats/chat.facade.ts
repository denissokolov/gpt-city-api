import { Injectable } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Injectable()
export class ChatFacade {
  constructor(private readonly chatsService: ChatsService) {}

  removeAllByUserId(
    userId: string,
  ): Promise<{ chats: number; messages: number }> {
    return this.chatsService.removeAllByUserId(userId);
  }
}
