import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './modules/events/socket-io.adapter';

const environment: string = process.env.NODE_ENV ?? 'development';
const port: number = process.env.PORT ? +process.env.PORT : 5000;
const isProd: boolean = environment === 'production';

async function bootstrap(): Promise<void> {
  const app: INestApplication = await NestFactory.create(AppModule, { logger: !isProd });
  const cors: string[] = isProd ? [] : ['http://localhost:3000', 'https://hoppscotch.io'];
  app.useWebSocketAdapter(new SocketIoAdapter(app, cors));
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(port);
}
bootstrap();
