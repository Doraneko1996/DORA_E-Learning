import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UsersService } from './users/users.service';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('GEMS E-Learning API')
    .setDescription("Danh sách API GEMS E-Learning")
    .setVersion('1.0')
    .addTag('Authenticator')
    .addTag('Users')
    .addBearerAuth()
    .build();
  const documnent = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documnent);

  const usersService = app.get(UsersService);
  await usersService.createSuperAdmin();

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
