import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserEntityInput, UserEntity } from './user.entity';

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
}
