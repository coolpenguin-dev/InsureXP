import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const origin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';
  app.enableCors({ origin, credentials: true });
  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
}
bootstrap();
