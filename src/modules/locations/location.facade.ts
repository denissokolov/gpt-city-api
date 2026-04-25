import { Injectable } from '@nestjs/common';
import {
  CreateLocationEntityInput,
  LocationEntity,
  UpdateLocationEntityInput,
} from './location.entity';
import { LocationsService } from './locations.service';
import {
  CreatePlaceEntityInput,
  PlaceEntity,
  UpdatePlaceEntityInput,
} from './place.entity';

@Injectable()
export class LocationFacade {
  constructor(private readonly locationsService: LocationsService) {}

  findAll(): Promise<LocationEntity[]> {
    return this.locationsService.findAll();
  }

  findOne(id: string): Promise<LocationEntity> {
    return this.locationsService.findOne(id);
  }

  create(dto: CreateLocationEntityInput): Promise<LocationEntity> {
    return this.locationsService.create(dto);
  }

  update(dto: UpdateLocationEntityInput): Promise<LocationEntity> {
    return this.locationsService.update(dto);
  }

  remove(id: string): Promise<void> {
    return this.locationsService.remove(id);
  }

  findPlace(id: string): Promise<PlaceEntity> {
    return this.locationsService.findPlace(id);
  }

  createPlace(dto: CreatePlaceEntityInput): Promise<PlaceEntity> {
    return this.locationsService.createPlace(dto);
  }

  updatePlace(dto: UpdatePlaceEntityInput): Promise<PlaceEntity> {
    return this.locationsService.updatePlace(dto);
  }

  removePlace(id: string): Promise<void> {
    return this.locationsService.removePlace(id);
  }
}
