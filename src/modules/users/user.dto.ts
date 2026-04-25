import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Sex } from './user.enum';

export class UserDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'Ada',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Lovelace',
  })
  lastName: string;

  @ApiProperty({
    description: 'Age of the user in years',
    example: 36,
  })
  age: number;

  @ApiProperty({
    description: 'Sex of the user',
    enum: Sex,
    example: Sex.Female,
  })
  sex: Sex;

  @ApiProperty({
    description: 'Title or role of the user in the city',
    example: 'Mathematician',
  })
  title: string;

  @ApiProperty({
    description:
      'Backstory of the user — where they came from and what shaped them',
    example:
      'Pioneering mathematician who wrote the first algorithm intended for a machine.',
  })
  backstory: string;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'Ada',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Lovelace',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Age of the user in years',
    example: 36,
  })
  @IsInt()
  @Min(0)
  @Max(150)
  age: number;

  @ApiProperty({
    description: 'Sex of the user',
    enum: Sex,
    example: Sex.Female,
  })
  @IsEnum(Sex)
  sex: Sex;

  @ApiProperty({
    description: 'Title or role of the user in the city',
    example: 'Mathematician',
  })
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty({
    description:
      'Backstory of the user — where they came from and what shaped them',
    example:
      'Pioneering mathematician who wrote the first algorithm intended for a machine.',
  })
  @IsString()
  @IsOptional()
  backstory: string;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'New first name of the user',
    example: 'Ada',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'New last name of the user',
    example: 'Lovelace',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'New age of the user in years',
    example: 36,
    required: false,
  })
  @IsInt()
  @Min(0)
  @Max(150)
  @IsOptional()
  age?: number;

  @ApiProperty({
    description: 'New sex of the user',
    enum: Sex,
    example: Sex.Female,
    required: false,
  })
  @IsEnum(Sex)
  @IsOptional()
  sex?: Sex;

  @ApiProperty({
    description: 'New title or role of the user in the city',
    example: 'Mathematician',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description:
      'New backstory of the user — where they came from and what shaped them',
    example:
      'Pioneering mathematician who wrote the first algorithm intended for a machine.',
    required: false,
  })
  @IsString()
  @IsOptional()
  backstory?: string;
}
