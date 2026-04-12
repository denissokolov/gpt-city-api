import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

import { AppModule } from './app.module';
import { ConfigurationService } from './configuration/configuration.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigurationService);

  const config = new DocumentBuilder()
    .setTitle('GPT City API')
    .setDescription('GPT City API description')
    .setVersion(configService.getServerVersion())
    .addTag('gpt-city')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  app.use('/api', apiReference({ content: document }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch(console.error);
