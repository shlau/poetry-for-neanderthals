FROM golang:1.22.5-bullseye AS build-base

WORKDIR /app

COPY go.mod go.sum ./

RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download -x

FROM build-base AS prod

COPY . .

RUN go build \
  -ldflags="-linkmode external -extldflags -static" \
  -tags netgo \
  -o /api-golang-build


FROM scratch

COPY --from=prod /api-golang-build /api-golang-build

EXPOSE 3000

CMD ["/api-golang-build"]