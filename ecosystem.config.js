module.exports = {
  apps: [
    {
      name: 'Hexalts - Realtime Database',
      script: 'yarn build && yarn start:prod',
      env: {
        BROKER_HOSTNAME: 'broker.host.address',
        BROKER_USERNAME: '',
        BROKER_PASSWORD: '',
        BROKER_PORT: '8883',
        DB_PORT: '27017',
        DB_HOST: 'database.host.address',
        DB_USERNAME: '',
        DB_PASSWORD: '',
        DB_PROTOCOL: 'mongodb',
        DB_ARGS: 'authSource=admin&readPreference=primary&appname=RDB%20Hexalts&directConnection=true&ssl=false',
      },
    },
  ],
};
