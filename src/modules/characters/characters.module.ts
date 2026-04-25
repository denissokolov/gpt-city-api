import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterEntity } from './character.entity';
import { CharacterMemoryEntity } from './characterMemory.entity';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { CharacterMemoriesService } from './characterMemories.service';
import { CharacterFacade } from './character.facade';
import { PromptsModule } from 'src/common/prompts/prompts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CharacterEntity, CharacterMemoryEntity]),
    PromptsModule,
  ],
  controllers: [CharactersController],
  providers: [CharactersService, CharacterMemoriesService, CharacterFacade],
  exports: [CharactersService, CharacterFacade],
})
export class CharactersModule {}
