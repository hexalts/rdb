SHELL := /bin/bash

setup:
	docker compose up -d
	echo "Waiting mongodb to be ready"
	sleep 20
	docker-compose exec shard-server sh -c "mongosh < /scripts/init-configserver.js"
	docker-compose exec node-a sh -c "mongosh < /scripts/init-shard01.js"
	docker-compose exec router sh -c "mongosh < /scripts/init-router.js"

