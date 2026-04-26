import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvatarEntity } from './avatar.entity';
import { AvatarFacade } from './avatar.facade';
import { AvatarsController } from './avatars.controller';
import { AvatarsService } from './avatars.service';

@Module({
  imports: [TypeOrmModule.forFeature([AvatarEntity])],
  controllers: [AvatarsController],
  providers: [AvatarsService, AvatarFacade],
  exports: [AvatarsService, AvatarFacade],
})
export class AvatarsModule {}
