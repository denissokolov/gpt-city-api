import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CharacterDto } from './character.dto';
import { CharactersService } from './characters.service';

@ApiTags('characters')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all characters' })
  @ApiResponse({ status: 200, type: [CharacterDto] })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  findAll(): Promise<CharacterDto[]> {
    return this.charactersService.findAll();
  }
}
