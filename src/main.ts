import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { APP_NAME, API_PREFIX, API_VERSION, APP_DESCRIPTION } from './core/constants/app.constants';
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { FirebaseAuthGuard } from './auth/guards';

dotenv.config();

async function bootstrap() {
  const saJson = Buffer.from(process.env.FIREBASE_CREDENTIALS_PATH!, 'base64').toString();
  const serviceAccount = JSON.parse(saJson);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new FirebaseAuthGuard(reflector));

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
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'firebase-auth'
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Level Music API');
  logger.log(`App running on port ${process.env.PORT ?? 3000}`);
  logger.log(`Swagger running on: http://localhost:${process.env.PORT ?? 3000}/api`);
}

bootstrap();
