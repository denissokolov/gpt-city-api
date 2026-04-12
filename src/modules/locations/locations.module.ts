import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterEntity } from '../characters/character.entity';
import { LocationEntity } from './location.entity';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { PlaceEntity } from './place.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationEntity, PlaceEntity, CharacterEntity]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
