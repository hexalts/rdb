import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const hostname = process.env.BROKER_HOSTNAME;
  const port = parseInt(process.env.BROKER_PORT);
  const username = process.env.BROKER_USERNAME;
  const password = process.env.BROKER_PASSWORD;
  console.log({
    hostname: hostname,
    port: port,
    protocol: 'wss',
    username: username,
    password: password,
  })
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.MQTT,
      options: {
        hostname: hostname,
        port: port,
        protocol: 'wss',
        username: username,
        password: password,
      },
    },
  );
  app.listen();
}
bootstrap();
