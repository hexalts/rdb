rs.initiate({
  _id: 'rs-config-server',
  configsvr: true,
  version: 1,
  members: [{ _id: 0, host: 'shard-server:27017' }],
});
