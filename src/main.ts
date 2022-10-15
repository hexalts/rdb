import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  Logger.log('Running application with MongoDB instance', 'Application');
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
  Logger.log(`Application is running on: ${await app.getUrl()}`, 'Application');
}
bootstrap();
