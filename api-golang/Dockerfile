FROM golang:1.22.5-bullseye AS build

WORKDIR /app

COPY go.mod go.sum ./

RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download -x

COPY . .

RUN go build \
    -ldflags="-linkmode external -extldflags -static" \
    -tags netgo \
    -o api-golang

FROM scratch

COPY --from=build /app/api-golang .

EXPOSE 3000

CMD ["./api-golang"]