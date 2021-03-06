[![OSSAR](https://github.com/hexalts/rdb/actions/workflows/ossar.yml/badge.svg)](https://github.com/hexalts/rdb/actions/workflows/ossar.yml)
[![CodeQL](https://github.com/hexalts/rdb/actions/workflows/codeql.yml/badge.svg)](https://github.com/hexalts/rdb/actions/workflows/codeql.yml)

# Hexalts Realtime Database (server side)

> To use the RDB Client Side, please refer to [this](https://github.com/hexalts/rdbc) link.

## Requirements

- MongoDB with replica set or sharded cluster enabled. [See here](https://docs.mongodb.com/manual/changeStreams/#availability).
- PM2 for process management. [See here](https://pm2.keymetrics.io/).
- NodeJS 14+ or LTS.
- MQTT Broker.

## Installation

Clone project from Hexalts official GitHub repository.

```
git clone https://github.com/hexalts/rdb.git
```

Move to RDB directory

```
cd rdb
```

Edit your configuration inside ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: 'Hexalts - Realtime Database',
      script: 'yarn build && yarn start:prod',
      env: {
        BROKER_HOSTNAME: 'change with your configuration',
        BROKER_USERNAME: 'change with your configuration',
        BROKER_PASSWORD: 'change with your configuration',
        BROKER_PORT: 'change with your configuration',
        DB_PORT: 'change with your configuration',
        DB_HOST: 'change with your configuration',
        DB_USERNAME: 'change with your configuration',
        DB_PASSWORD: 'change with your configuration',
        DB_PROTOCOL: 'change with your configuration',
        DB_ARGS: 'change with your configuration',
        INSTANCE_ID: 'Random UUIDv4',
      },
    },
  ],
};
```

> You can try to generate an UUID v4 on [this page](https://www.uuidgenerator.net/version4), and make sure the client knows your instanceId. Otherwise, they cannot communicate with your RDB Server.

Start the RDB server via PM2

```
pm2 start
```

And that is how you set up the Hexalts RDB!
