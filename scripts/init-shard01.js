rs.initiate({
  _id: 'rs-shard-1',
  version: 1,
  members: [
    { _id: 0, host: 'node-a:27017' },
    { _id: 1, host: 'node-b:27017' },
    { _id: 2, host: 'node-c:27017' },
  ],
});
