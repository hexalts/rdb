# Setup
Tired of setting up mongodb with replica sets just to enable op logs? Here I'll bring you the MongoDB Sharding. 

Basically, sharding consume much less storage than replica set clusters (because replica set means you replicate the whole db 1:1, hance the name, "replica").

1. `docker compose up -d`
2. `docker-compose exec shard-server sh -c "mongosh < /scripts/init-configserver.js"`
3. `docker-compose exec node-a sh -c "mongosh < /scripts/init-shard01.js"`
4. `docker-compose exec router sh -c "mongosh < /scripts/init-router.js"`
5. open mongosh on `router` container with `docker-compose exec router mongosh --port 27017`. to enable database sharding, do this example: `sh.enableSharding("core")`.