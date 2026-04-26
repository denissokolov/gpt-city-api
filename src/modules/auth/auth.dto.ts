import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

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

  @ApiProperty({
    description:
      'Unix timestamp in seconds (UTC) when the access token expires — identical to the access JWT `exp` claim. Use for proactive refresh timers without decoding the JWT on the client.',
    example: 1735689600,
  })
  accessTokenExpiresAt: number;

  @ApiProperty({
    description:
      'Long-lived refresh token. Send it to POST /auth/refresh to obtain a new access token without signing in with Google again. Treat it like a password: store securely and revoke via POST /auth/logout when the user signs out.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class RefreshAuthDto {
  @ApiProperty({
    description:
      'Refresh token previously returned from POST /auth/google or POST /auth/refresh',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LogoutAuthDto {
  @ApiProperty({
    description:
      'When provided, the server records this refresh token as revoked so it can no longer be used at POST /auth/refresh. Omit the field if the client only discards tokens locally.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  refreshToken?: string;
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
