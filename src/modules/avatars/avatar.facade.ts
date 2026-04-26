import { Injectable } from '@nestjs/common';
import { AvatarEntity, UpdateAvatarEntityInput } from './avatar.entity';
import { AvatarsService } from './avatars.service';

@Injectable()
export class AvatarFacade {
  constructor(private readonly avatarsService: AvatarsService) {}

  findOne(id: string): Promise<AvatarEntity> {
    return this.avatarsService.findOne(id);
  }

  update(dto: UpdateAvatarEntityInput): Promise<AvatarEntity> {
    return this.avatarsService.update(dto);
  }
}
