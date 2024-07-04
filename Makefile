ifneq (,$(wildcard ./.env))
    include .env
    export
endif

postgres:
	docker run --name poetry-for-neanderthals-db-1 -p 5432:5432 -e POSTGRES_USER=projectuser -e POSTGRES_PASSWORD=foobar -d postgres:12.19-alpine

createdb:
	docker exec -it poetry-for-neanderthals-db-1 createdb --username=projectuser --owner=projectuser poetry

dropdb:
	docker exec -it poetry-for-neanderthals-db-1 dropdb --username=projectuser poetry

migrateup:
	migrate -path api-golang/db/migration/ -database postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/poetry?sslmode=disable -verbose up

migratedown:
	migrate -path api-golang/db/migration/ -database postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/poetry?sslmode=disable -verbose down

.PHONY: postgres createdb dropdb migrateup migratedown
