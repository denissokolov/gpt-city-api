import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import { Locale } from '../../common/enums/locale.enum';
import type {
  CreateLocationEntityInput,
  UpdateLocationEntityInput,
} from './location.entity';
import type { CreatePlaceEntityInput } from './place.entity';
import { LocationsService } from './locations.service';

export const listLocationsParams = z.object({});

export const getLocationParams = z.object({
  id: z.uuid().describe('UUID of the location'),
});

export const createLocationParams = z.object({
  name: z.string().max(255).describe('Name of the location'),
  description: z.string().describe('Description of the location'),
  locale: z.enum(Locale).describe('Locale (e.g. en-US, pt-BR)'),
  characterIds: z
    .array(z.uuid())
    .optional()
    .describe('UUIDs of characters to assign to this location'),
});

export const updateLocationParams = z.object({
  id: z.uuid().describe('UUID of the location to update'),
  name: z.string().max(255).optional().describe('New name'),
  description: z.string().optional().describe('New description'),
  locale: z.enum(Locale).optional().describe('New locale'),
  characterIds: z
    .array(z.uuid())
    .optional()
    .describe('New set of character UUIDs for this location'),
});

export const deleteLocationParams = z.object({
  id: z.uuid().describe('UUID of the location to delete'),
});

export const createPlaceParams = z.object({
  name: z.string().max(255).describe('Name of the place'),
  description: z.string().describe('Description of the place'),
  locationId: z.uuid().describe('UUID of the parent location'),
});

export const updatePlaceParams = z.object({
  id: z.uuid().describe('UUID of the place to update'),
  name: z.string().max(255).optional().describe('New name'),
  description: z.string().optional().describe('New description'),
  locationId: z
    .uuid()
    .optional()
    .describe('New parent location UUID (to move the place)'),
});

export const deletePlaceParams = z.object({
  id: z.uuid().describe('UUID of the place to delete'),
});

@Injectable()
export class LocationsTool {
  constructor(private readonly locationsService: LocationsService) {}

  @Tool({
    name: 'list-locations',
    description:
      'List all locations in the city (without characters or places)',
    parameters: listLocationsParams,
    annotations: { readOnlyHint: true },
  })
  async listLocations() {
    const locations = await this.locationsService.findAll();
    return JSON.stringify(locations, null, 2);
  }

  @Tool({
    name: 'get-location',
    description: 'Get a single location by ID with its characters and places',
    parameters: getLocationParams,
    annotations: { readOnlyHint: true },
  })
  async getLocation({ id }: { id: string }) {
    const location = await this.locationsService.findOne(id);
    return JSON.stringify(location, null, 2);
  }

  @Tool({
    name: 'create-location',
    description: 'Create a new location in the city',
    parameters: createLocationParams,
    annotations: { readOnlyHint: false },
  })
  async createLocation(args: CreateLocationEntityInput) {
    const location = await this.locationsService.create(args);
    return JSON.stringify(location, null, 2);
  }

  @Tool({
    name: 'update-location',
    description: 'Update an existing location by ID',
    parameters: updateLocationParams,
    annotations: { readOnlyHint: false },
  })
  async updateLocation(args: UpdateLocationEntityInput) {
    const location = await this.locationsService.update(args);
    return JSON.stringify(location, null, 2);
  }

  @Tool({
    name: 'delete-location',
    description: 'Delete a location by ID (also deletes its places)',
    parameters: deleteLocationParams,
    annotations: { readOnlyHint: false, destructiveHint: true },
  })
  async deleteLocation({ id }: { id: string }) {
    await this.locationsService.remove(id);
    return `Location ${id} deleted`;
  }

  @Tool({
    name: 'create-place',
    description: 'Create a new place within a location',
    parameters: createPlaceParams,
    annotations: { readOnlyHint: false },
  })
  async createPlace(args: CreatePlaceEntityInput) {
    const place = await this.locationsService.createPlace(args);
    return JSON.stringify(place, null, 2);
  }

  @Tool({
    name: 'update-place',
    description: 'Update an existing place by ID',
    parameters: updatePlaceParams,
    annotations: { readOnlyHint: false },
  })
  async updatePlace(args: {
    id: string;
    name?: string;
    description?: string;
    locationId?: string;
  }) {
    const place = await this.locationsService.updatePlace(args);
    return JSON.stringify(place, null, 2);
  }

  @Tool({
    name: 'delete-place',
    description: 'Delete a place by ID',
    parameters: deletePlaceParams,
    annotations: { readOnlyHint: false, destructiveHint: true },
  })
  async deletePlace({ id }: { id: string }) {
    await this.locationsService.removePlace(id);
    return `Place ${id} deleted`;
  }
}
