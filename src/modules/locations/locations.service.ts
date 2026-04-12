import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CharacterEntity } from '../characters/character.entity';
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

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(LocationEntity)
    private readonly locationRepository: Repository<LocationEntity>,
    @InjectRepository(PlaceEntity)
    private readonly placeRepository: Repository<PlaceEntity>,
    @InjectRepository(CharacterEntity)
    private readonly characterRepository: Repository<CharacterEntity>,
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

  async create(dto: CreateLocationEntityInput): Promise<LocationEntity> {
    const characters = dto.characterIds?.length
      ? await this.characterRepository.findBy({
          id: In(dto.characterIds),
        })
      : [];
    const location = this.locationRepository.create({
      name: dto.name,
      description: dto.description,
      locale: dto.locale,
      characters,
    });
    return this.locationRepository.save(location);
  }

  async update(dto: UpdateLocationEntityInput): Promise<LocationEntity> {
    const location = await this.findOne(dto.id);
    if (dto.name !== undefined) location.name = dto.name;
    if (dto.description !== undefined) location.description = dto.description;
    if (dto.locale !== undefined) location.locale = dto.locale;
    if (dto.characterIds !== undefined) {
      location.characters = dto.characterIds.length
        ? await this.characterRepository.findBy({
            id: In(dto.characterIds),
          })
        : [];
    }
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
