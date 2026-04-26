import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterDto, toCharacterDto } from '../characters/character.dto';
import { CharacterEntity } from '../characters/character.entity';
import { CharacterStateEntity } from './characterState.entity';
import { LocationStateDto, PlaceStateDto } from './location.dto';
import {
  CreateLocationEntityInput,
  LocationEntity,
  UpdateLocationEntityInput,
} from './location.entity';
import { LocationStateEntity } from './locationState.entity';
import {
  CreatePlaceEntityInput,
  PlaceEntity,
  UpdatePlaceEntityInput,
} from './place.entity';
import { PlaceDistributorService } from './placeDistributor.service';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
    @InjectRepository(PlaceEntity)
    private readonly placeRepository: Repository<PlaceEntity>,
    @InjectRepository(LocationStateEntity)
    private readonly locationStateRepository: Repository<LocationStateEntity>,
    @InjectRepository(CharacterStateEntity)
    private readonly characterStateRepository: Repository<CharacterStateEntity>,
    private readonly placeDistributorService: PlaceDistributorService,
  ) {}

  findAll(): Promise<LocationEntity[]> {
    return this.locationRepository.find();
  }

  async findOne(id: string): Promise<LocationEntity> {
    const location = await this.locationRepository.findOne({
      where: { id },
      relations: ['characters', 'places'],
    });
    if (!location) {
      throw new NotFoundException(`Location with id "${id}" not found`);
    }
    return location;
  }

  private static readonly STATE_TTL_MS = 60 * 60 * 1000;

  async getState(id: string, userTime: string): Promise<LocationStateDto> {
    const location = await this.findOne(id);

    const recentState = await this.locationStateRepository.findOne({
      where: { locationId: location.id, userTime: new Date(userTime) },
      order: { createdAt: 'DESC' },
    });

    if (
      recentState &&
      Date.now() - recentState.createdAt.getTime() <
        LocationsService.STATE_TTL_MS
    ) {
      const characterStates = await this.characterStateRepository.find({
        where: { stateId: recentState.id },
      });

      const charactersById = new Map(
        location.characters.map((character) => [character.id, character]),
      );

      const charactersByPlaceId = new Map<string, CharacterDto[]>();
      for (const cs of characterStates) {
        const character = charactersById.get(cs.characterId);
        if (!character) continue;
        const list = charactersByPlaceId.get(cs.placeId) ?? [];
        list.push(toCharacterDto(character));
        charactersByPlaceId.set(cs.placeId, list);
      }

      const places: PlaceStateDto[] = location.places.map((place) => ({
        id: place.id,
        name: place.name,
        description: place.description,
        characters: charactersByPlaceId.get(place.id) ?? [],
      }));

      return {
        id: location.id,
        name: location.name,
        description: location.description,
        locale: location.locale,
        stateId: recentState.id,
        places,
      };
    }

    const distribution =
      await this.placeDistributorService.distributeCharacters(
        location,
        userTime,
      );

    const state = await this.locationStateRepository.save(
      this.locationStateRepository.create({
        locationId: location.id,
        userTime: new Date(userTime),
      }),
    );

    const characterStateRows = distribution.flatMap((entry) =>
      entry.characters.map((character) => ({
        stateId: state.id,
        characterId: character.characterId,
        placeId: entry.placeId,
        mood: character.mood,
        activity: character.activity,
      })),
    );
    if (characterStateRows.length > 0) {
      await this.characterStateRepository.save(
        characterStateRows.map((row) =>
          this.characterStateRepository.create(row),
        ),
      );
    }

    const charactersById = new Map(
      location.characters.map((character) => [character.id, character]),
    );

    const charactersByPlaceId = new Map<string, CharacterDto[]>(
      distribution.map((entry) => [
        entry.placeId,
        entry.characters
          .map(({ characterId }) => charactersById.get(characterId))
          .filter(
            (character): character is CharacterEntity =>
              character !== undefined,
          )
          .map((character) => toCharacterDto(character)),
      ]),
    );

    const places: PlaceStateDto[] = location.places.map((place) => ({
      id: place.id,
      name: place.name,
      description: place.description,
      characters: charactersByPlaceId.get(place.id) ?? [],
    }));

    return {
      id: location.id,
      name: location.name,
      description: location.description,
      locale: location.locale,
      stateId: state.id,
      places,
    };
  }

  async create(dto: CreateLocationEntityInput): Promise<LocationEntity> {
    const location = this.locationRepository.create(dto);
    return this.locationRepository.save(location);
  }

  async update(dto: UpdateLocationEntityInput): Promise<LocationEntity> {
    const location = await this.findOne(dto.id);
    if (dto.name !== undefined) location.name = dto.name;
    if (dto.description !== undefined) location.description = dto.description;
    if (dto.locale !== undefined) location.locale = dto.locale;
    return this.locationRepository.save(location);
  }

  async remove(id: string): Promise<void> {
    const location = await this.findOne(id);
    await this.locationRepository.remove(location);
  }

  async createPlace(dto: CreatePlaceEntityInput): Promise<PlaceEntity> {
    await this.findOne(dto.locationId);
    const place = this.placeRepository.create(dto);
    return this.placeRepository.save(place);
  }

  async findPlace(id: string): Promise<PlaceEntity> {
    const place = await this.placeRepository.findOneBy({ id });
    if (!place) {
      throw new NotFoundException(`Place with id "${id}" not found`);
    }
    return place;
  }

  async updatePlace(dto: UpdatePlaceEntityInput): Promise<PlaceEntity> {
    const place = await this.findPlace(dto.id);
    if (dto.locationId !== undefined) {
      await this.findOne(dto.locationId);
    }
    Object.assign(place, dto);
    return this.placeRepository.save(place);
  }

  async removePlace(id: string): Promise<void> {
    const place = await this.findPlace(id);
    await this.placeRepository.remove(place);
  }

  findState(stateId: string): Promise<LocationStateEntity | null> {
    return this.locationStateRepository.findOneBy({ id: stateId });
  }

  findCharacterState(
    stateId: string,
    characterId: string,
  ): Promise<CharacterStateEntity | null> {
    return this.characterStateRepository.findOneBy({ stateId, characterId });
  }
}
