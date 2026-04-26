import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ description: 'Server status', example: 'ok' })
  status: string;

  @ApiProperty({ description: 'Server version', example: '0.0.3' })
  version: string;

  @ApiProperty({
    description: 'Current server time',
    example: '2026-04-12T00:00:00.000Z',
  })
  time: string;

  @ApiProperty({ description: 'Database status', example: 'ok' })
  database: string;
}
