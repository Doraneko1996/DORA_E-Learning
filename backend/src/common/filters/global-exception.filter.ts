import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponseDto } from '../dtos/response.dto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = 500;
    let message = 'Lỗi server';
    let details: string[] = [];

    this.logger.error(exception.message, exception.stack, exception.name);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
      // Kế thừa logic từ HttpExceptionFilter
      const exceptionResponse = exception.getResponse();
      if (exception instanceof BadRequestException) {
        details = Array.isArray(exceptionResponse['message'])
          ? exceptionResponse['message']
          : [exceptionResponse['message']];
      }
    }

    response
      .status(status)
      .json(
        new ErrorResponseDto(
          status,
          message,
          details.length ? details : undefined,
        ),
      );
  }
}
