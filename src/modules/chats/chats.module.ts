import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './chat.entity';
import { ChatFacade } from './chat.facade';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { MessageEntity } from './message.entity';
import { CharactersModule } from '../characters/characters.module';
import { LocationsModule } from '../locations/locations.module';
import { UsersModule } from '../users/users.module';
import { PromptsModule } from 'src/common/prompts/prompts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatEntity, MessageEntity]),
    CharactersModule,
    LocationsModule,
    UsersModule,
    PromptsModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatFacade],
  exports: [ChatFacade],
})
export class ChatsModule {}
