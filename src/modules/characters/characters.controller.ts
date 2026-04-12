import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CharacterDto } from './character.dto';
import { CharactersService } from './characters.service';

@ApiTags('characters')
@Controller('characters')
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all characters' })
  @ApiResponse({ status: 200, type: [CharacterDto] })
  findAll(): Promise<CharacterDto[]> {
    return this.charactersService.findAll();
  }
}
