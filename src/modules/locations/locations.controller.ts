import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocationStateDto, LocationDto } from './location.dto';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, type: [LocationDto] })
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
  @ApiResponse({ status: 404, description: 'Location not found' })
  getState(@Param('id') id: string): Promise<LocationStateDto> {
    return this.locationsService.getState(id);
  }
}
