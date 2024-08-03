ifneq (,$(wildcard ./.env))
    include .env
    export
endif

DEV_COMPOSE_FILE=docker-compose-dev.yml
DEBUG_COMPOSE_FILE=docker-compose-debug.yml
PROD_COMPOSE_FILE=docker-compose-prod.yml

.PHONY: postgres
postgres:
	docker run --name poetry-for-neanderthals-db-1 -p 5432:5432 -e POSTGRES_USER=${POSTGRES_USER} -e POSTGRES_PASSWORD=${POSTGRES_PASSWORD} -d postgres:12.19-alpine

.PHONY: createdb
createdb:
	docker exec -it poetry-for-neanderthals-db-1 createdb --username=${POSTGRES_USER} --owner=${POSTGRES_USER} poetry

.PHONY: dropdb
dropdb:
	docker exec -it poetry-for-neanderthals-db-1 dropdb --username=${POSTGRES_USER} poetry

.PHONY: migrate-up
migrate-up:
	migrate -path api-golang/db/migration/ -database postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/poetry?sslmode=disable -verbose up

.PHONY: migrate-down
migrate-down:
	migrate -path api-golang/db/migration/ -database postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/poetry?sslmode=disable -verbose down

.PHONY: prod-compose-up
prod-compose-up:
	docker compose -f ${PROD_COMPOSE_FILE} up

.PHONY: prod-compose-down
prod-compose-down:
	docker compose -f ${PROD_COMPOSE_FILE} down

.PHONY: prod-compose-up-build
prod-compose-up-build:
	docker compose -f ${PROD_COMPOSE_FILE} up --build

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

