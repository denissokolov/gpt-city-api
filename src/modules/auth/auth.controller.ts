import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthTokenDto,
  AuthUserDto,
  GoogleAuthDto,
  LogoutAuthDto,
  RefreshAuthDto,
} from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exchange a Google ID token for an application JWT',
    description:
      'Verifies a Google ID token obtained on the client via Google Sign-In. ' +
      'Creates a new user account on first login or updates an existing one. ' +
      'Returns an access JWT for Authorization: Bearer headers, accessTokenExpiresAt for proactive refresh, and a refresh token for POST /auth/refresh.',
  })
  @ApiResponse({ status: 200, type: AuthTokenDto })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired Google ID token',
  })
  googleAuth(@Body() dto: GoogleAuthDto): Promise<AuthTokenDto> {
    return this.authService.authenticateWithGoogle(dto.idToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Issue a new access token using a refresh token',
    description:
      'Exchanges a valid refresh token for a new access token, accessTokenExpiresAt, and a new refresh token (rotation). ' +
      'The previous refresh token is invalidated after a successful refresh.',
  })
  @ApiResponse({ status: 200, type: AuthTokenDto })
  @ApiResponse({
    status: 401,
    description: 'Invalid, expired, or revoked refresh token',
  })
  refresh(@Body() dto: RefreshAuthDto): Promise<AuthTokenDto> {
    return this.authService.refreshWithToken(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBody({ type: LogoutAuthDto, required: false })
  @ApiOperation({
    summary: 'Invalidate the server-side refresh session',
    description:
      'When a refresh token is supplied, its identifier is revoked so it can no longer be used with POST /auth/refresh. ' +
      'Access JWTs are not stored on the server and remain valid until they expire; clients should discard all tokens locally.',
  })
  @ApiResponse({ status: 204, description: 'Logout accepted' })
  async logout(@Body() dto?: LogoutAuthDto): Promise<void> {
    await this.authService.logout(dto?.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the currently authenticated user' })
  @ApiResponse({ status: 200, type: AuthUserDto })
  @ApiResponse({ status: 401, description: 'Missing or invalid JWT' })
  async getMe(@CurrentUser() user: JwtPayload): Promise<AuthUserDto> {
    const { id, email, name } = await this.authService.getAuthenticatedUser(
      user.sub,
    );
    return { id, email, name };
  }
}
