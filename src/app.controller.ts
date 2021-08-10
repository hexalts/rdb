import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  EventPattern,
  Payload,
  Ctx,
  MqttContext,
} from '@nestjs/microservices';
import { ObjectId } from 'mongodb';
import { AppService } from './app.service';
import { PayloadProps } from './Types';

const operatorParser = (
  operator: '==' | '<=' | '>=' | '<' | '>' | '!=',
): string => {
  let actualOperator: string;
  switch (operator) {
    case '!=':
      actualOperator = '$ne';
      break;
    case '<':
      actualOperator = '$lt';
      break;
    case '<=':
      actualOperator = '$lte';
      break;
    case '==':
      actualOperator = '$eq';
      break;
    case '>':
      actualOperator = '$gt';
      break;
    case '>=':
      actualOperator = '$gte';
      break;
    default:
      actualOperator = '$eq';
      break;
  }
  return actualOperator;
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  end(
    topic: string,
    operation: 'create' | 'get' | 'update' | 'replace' | 'delete' | 'error',
  ) {
    this.appService.client.emit<string, PayloadProps>(topic, {
      type: 'end',
      query: [],
      payload: [],
      operation: operation,
    });
  }
  @EventPattern('payload/#')
  async eventProcessor(
    @Ctx() context: MqttContext,
    @Payload() payload: PayloadProps,
  ) {
    console.log(context.getTopic());
    console.log(payload);
    if (payload.type === 'reply') {
      this.end(context.getTopic(), payload.operation);
    }
  }
  @MessagePattern('request/#')
  async requestProcessor(
    @Ctx() context: MqttContext,
    @Payload() payload: PayloadProps,
  ) {
    try {
      const topic = context.getTopic().split('/');
      if (topic.length === 4) {
        const database = topic[1];
        const collection = topic[2];
        const requestId = topic[3];
        const responseTopic = `payload/${database}/${collection}/${requestId}`;
        const target = this.appService.mongo
          .db(database)
          .collection(collection);
        if (
          typeof payload.operation !== 'undefined' &&
          typeof payload.payload !== 'undefined' &&
          typeof payload.query !== 'undefined' &&
          typeof payload.type !== 'undefined'
        ) {
          const query =
            payload.query.length !== 0
              ? {
                  $and: payload.query.map((Query) => {
                    return {
                      [Query.field]: {
                        [operatorParser(Query.operator)]:
                          Query.field === '_id' &&
                          typeof Query.value === 'string'
                            ? new ObjectId(Query.value)
                            : Query.value,
                      },
                    };
                  }),
                }
              : {};
          switch (payload.operation) {
            case 'create':
              target.insertOne(payload.payload, (error, result) => {
                if (!error) {
                  this.appService.client
                    .emit<string, PayloadProps>(responseTopic, {
                      type: 'reply',
                      query: payload.query,
                      payload: [result],
                      operation: payload.operation,
                    })
                    .subscribe((a) => a);
                } else {
                  this.appService.client.emit<string, PayloadProps>(
                    responseTopic,
                    {
                      type: 'error',
                      query: payload.query,
                      payload: [error.message],
                      operation: payload.operation,
                    },
                  );
                }
              });
              break;
            case 'get':
              const result = await target.find(query).toArray();
              this.appService.client.emit<string, PayloadProps>(responseTopic, {
                type: 'reply',
                query: payload.query,
                payload: result,
                operation: payload.operation,
              });
              break;
            case 'update':
              target.updateOne(
                query,
                { $set: payload.payload },
                (error, result) => {
                  if (!error) {
                    this.appService.client.emit<string, PayloadProps>(
                      responseTopic,
                      {
                        type: 'reply',
                        query: payload.query,
                        payload: [result],
                        operation: payload.operation,
                      },
                    );
                  } else {
                    this.appService.client.emit<string, PayloadProps>(
                      responseTopic,
                      {
                        type: 'error',
                        query: payload.query,
                        payload: [error.message],
                        operation: payload.operation,
                      },
                    );
                  }
                },
              );
              break;
            case 'delete':
              target.deleteMany(query, (error, result) => {
                if (!error) {
                  this.appService.client.emit<string, PayloadProps>(
                    responseTopic,
                    {
                      type: 'reply',
                      query: payload.query,
                      payload: [result],
                      operation: payload.operation,
                    },
                  );
                } else {
                  this.appService.client.emit<string, PayloadProps>(
                    responseTopic,
                    {
                      type: 'error',
                      query: payload.query,
                      payload: [error.message],
                      operation: payload.operation,
                    },
                  );
                }
              });
              break;
            default:
              break;
          }
        } else {
          throw new Error('Invalid payload structure.');
        }
      } else {
        throw new Error('Invalid topic structure.');
      }
    } catch (e) {
      const topic = context.getTopic().split('/');
      const responseTopic = `payload/${topic.slice(1).join('/')}`;
      this.appService.client.emit<string, PayloadProps>(responseTopic, {
        type: 'error',
        query: [],
        payload: [e],
        operation: 'error',
      });
      this.end(responseTopic, 'error');
    }
  }
}
