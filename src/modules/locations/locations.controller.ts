import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LocationDto, LocationSummaryDto } from './location.dto';
import { LocationsService } from './locations.service';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({ status: 200, type: [LocationSummaryDto] })
  findAll(): Promise<LocationSummaryDto[]> {
    return this.locationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by ID with characters and places' })
  @ApiResponse({ status: 200, type: LocationDto })
  @ApiResponse({ status: 404, description: 'Location not found' })
  findOne(@Param('id') id: string): Promise<LocationDto> {
    return this.locationsService.findOne(id);
  }
}
