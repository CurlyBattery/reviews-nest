import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );
  app.use(cookieParser());
  const allowedOrigin = 'http://localhost:5173';

  app.enableCors({
    origin: allowedOrigin, // Точный origin, без *
    credentials: true, // Обязательно для передачи куки
  });

  await app.listen(3000);
}
bootstrap();
