import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { APP_NAME, API_PREFIX, API_VERSION, APP_DESCRIPTION } from './core/constants/app.constants';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  admin.initializeApp({
    credential: admin.credential.cert(require(process.env.FIREBASE_CREDENTIALS_PATH)),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });

  app.setGlobalPrefix(API_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setDescription(APP_DESCRIPTION)
    .setVersion(API_VERSION)
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);

  const logger = new Logger('Level Music API');
  logger.log(`App running on port ${process.env.PORT ?? 3000}`);
}

bootstrap();
