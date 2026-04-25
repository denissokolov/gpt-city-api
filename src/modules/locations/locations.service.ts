import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CharacterDto, toCharacterDto } from '../characters/character.dto';
import { CharacterEntity } from '../characters/character.entity';
import { LocationStateDto, PlaceStateDto } from './location.dto';
import {
  CreateLocationEntityInput,
  LocationEntity,
  UpdateLocationEntityInput,
} from './location.entity';
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

  async getState(id: string, userTime: string): Promise<LocationStateDto> {
    const location = await this.findOne(id);

    const distribution =
      await this.placeDistributorService.distributeCharacters(
        location,
        userTime,
      );

    const charactersById = new Map(
      location.characters.map((character) => [character.id, character]),
    );

    const charactersByPlaceId = new Map<string, CharacterDto[]>(
      distribution.map((entry) => [
        entry.placeId,
        entry.charactersIds
          .map((characterId) => charactersById.get(characterId))
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
}
