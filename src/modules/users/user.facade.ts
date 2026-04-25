import { Injectable } from '@nestjs/common';
import { UpdateUserEntityInput, UserEntity } from './user.entity';
import { UsersService } from './users.service';

@Injectable()
export class UserFacade {
  constructor(private readonly usersService: UsersService) {}

  findOne(id: string): Promise<UserEntity> {
    return this.usersService.findOne(id);
  }

  update(dto: UpdateUserEntityInput): Promise<UserEntity> {
    return this.usersService.update(dto);
  }
}
