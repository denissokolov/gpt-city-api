import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PromptsModule } from '../../common/prompts/prompts.module';
import { CharactersModule } from '../characters/characters.module';
import { ChatsModule } from '../chats/chats.module';
import { LocationsModule } from '../locations/locations.module';
import { UsersModule } from '../users/users.module';
import { SystemChatEntity } from './systemChat.entity';
import { SystemChatsController } from './systemChats.controller';
import { SystemChatsService } from './systemChats.service';
import { SystemChatToolsService } from './systemChatTools.service';
import { SystemMessageEntity } from './systemMessage.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemChatEntity, SystemMessageEntity]),
    CharactersModule,
    ChatsModule,
    LocationsModule,
    UsersModule,
    PromptsModule,
  ],
  controllers: [SystemChatsController],
  providers: [SystemChatsService, SystemChatToolsService],
  exports: [],
})
export class SystemChatsModule {}
