import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AvatarEntity,
  CreateAvatarEntityInput,
  UpdateAvatarEntityInput,
} from './avatar.entity';

@Injectable()
export class AvatarsService {
  constructor(
    @InjectRepository(AvatarEntity)
    private readonly avatarRepository: Repository<AvatarEntity>,
  ) {}

  create(dto: CreateAvatarEntityInput): Promise<AvatarEntity> {
    const avatar = this.avatarRepository.create(dto);
    return this.avatarRepository.save(avatar);
  }

  findAllByUserId(userId: string): Promise<AvatarEntity[]> {
    return this.avatarRepository.findBy({ userId });
  }

  async findOne(id: string): Promise<AvatarEntity> {
    const avatar = await this.avatarRepository.findOneBy({ id });
    if (!avatar) {
      throw new NotFoundException(`Avatar with id "${id}" not found`);
    }
    return avatar;
  }

  async update(dto: UpdateAvatarEntityInput): Promise<AvatarEntity> {
    const avatar = await this.findOne(dto.id);
    Object.assign(avatar, dto);
    return this.avatarRepository.save(avatar);
  }
}
