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