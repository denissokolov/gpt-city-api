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
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthTokenDto, AuthUserDto, GoogleAuthDto } from './auth.dto';
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
      'Returns a signed JWT to use as a Bearer token for all authenticated endpoints.',
  })
  @ApiResponse({ status: 200, type: AuthTokenDto })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired Google ID token',
  })
  async googleAuth(@Body() dto: GoogleAuthDto): Promise<AuthTokenDto> {
    const accessToken = await this.authService.authenticateWithGoogle(
      dto.idToken,
    );
    return { accessToken };
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
