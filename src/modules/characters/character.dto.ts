import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CharacterDto {
  @ApiProperty({
    description: 'Unique identifier of the character',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the character',
    example: 'Aria',
  })
  name: string;

  @ApiProperty({
    description: 'Personality description of the character',
    example:
      'Curious, empathetic, and quick-witted with a dry sense of humour.',
  })
  personality: string;
}

export class CreateCharacterDto {
  @ApiProperty({
    description: 'Name of the character',
    example: 'Aria',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Personality description of the character',
    example:
      'Curious, empathetic, and quick-witted with a dry sense of humour.',
  })
  @IsString()
  @IsNotEmpty()
  personality: string;
}

export class UpdateCharacterDto extends PartialType(CreateCharacterDto) {}
