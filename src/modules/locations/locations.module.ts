import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CharacterEntity } from '../characters/character.entity';
import { LocationEntity } from './location.entity';
import { LocationFacade } from './location.facade';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { PlaceEntity } from './place.entity';
import { PlaceDistributorService } from './placeDistributor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocationEntity, PlaceEntity, CharacterEntity]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService, LocationFacade, PlaceDistributorService],
  exports: [LocationsService, LocationFacade],
})
export class LocationsModule {}
