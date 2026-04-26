import { Injectable } from '@nestjs/common';
import { UpsertUserInput, UserEntity } from './user.entity';
import { UsersService } from './users.service';

@Injectable()
export class UserFacade {
  constructor(private readonly usersService: UsersService) {}

  findById(id: string): Promise<UserEntity | null> {
    return this.usersService.findById(id);
  }

  upsert(input: UpsertUserInput): Promise<UserEntity> {
    return this.usersService.upsert(input);
  }
}
