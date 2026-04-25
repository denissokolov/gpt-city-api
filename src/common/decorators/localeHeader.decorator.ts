import {
  applyDecorators,
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';

import { Locale } from '../enums/locale.enum';

export const LOCALE_HEADER = 'x-locale';

const SUPPORTED_LOCALES = Object.values(Locale) as string[];

export const ApiLocaleHeader = (): MethodDecorator & ClassDecorator =>
  applyDecorators(
    ApiHeader({
      name: LOCALE_HEADER,
      description: 'Locale of the user performing the request',
      required: true,
      enum: SUPPORTED_LOCALES,
      example: Locale.EnUs,
    }),
  );

export const LocaleHeader = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Locale => {
    const request = ctx.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();

    const raw = request.headers[LOCALE_HEADER];
    const value = Array.isArray(raw) ? raw[0] : raw;

    if (!value || !SUPPORTED_LOCALES.includes(value)) {
      throw new BadRequestException(
        `Missing or invalid "${LOCALE_HEADER}" header (expected one of: ${SUPPORTED_LOCALES.join(', ')})`,
      );
    }

    return value as Locale;
  },
);
