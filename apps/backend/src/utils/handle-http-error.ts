import { HttpException, InternalServerErrorException } from '@nestjs/common';

export function handleHttpError(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred',
): never {
  if (error instanceof HttpException) {
    throw error;
  }

  console.error(fallbackMessage, error);
  throw new InternalServerErrorException(fallbackMessage);
}
