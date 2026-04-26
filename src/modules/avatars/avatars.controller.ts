import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ApiAvatarIdHeader,
  AvatarIdHeader,
} from '../../common/decorators/avatarIdHeader.decorator';
import type { JwtPayload } from '../auth/auth.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AvatarDto, CreateAvatarDto, UpdateAvatarDto } from './avatar.dto';
import { AvatarsService } from './avatars.service';

@ApiTags('avatars')
@Controller('avatars')
export class AvatarsController {
  constructor(private readonly avatarsService: AvatarsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create a new avatar owned by the authenticated user',
  })
  @ApiResponse({ status: 201, type: AvatarDto })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  create(
    @Body() dto: CreateAvatarDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<AvatarDto> {
    return this.avatarsService.create({ ...dto, userId: user.sub });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List the authenticated user's avatars" })
  @ApiResponse({ status: 200, type: [AvatarDto] })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  findMine(@CurrentUser() user: JwtPayload): Promise<AvatarDto[]> {
    return this.avatarsService.findAllByUserId(user.sub);
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
