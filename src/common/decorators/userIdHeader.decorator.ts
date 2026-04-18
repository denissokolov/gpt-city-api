import {
  applyDecorators,
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { isUUID } from 'class-validator';

export const USER_ID_HEADER = 'x-user-id';

export const ApiUserIdHeader = (): MethodDecorator & ClassDecorator =>
  applyDecorators(
    ApiHeader({
      name: USER_ID_HEADER,
      description: 'ID of the user performing the request',
      required: true,
      example: 'c3d4e5f6-a7b8-4012-bdef-123456789012',
    }),
  );

export const UserIdHeader = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();

    const raw = request.headers[USER_ID_HEADER];
    const value = Array.isArray(raw) ? raw[0] : raw;

    if (!value || !isUUID(value)) {
      throw new BadRequestException(
        `Missing or invalid "${USER_ID_HEADER}" header (expected a UUID)`,
      );
    }

    return value;
  },
);
