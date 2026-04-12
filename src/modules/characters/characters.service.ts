import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Character,
  CreateCharacterInput,
  UpdateCharacterInput,
} from './character.entity';

@Injectable()
export class CharactersService {
  constructor(
    @InjectRepository(Character)
    private readonly characterRepository: Repository<Character>,
  ) {}

  findAll(): Promise<Character[]> {
    return this.characterRepository.find();
  }

  async findOne(id: string): Promise<Character> {
    const character = await this.characterRepository.findOneBy({ id });
    if (!character) {
      throw new NotFoundException(`Character with id "${id}" not found`);
    }
    return character;
  }

  create(dto: CreateCharacterInput): Promise<Character> {
    const character = this.characterRepository.create(dto);
    return this.characterRepository.save(character);
  }

  async update(dto: UpdateCharacterInput): Promise<Character> {
    const character = await this.findOne(dto.id);
    Object.assign(character, dto);
    return this.characterRepository.save(character);
  }

  async remove(id: string): Promise<void> {
    const character = await this.findOne(id);
    await this.characterRepository.remove(character);
  }
}
