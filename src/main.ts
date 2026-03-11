import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import * as basicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const logger = new Logger('Bootstrap');

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }));

  // CORS - Strict Configuration
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || ['http://localhost:8100'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Blocked CORS request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    maxAge: 3600, // Cache preflight requests for 1 hour
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // Swagger documentation with authentication
  const swaggerEnabled = process.env.SWAGGER_ENABLED === 'true';

  if (swaggerEnabled) {
    const swaggerUser = process.env.SWAGGER_USER || 'admin';
    const swaggerPassword = process.env.SWAGGER_PASSWORD;

    if (!swaggerPassword && process.env.NODE_ENV === 'production') {
      logger.error('SWAGGER_PASSWORD not set in production environment!');
      throw new Error('Swagger password required in production');
    }

    // Protect Swagger with basic auth in production
    if (process.env.NODE_ENV === 'production' || swaggerPassword) {
      app.use(
        '/api/docs*',
        basicAuth({
          challenge: true,
          users: { [swaggerUser]: swaggerPassword || 'changeme' },
        }),
      );
      logger.log('Swagger documentation protected with authentication');
    }

    const config = new DocumentBuilder()
      .setTitle('FitPro API')
      .setDescription('API for FitPro fitness tracking application')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Authentication', 'User authentication and authorization')
      .addTag('Users', 'User profile management')
      .addTag('Workouts', 'Workout tracking and management')
      .addTag('Exercises', 'Exercise library')
      .addTag('Records', 'Personal records tracking')
      .addTag('Progress', 'Progress tracking and goals')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger documentation enabled');
  } else {
    logger.log('Swagger documentation disabled');
  }

  const port = process.env.PORT || 3000;
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

  await app.listen(port, host);

  logger.log(`FitPro API running on http://${host}:${port}`);
  logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  if (swaggerEnabled) {
    logger.log(`Swagger docs: http://${host}:${port}/api/docs`);
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
