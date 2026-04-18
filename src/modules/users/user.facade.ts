import { Injectable } from '@nestjs/common';
import { UserEntity } from './user.entity';
import { UsersService } from './users.service';

@Injectable()
export class UserFacade {
  constructor(private readonly usersService: UsersService) {}

  findOne(id: string): Promise<UserEntity> {
    return this.usersService.findOne(id);
  }
}
