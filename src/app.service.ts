import { Inject, Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MongoClient } from 'mongodb';
import { PayloadProps } from './Types';

const hostname = process.env.DB_HOST;
const port = process.env.DB_PORT;
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const protocol = process.env.DB_PROTOCOL;
const args = process.env.DB_ARGS;

@Injectable()
export class AppService {
  @Inject('brokerInstance') public client: ClientProxy;
  public mongo = new MongoClient(
    `${protocol}://${username}:${encodeURIComponent(
      password,
    )}@${hostname}:${port}?${args}`,
  );
  getHello(): string {
    return 'Hello World!';
  }
  public async onModuleInit(): Promise<void> {
    try {
      await this.mongo.connect();
      Logger.log('Connection initialized', 'MongoDB');
      Logger.log(process.env.INSTANCE_ID, 'InstanceId')
      this.mongo
        .watch([], { fullDocument: 'updateLookup' })
        .on('change', (change) => {
          const topic = `${process.env.INSTANCE_ID}/stream/${change.ns.db}/${
            change.ns.coll
          }/${Date.now()}`;
          const payload: PayloadProps = {
            type: 'changeStream',
            query: [],
            payload: [],
            operation: 'get',
          };
          switch (change.operationType) {
            case 'insert':
              payload.operation = 'create';
              payload.payload = [change.fullDocument];
              break;
            case 'update':
              payload.operation = 'update';
              payload.payload = [change.fullDocument];
              break;
            case 'replace':
              payload.operation = 'update';
              payload.payload = [change.fullDocument];
              break;
            case 'delete':
              payload.operation = 'delete';
              payload.payload = [
                change.fullDocument ? change.fullDocument : change.documentKey,
              ];
              break;
            default:
              break;
          }
          this.client.emit<string, PayloadProps>(topic, payload);
        });
    } catch (error) {
      Logger.error(error);
    }
  }
}
