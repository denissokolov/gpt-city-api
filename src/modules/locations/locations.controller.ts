import { Controller, Get, Headers, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocationStateDto, LocationDto } from './location.dto';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, type: [LocationDto] })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  findAll(): Promise<LocationDto[]> {
    return this.locationsService.findAll();
  }

  @Get(':id/state')
  @ApiOperation({
    summary: 'Get location with characters distributed across places',
    description:
      'This endpoint returns the current state of a location, including its places with characters distributed among them. It is useful for getting a quick overview of the location and its characters.',
  })
  @ApiResponse({ status: 200, type: LocationStateDto })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  @ApiResponse({ status: 404, description: 'Location not found' })
  @ApiHeader({
    name: 'x-user-time',
    description: 'User time',
    example: '2026-04-19T10:00:00.000Z',
  })
  getState(
    @Param('id') id: string,
    @Headers('x-user-time') userTime: string,
  ): Promise<LocationStateDto> {
    return this.locationsService.getState(id, userTime);
  }
}
