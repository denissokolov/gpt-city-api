import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    description: 'Google ID token obtained from Google Sign-In on the client',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkaz...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class AuthTokenDto {
  @ApiProperty({
    description: 'JWT access token to use in Authorization: Bearer headers',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
}

export class AuthUserDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Google account email address',
    example: 'alice@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Full display name from Google profile',
    example: 'Alice Smith',
  })
  name: string;
}
