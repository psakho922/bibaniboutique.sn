/**
 * AUDIT DOC (débutant):
 * - Démarre le serveur NestJS.
 * - Active la validation des DTOs.
 * - Monte le module AppModule qui regroupe tous les modules (paiements, etc.).
 */
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
