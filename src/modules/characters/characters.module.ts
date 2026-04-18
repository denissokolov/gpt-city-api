import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterEntity } from './character.entity';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { CharacterFacade } from './character.facade';

@Module({
  imports: [TypeOrmModule.forFeature([CharacterEntity])],
  controllers: [CharactersController],
  providers: [CharactersService, CharacterFacade],
  exports: [CharactersService, CharacterFacade],
})
export class CharactersModule {}
