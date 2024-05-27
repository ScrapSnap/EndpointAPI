import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { UserService } from "./modules/user/user.service";
import * as dotenv from 'dotenv';
import { CollectionPointsService } from './modules/collection-points/collection-points.service';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()

  const config = new DocumentBuilder()
    .setTitle('EndpointAPI')
    .setDescription('API for user management')
    .setVersion('0.0.1')
    .addTag('endpoint')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const userService = app.get(UserService);
  await userService.initDefaultUserWithRole();

  const collectionPointService = app.get(CollectionPointsService);
  await collectionPointService.initDefaultCollectionPoints();

  await app.listen(3000);
}
bootstrap().then(r => console.log('Server is running on port 3000'));
