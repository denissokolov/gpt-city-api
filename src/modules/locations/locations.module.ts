import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptsModule } from '../../common/prompts/prompts.module';
import { CharacterStateEntity } from './characterState.entity';
import { LocationEntity } from './location.entity';
import { LocationFacade } from './location.facade';
import { LocationStateEntity } from './locationState.entity';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { PlaceEntity } from './place.entity';
import { PlaceDistributorService } from './placeDistributor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LocationEntity,
      PlaceEntity,
      LocationStateEntity,
      CharacterStateEntity,
    ]),
    PromptsModule,
  ],
  controllers: [LocationsController],
  providers: [LocationsService, LocationFacade, PlaceDistributorService],
  exports: [LocationsService, LocationFacade],
})
export class LocationsModule {}
