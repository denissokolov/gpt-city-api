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
  ApiUserIdHeader,
  UserIdHeader,
} from '../../common/decorators/userIdHeader.decorator';
import { CreateUserDto, UpdateUserDto, UserDto } from './user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, type: UserDto })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(dto);
  }

  @Get('current')
  @ApiOperation({ summary: 'Get the current user' })
  @ApiUserIdHeader()
  @ApiResponse({ status: 200, type: UserDto })
  @ApiResponse({
    status: 400,
    description: 'Missing or invalid x-user-id header',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  findCurrent(@UserIdHeader() userId: string): Promise<UserDto> {
    return this.usersService.findOne(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing user profile' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the user',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({ status: 200, type: UserDto })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserDto> {
    return this.usersService.update({ id, ...dto });
  }
}
