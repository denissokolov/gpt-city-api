import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ApiAvatarIdHeader,
  AvatarIdHeader,
} from '../../common/decorators/avatarIdHeader.decorator';
import { AvatarDto, CreateAvatarDto, UpdateAvatarDto } from './avatar.dto';
import { AvatarsService } from './avatars.service';

@ApiTags('avatars')
@Controller('avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new avatar' })
  @ApiResponse({ status: 201, type: AvatarDto })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  create(@Body() dto: CreateAvatarDto): Promise<AvatarDto> {
    return this.avatarsService.create(dto);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get the current avatar' })
  @ApiAvatarIdHeader()
  @ApiResponse({ status: 200, type: AvatarDto })
  @ApiResponse({
    status: 400,
    description: 'Missing or invalid x-avatar-id header',
  })
  @ApiResponse({ status: 404, description: 'Avatar not found' })
  findCurrent(@AvatarIdHeader() avatarId: string): Promise<AvatarDto> {
    return this.avatarsService.findOne(avatarId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing avatar profile' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the avatar',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, type: AvatarDto })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Avatar not found' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAvatarDto,
  ): Promise<AvatarDto> {
    return this.avatarsService.update({ id, ...dto });
  }
}
