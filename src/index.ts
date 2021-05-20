import { MongoClient, ObjectID } from 'mongodb';
import * as MQTT from 'mqtt';

/**
 * MQTT Broker Host Configuration
 */
export interface BrokerConfiguration {
  /**
   * MQTT Host
   *
   * Make sure you have access rights to the host
   *
   * @example
   * host = 'mqtt://broker.hivemq.com:1883'
   */
  host?: string;
  /**
   * MQTT Username
   */
  username?: undefined | string;
  /**
   * MQTT Password
   */
  password?: undefined | string;
}

interface Query {
  field: string;
  operator: string;
  value: string;
}

interface Payload {
  type: 'start' | 'reply' | 'end' | 'changeStream' | 'error';
  operation: 'create' | 'get' | 'update' | 'replace' | 'delete';
  query: Query[];
  payload: object[] | object | string;
}

/**
 * Realtime Database by Hexalts
 */
export default function RDB({
  databaseUri,
  broker = { host: 'mqtt://broker.hivemq.com:1883' },
  database,
}: {
  databaseUri: string;
  broker: BrokerConfiguration;
  database: string;
}) {
  const mongoClient = new MongoClient(databaseUri, {
    useUnifiedTopology: true,
  });

  const mqttClient = MQTT.connect(broker.host, {
    username: broker.username,
    password: broker.password,
  });

  const publish = (
    type: 'stream' | 'payload',
    payloadType: 'start' | 'reply' | 'end' | 'changeStream' | 'error',
    db: string,
    coll: string,
    id: number | string,
    operation: 'create' | 'get' | 'update' | 'replace' | 'delete',
    payload: object[] | object | string
  ) => {
    const topic = `${type}/${db}/${coll}/${id}`;
    const response: Payload = payload
      ? { operation, type: payloadType, query: [], payload: payload }
      : { operation, type: payloadType, query: [], payload: [] };
    console.log(topic, response);
    mqttClient.publish(topic, JSON.stringify(response), {}, error =>
      error ? console.error(error) : ''
    );
  };

  const operatorParser = (
    operator: '==' | '<=' | '>=' | '<' | '>' | '!=' | string
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

  mqttClient.once('connect', () => {
    mongoClient.connect(error => {
      if (!error) {
        console.log('RDB Ready');
        const db = mongoClient.db(database);
        mqttClient.subscribe(`request/${database}/#`);
        mqttClient.on('message', (topic, payload) => {
          let header: string[] = topic.split('/');
          if (header.length === 4) {
            try {
              const response: Payload = JSON.parse(payload.toString());
              console.log(topic, response);
              switch (response.operation) {
                case 'create':
                  db.collection(header[2]).insertOne(
                    response.payload,
                    (error, result) => {
                      if (!error) {
                        publish(
                          'payload',
                          'reply',
                          header[1],
                          header[2],
                          parseInt(header[3]),
                          response.operation,
                          result.insertedId
                        );
                      } else {
                        publish(
                          'payload',
                          'error',
                          header[1],
                          header[2],
                          parseInt(header[3]),
                          response.operation,
                          error.message
                        );
                      }
                      publish(
                        'payload',
                        'end',
                        header[1],
                        header[2],
                        parseInt(header[3]),
                        response.operation,
                        []
                      );
                    }
                  );
                  break;
                case 'get':
                  db.collection(header[2])
                    .find(
                      response.query.length !== 0
                        ? {
                            $and: response.query.map(Query => {
                              return {
                                [Query.field]: {
                                  [operatorParser(Query.operator)]:
                                    Query.field === '_id'
                                      ? new ObjectID(Query.value)
                                      : Query.value,
                                },
                              };
                            }),
                          }
                        : {}
                    )
                    .toArray()
                    .then(result => {
                      publish(
                        'payload',
                        'reply',
                        header[1],
                        header[2],
                        parseInt(header[3]),
                        response.operation,
                        result
                      );
                      publish(
                        'payload',
                        'end',
                        header[1],
                        header[2],
                        parseInt(header[3]),
                        response.operation,
                        []
                      );
                    });
                  break;
                case 'update':
                  db.collection(header[2]).updateMany(
                    response.query.length !== 0
                      ? {
                          $and: response.query.map(Query => {
                            return {
                              [Query.field]: {
                                [operatorParser(Query.operator)]:
                                  Query.field === '_id'
                                    ? new ObjectID(Query.value)
                                    : Query.value,
                              },
                            };
                          }),
                        }
                      : {},
                    { $set: response.payload },
                    (error, result) => {
                      if (!error) {
                        publish(
                          'payload',
                          'reply',
                          header[1],
                          header[2],
                          parseInt(header[3]),
                          response.operation,
                          result.result
                        );
                      } else {
                        publish(
                          'payload',
                          'error',
                          header[1],
                          header[2],
                          parseInt(header[3]),
                          response.operation,
                          error.message
                        );
                      }
                      publish(
                        'payload',
                        'end',
                        header[1],
                        header[2],
                        parseInt(header[3]),
                        response.operation,
                        []
                      );
                    }
                  );
                  break;
                case 'delete':
                  db.collection(header[2]).deleteMany(
                    response.query.length !== 0
                      ? {
                          $and: response.query.map(Query => {
                            return {
                              [Query.field]: {
                                [operatorParser(Query.operator)]:
                                  Query.field === '_id'
                                    ? new ObjectID(Query.value)
                                    : Query.value,
                              },
                            };
                          }),
                        }
                      : {},
                    (error, result) => {
                      if (!error) {
                        publish(
                          'payload',
                          'reply',
                          header[1],
                          header[2],
                          parseInt(header[3]),
                          response.operation,
                          result.result
                        );
                      } else {
                        publish(
                          'payload',
                          'error',
                          header[1],
                          header[2],
                          parseInt(header[3]),
                          response.operation,
                          error.message
                        );
                      }
                      publish(
                        'payload',
                        'end',
                        header[1],
                        header[2],
                        parseInt(header[3]),
                        response.operation,
                        []
                      );
                    }
                  );
                  break;
                default:
                  break;
              }
            } catch (error) {
              publish(
                'payload',
                'error',
                header[1],
                header[2],
                parseInt(header[3]),
                'get',
                error
              );
              publish(
                'payload',
                'end',
                header[1],
                header[2],
                parseInt(header[3]),
                'get',
                []
              );
            }
          } else {
            publish(
              'payload',
              'error',
              header[1],
              header[2],
              parseInt(header[3]),
              'get',
              'Please recheck your topic string query.'
            );
            publish(
              'payload',
              'end',
              header[1],
              header[2],
              parseInt(header[3]),
              'get',
              []
            );
          }
        });
        db.watch([], { fullDocument: 'updateLookup' }).on('change', doc => {
          switch (doc.operationType) {
            case 'insert':
              publish(
                'stream',
                'changeStream',
                doc.ns.db,
                doc.ns.coll,
                doc.documentKey._id.toHexString(),
                'create',
                doc.fullDocument ? doc.fullDocument : []
              );
              break;
            case 'replace':
              publish(
                'stream',
                'changeStream',
                doc.ns.db,
                doc.ns.coll,
                doc.documentKey._id.toHexString(),
                'replace',
                doc.fullDocument ? doc.fullDocument : []
              );
              break;
            case 'update':
              publish(
                'stream',
                'changeStream',
                doc.ns.db,
                doc.ns.coll,
                doc.documentKey._id.toHexString(),
                'update',
                doc.fullDocument ? doc.fullDocument : doc.updateDescription
              );
              break;
            case 'delete':
              publish(
                'stream',
                'changeStream',
                doc.ns.db,
                doc.ns.coll,
                doc.documentKey._id.toHexString(),
                'delete',
                []
              );
              break;
            default:
              break;
          }
        });
        db.watch().on('error', error => console.error(error));
      } else {
        console.error(error);
      }
    });
  });
}

RDB({
  broker: { host: 'mqtt://broker.hivemq.com:1883' },
  database: 'jembatanku',
  databaseUri: 'mongodb://localhost:27017',
});
