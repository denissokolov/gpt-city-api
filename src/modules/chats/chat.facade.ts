import { Injectable } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Injectable()
export class ChatFacade {
  constructor(private readonly chatsService: ChatsService) {}

  removeAllByAvatarId(
    avatarId: string,
  ): Promise<{ chats: number; messages: number }> {
    return this.chatsService.removeAllByAvatarId(avatarId);
  }
}
