import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CharacterDto,
  CreateCharacterDto,
  UpdateCharacterDto,
} from './character.dto';
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a character by id' })
  @ApiResponse({ status: 200, type: CharacterDto })
  @ApiNotFoundResponse({ description: 'Character not found' })
  findOne(@Param('id') id: string): Promise<CharacterDto> {
    return this.charactersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new character' })
  @ApiResponse({ status: 201, type: CharacterDto })
  create(@Body() dto: CreateCharacterDto): Promise<CharacterDto> {
    return this.charactersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a character' })
  @ApiResponse({ status: 200, type: CharacterDto })
  @ApiNotFoundResponse({ description: 'Character not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCharacterDto,
  ): Promise<CharacterDto> {
    return this.charactersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a character' })
  @ApiResponse({ status: 204, description: 'Character deleted' })
  @ApiNotFoundResponse({ description: 'Character not found' })
  remove(@Param('id') id: string): Promise<void> {
    return this.charactersService.remove(id);
  }
}
