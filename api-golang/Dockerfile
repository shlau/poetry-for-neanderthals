FROM golang:1.22.5-bullseye AS build-base

WORKDIR /app

COPY go.mod go.sum ./

RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download -x

FROM build-base AS dev

RUN go install github.com/air-verse/air@latest && \
    go install github.com/go-delve/delve/cmd/dlv@latest

COPY . .

CMD ["air","-c",".air.toml"]

FROM build-base AS prod

COPY . .

RUN go build \
    -ldflags="-linkmode external -extldflags -static" \
    -tags netgo \
    -o api-golang

FROM scratch

COPY --from=prod /app/api-golang .

EXPOSE 3000

CMD ["./api-golang"]