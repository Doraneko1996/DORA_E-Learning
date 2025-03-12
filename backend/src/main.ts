import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { SeederService } from './users/seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Bật validation pipe toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Tự động loại bỏ các trường không có trong DTO
      forbidNonWhitelisted: true, // Báo lỗi nếu có trường không xác định
      transform: true, // Tự động chuyển kiểu dữ liệu
      disableErrorMessages: process.env.NODE_ENV === 'production', // Ẩn message lỗi chi tiết trên production
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('GEMS E-Learning API')
    .setDescription('Danh sách API GEMS E-Learning')
    .setVersion('1.0')
    .addTag('Authenticator')
    .addTag('Users')
    .addBearerAuth()
    .build();
  const documnent = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documnent);

  const seederService = app.get(SeederService);
  await seederService.seed();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
