import { Inject, Logger } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MongoClient } from 'mongodb';
import { NameSpace, PayloadProps } from './types';

const hostname = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
// const username = process.env.DB_USERNAME || '';
// const password = process.env.DB_PASSWORD || '';
const protocol = process.env.DB_PROTOCOL || 'mongodb';
const args = process.env.DB_ARGS || '';

@Injectable()
export class MongodbService {
  constructor(@Inject('COMMUNICATOR') private readonly client: ClientProxy) {}
  public mongo = new MongoClient(`${protocol}://${hostname}:${port}?${args}`);
  getHello(): string {
    return 'Hello World!';
  }
  publishChangeStream(
    namespace: NameSpace,
    key: string,
    payload: PayloadProps,
  ) {
    return this.client.emit<PayloadProps>(
      `changestream/${namespace.db}/${namespace.coll}/${key}/${Date.now()}`,
      payload,
    );
  }
  public async onModuleInit(): Promise<void> {
    try {
      await this.mongo.connect();
      Logger.log('Connection initialized', 'MongoDB');
      this.mongo
        .watch([], { fullDocument: 'updateLookup' })
        .on('change', (change) => {
          const payload: PayloadProps = {
            type: 'changeStream',
            query: [],
            payload: {},
            operation: change.operationType,
          };
          switch (change.operationType) {
            case 'insert': {
              payload.operation = change.operationType;
              payload.payload = change.fullDocument;
              const key = change.documentKey._id.toString();
              return this.publishChangeStream(change.ns, key, payload);
            }
            case 'update': {
              payload.operation = change.operationType;
              payload.payload = change.fullDocument;
              const key = change.documentKey._id.toString();
              return this.publishChangeStream(change.ns, key, payload);
            }
            case 'replace': {
              payload.operation = change.operationType;
              payload.payload = change.fullDocument;
              const key = change.documentKey._id.toString();
              return this.publishChangeStream(change.ns, key, payload);
            }
            case 'delete': {
              payload.operation = change.operationType;
              payload.payload = change.documentKey;
              const key = change.documentKey._id.toString();
              return this.publishChangeStream(change.ns, key, payload);
            }
            default: {
              Logger.error(
                `Operator "${change.operationType}" is not handled yet. You may raise this as a new issue via GitHub`,
              );
              return;
            }
          }
        });
    } catch (error) {
      Logger.error(error);
    }
  }
}
