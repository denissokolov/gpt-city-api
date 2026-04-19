import { ApiProperty } from '@nestjs/swagger';
import { CharacterDto } from '../characters/character.dto';
import { Locale } from '../../common/enums/locale.enum';

export class PlaceDto {
  @ApiProperty({
    description: 'Unique identifier of the place',
    example: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the place',
    example: 'Central Library',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the place',
    example:
      'A quiet library with floor-to-ceiling bookshelves and cozy reading nooks.',
  })
  description: string;
}

export class LocationDto {
  @ApiProperty({
    description: 'Unique identifier of the location',
    example: 'd4e5f6a7-b8c9-0123-defa-234567890123',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the location',
    example: 'Downtown District',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the location',
    example:
      'The bustling heart of the city with shops, cafes, and office buildings.',
  })
  description: string;

  @ApiProperty({
    description: 'Locale of the location (language + region)',
    enum: Locale,
    example: Locale.EnUs,
  })
  locale: Locale;
}

export class PlaceStateDto extends PlaceDto {
  @ApiProperty({
    description: 'Characters currently present at this place',
    type: [CharacterDto],
  })
  characters: CharacterDto[];
}

export class LocationStateDto extends LocationDto {
  @ApiProperty({
    description:
      'Places within this location, each with the characters currently present there',
    type: [PlaceStateDto],
  })
  places: PlaceStateDto[];
}
