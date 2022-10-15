import { HttpException, HttpStatus } from '@nestjs/common';
import { errorParser } from './errorParser';

export const errorHandler = (errorMessage: any, errorStatus: HttpStatus) => {
  const _errorMessage = errorParser(errorMessage);
  throw new HttpException(_errorMessage, errorStatus);
};
