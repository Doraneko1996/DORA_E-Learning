import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponseDto } from '@/common/dtos/response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Bypass interceptor cho health checks
    if (request.url.startsWith('/health')) {
      return next.handle(); // Trả về response gốc không qua transform
    }

    return next.handle().pipe(
      map((data) => {
        // Trường hợp response login
        if (data?.data?.access_token) {
          return new SuccessResponseDto(
            data.data,
            response.statusCode,
            undefined, // no meta
            data.message,
          );
        }

        // Trường hợp response trống (ví dụ DELETE thành công)
        if (data === undefined) {
          return {
            success: true,
            statusCode: response.statusCode,
            timestamp: new Date().toISOString(),
          };
        }

        // Trường hợp có pagination/metadata
        if (data?.meta) {
          return new SuccessResponseDto(
            data.data,
            response.statusCode,
            data.meta,
          );
        }

        // Trường hợp có message
        if (data?.message) {
          return new SuccessResponseDto(
            data.data,
            response.statusCode,
            data.meta, // undefined nếu không có
            data.message, // thêm message
          );
        }

        // Response thông thường
        return {
          success: true,
          data: data?.data || data,
          statusCode: response.statusCode,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
