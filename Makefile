ifneq (,$(wildcard ./.env))
    include .env
    export
endif

DEV_COMPOSE_FILE=docker-compose-dev.yml
DEBUG_COMPOSE_FILE=docker-compose-debug.yml

.PHONY: postgres
postgres:
	docker run --name poetry-for-neanderthals-db-1 -p 5432:5432 -e POSTGRES_USER=projectuser -e POSTGRES_PASSWORD=foobar -d postgres:12.19-alpine

.PHONY: createdb
createdb:
	docker exec -it poetry-for-neanderthals-db-1 createdb --username=projectuser --owner=projectuser poetry

.PHONY: dropdb
dropdb:
	docker exec -it poetry-for-neanderthals-db-1 dropdb --username=projectuser poetry

.PHONY: migrate-up
migrate-up:
	migrate -path api-golang/db/migration/ -database postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/poetry?sslmode=disable -verbose up

.PHONY: migrate-down
migrate-down:
	migrate -path api-golang/db/migration/ -database postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/poetry?sslmode=disable -verbose down

.PHONY: dev-compose-up
dev-compose-up:
	docker compose -f ${DEV_COMPOSE_FILE} up

.PHONY: dev-compose-up-build
dev-compose-up-build:
	docker compose -f ${DEV_COMPOSE_FILE} up --build

.PHONY: dev-compose-down
dev-compose-down:
	docker compose -f ${DEV_COMPOSE_FILE} down

.PHONY: debug-compose-up
debug-compose-up:
	docker compose -f $(DEV_COMPOSE_FILE) -f $(DEBUG_COMPOSE_FILE) up

.PHONY: debug-compose-up-build
debug-compose-up-build:
	docker compose -f $(DEV_COMPOSE_FILE) -f $(DEBUG_COMPOSE_FILE) up --build

.PHONY: debug-compose-down
debug-compose-down:
	docker compose -f ${DEV_COMPOSE_FILE} -f ${DEBUG_COMPOSE_FILE} down

