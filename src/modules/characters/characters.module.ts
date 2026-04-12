import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './character.entity';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';

@Module({
  imports: [TypeOrmModule.forFeature([Character])],
  controllers: [CharactersController],
  providers: [CharactersService],
})
export class CharactersModule {}
