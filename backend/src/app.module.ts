import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles/roles.guard';
import { ThrottlerModule } from '@nestjs/throttler';
import { RateLimitGuard } from './auth/guards/throttler.guard';
import { JwtModule } from '@nestjs/jwt';
import { OptionsController } from './options/options.controller';
import { OptionsService } from './options/options.service';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { HealthController } from './health/health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HealthModule } from './health/health.module';
import { RedisService } from './redis/redis.service';
import { SchoolsModule } from './schools/schools.module';
import { ClassesModule } from './classes/classes.module';
import { SeederService } from './users/seeder.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { createKeyv } from '@keyv/redis';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (configService: ConfigService) => {
        const redisUrl = `redis://${configService.get<string>('REDIS_HOST')}:${configService.get<number>('REDIS_PORT')}`;
        return {
          stores: [createKeyv(redisUrl)],
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('THROTTLE_TTL'),
          limit: configService.get('THROTTLE_LIMIT'),
        },
      ],
      inject: [ConfigService],
    }),
    // MySQL Database
    // TypeOrmModule.forRootAsync({
    //   useFactory: (configService: ConfigService) => ({
    //     type: "mysql",
    //     host: configService.get('DB_HOST'),
    //     port: configService.get('DB_PORT_MYSQL'),
    //     username: configService.get('DB_USERNAME_MYSQL'),
    //     password: configService.get('DB_PASSWORD'),
    //     database: configService.get('DB_DATABASE'),
    //     entities: [User, Teacher],
    //     synchronize: configService.get('NODE_ENV') !== 'production',
    //   }),
    //   inject: [ConfigService],
    // }),
    // PostgresSQL Database
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT_POSTGRESQL'),
        username: configService.get('DB_USERNAME_POSTGRESQL'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'), // Thư mục chứa file tĩnh
      serveRoot: '/static', // Đường dẫn truy cập file
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
          },
        };
      },
      inject: [ConfigService],
    }),
    RedisModule,
    TerminusModule,
    HealthModule,
    UsersModule,
    AuthModule,
    HealthModule,
    SchoolsModule,
    ClassesModule,
  ],
  controllers: [AppController, OptionsController, HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    SeederService,
    AppService,
    OptionsService,
  ],
})
export class AppModule {}
