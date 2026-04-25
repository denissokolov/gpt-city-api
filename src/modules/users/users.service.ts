import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUserEntityInput,
  UpdateUserEntityInput,
  UserEntity,
} from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  create(dto: CreateUserEntityInput): Promise<UserEntity> {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }
    return user;
  }

  async update(dto: UpdateUserEntityInput): Promise<UserEntity> {
    const user = await this.findOne(dto.id);
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }
}
