import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertUserInput, UserEntity } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOneBy({ id });
  }

  async upsert(input: UpsertUserInput): Promise<UserEntity> {
    const existing = await this.userRepository.findOneBy({
      googleId: input.googleId,
    });
    if (existing) {
      Object.assign(existing, input);
      return this.userRepository.save(existing);
    }
    const user = this.userRepository.create(input);
    return this.userRepository.save(user);
  }
}
