import { ZodError } from 'zod';
import { AxiosError } from 'axios';

export const isAxiosError = (error: any): error is AxiosError<Partial<string>> => {
  return error.isAxiosError === true;
};

export const isZodError = <T>(error: unknown): error is ZodError<T> => {
  return error instanceof ZodError;
};

export const isGenericError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export function parseError<T>(error: unknown): string {
  if (!error) return '__empty__';

  if (isAxiosError(error)) {
    if (error.name === 'CanceledError') return 'Request canceled';
    if (error.response?.status === 400) return error.response?.data || 'Bad request';
    if (error.response?.status === 404) return 'Not found';
    return error.response?.data || 'Something went wrong. Try again later.';
  }
  if (isGenericError(error)) {
    return error.message;
  }
  return 'Something went wrong. Try again later.';
}
