import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongodbController } from './mongodb.controller';
import { MongodbService } from './mongodb.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "COMMUNICATOR",
        // @ts-ignore next-line
        transport: Transport.MQTT,
        options: {
          url: 'ws://localhost:9001',
          username: 'admin',
          password: 'password',
        },
      },
    ]),
  ],
  controllers: [MongodbController],
  providers: [MongodbService],
})
export class MongodbModule {}
