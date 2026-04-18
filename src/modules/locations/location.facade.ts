import { Injectable } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { PlaceEntity } from './place.entity';

@Injectable()
export class LocationFacade {
  constructor(private readonly locationsService: LocationsService) {}

  findPlace(id: string): Promise<PlaceEntity> {
    return this.locationsService.findPlace(id);
  }
}
