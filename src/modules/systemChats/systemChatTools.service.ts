import { Injectable } from '@nestjs/common';
import { tool, type ToolSet } from 'ai';

import { CharacterFacade } from '../characters/character.facade';
import {
  createCharacterParams,
  deleteCharacterParams,
  getCharacterParams,
  listCharactersParams,
  updateCharacterParams,
} from '../characters/characters.tool';
import { LocationFacade } from '../locations/location.facade';
import {
  createLocationParams,
  createPlaceParams,
  deleteLocationParams,
  deletePlaceParams,
  getLocationParams,
  listLocationsParams,
  updateLocationParams,
  updatePlaceParams,
} from '../locations/locations.tool';

@Injectable()
export class SystemChatToolsService {
  constructor(
    private readonly characterFacade: CharacterFacade,
    private readonly locationFacade: LocationFacade,
  ) {}

  buildTools(): ToolSet {
    return {
      list_characters: tool({
        description: 'List all characters in the city',
        inputSchema: listCharactersParams,
        execute: async () => {
          const characters = await this.characterFacade.findAll();
          return JSON.stringify(characters, null, 2);
        },
      }),
      get_character: tool({
        description: 'Get a single character by ID',
        inputSchema: getCharacterParams,
        execute: async ({ id }) => {
          const character = await this.characterFacade.findOne(id);
          return JSON.stringify(character, null, 2);
        },
      }),
      create_character: tool({
        description: 'Create a new character in the city',
        inputSchema: createCharacterParams,
        execute: async (args) => {
          const character = await this.characterFacade.create(args);
          return JSON.stringify(character, null, 2);
        },
      }),
      update_character: tool({
        description: 'Update an existing character by ID',
        inputSchema: updateCharacterParams,
        execute: async (args) => {
          const character = await this.characterFacade.update(args);
          return JSON.stringify(character, null, 2);
        },
      }),
      delete_character: tool({
        description: 'Delete a character by ID',
        inputSchema: deleteCharacterParams,
        execute: async ({ id }) => {
          await this.characterFacade.remove(id);
          return `Character ${id} deleted`;
        },
      }),
      list_locations: tool({
        description:
          'List all locations in the city (without characters or places)',
        inputSchema: listLocationsParams,
        execute: async () => {
          const locations = await this.locationFacade.findAll();
          return JSON.stringify(locations, null, 2);
        },
      }),
      get_location: tool({
        description:
          'Get a single location by ID with its characters and places',
        inputSchema: getLocationParams,
        execute: async ({ id }) => {
          const location = await this.locationFacade.findOne(id);
          return JSON.stringify(location, null, 2);
        },
      }),
      create_location: tool({
        description: 'Create a new location in the city',
        inputSchema: createLocationParams,
        execute: async (args) => {
          const location = await this.locationFacade.create(args);
          return JSON.stringify(location, null, 2);
        },
      }),
      update_location: tool({
        description: 'Update an existing location by ID',
        inputSchema: updateLocationParams,
        execute: async (args) => {
          const location = await this.locationFacade.update(args);
          return JSON.stringify(location, null, 2);
        },
      }),
      delete_location: tool({
        description: 'Delete a location by ID (also deletes its places)',
        inputSchema: deleteLocationParams,
        execute: async ({ id }) => {
          await this.locationFacade.remove(id);
          return `Location ${id} deleted`;
        },
      }),
      create_place: tool({
        description: 'Create a new place within a location',
        inputSchema: createPlaceParams,
        execute: async (args) => {
          const place = await this.locationFacade.createPlace(args);
          return JSON.stringify(place, null, 2);
        },
      }),
      update_place: tool({
        description: 'Update an existing place by ID',
        inputSchema: updatePlaceParams,
        execute: async (args) => {
          const place = await this.locationFacade.updatePlace(args);
          return JSON.stringify(place, null, 2);
        },
      }),
      delete_place: tool({
        description: 'Delete a place by ID',
        inputSchema: deletePlaceParams,
        execute: async ({ id }) => {
          await this.locationFacade.removePlace(id);
          return `Place ${id} deleted`;
        },
      }),
    };
  }
}
