import { ApiProperty } from '@nestjs/swagger';
import { Provider, Sex } from './character.enum';

export class CharacterDto {
  @ApiProperty({
    description: 'Unique identifier of the character',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'First name of the character',
    example: 'Albert',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the character',
    example: 'Einstein',
  })
  lastName: string;

  @ApiProperty({
    description: 'Title or role of the character in the city',
    example: 'Professor of Physics',
  })
  title: string;

  @ApiProperty({
    description: 'Age of the character in years',
    example: 45,
  })
  age: number;

  @ApiProperty({
    description: 'Sex of the character',
    enum: Sex,
    example: Sex.Male,
  })
  sex: Sex;

  @ApiProperty({
    description: 'Personality description of the character',
    example:
      'Curious, empathetic, and quick-witted with a dry sense of humour.',
  })
  personality: string;

  @ApiProperty({
    description:
      'Backstory of the character — where they came from and what shaped them',
    example:
      'Grew up in a small town, fascinated by the stars. Won a scholarship to study physics and never looked back.',
  })
  backstory: string;

  @ApiProperty({
    description: 'AI model used to power the character',
    example: 'gpt-4o',
  })
  model: string;

  @ApiProperty({
    description: 'AI provider that hosts the model',
    enum: Provider,
    example: Provider.OpenAI,
  })
  provider: Provider;
}
