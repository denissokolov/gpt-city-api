import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './chat.entity';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ChatPromptHelper } from './chatPrompt.helper';
import { MessageEntity } from './message.entity';
import { CharactersModule } from '../characters/characters.module';
import { LocationsModule } from '../locations/locations.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatEntity, MessageEntity]),
    CharactersModule,
    LocationsModule,
    UsersModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatPromptHelper],
  exports: [],
})
export class ChatsModule {}
