import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const hostname = process.env.BROKER_HOSTNAME;
const port = parseInt(process.env.BROKER_PORT);
const username = process.env.BROKER_USERNAME;
const password = process.env.BROKER_PASSWORD;

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'brokerInstance',
        transport: Transport.MQTT,
        options: {
          hostname: hostname,
          port: port,
          protocol: 'wss',
          username: username,
          password: password,
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
