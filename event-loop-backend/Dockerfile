FROM golang:1.22

WORKDIR /usr/src/app

COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
COPY .env ./
COPY localhost.crt ./
COPY localhost.key ./
COPY database/*.go ./database/
COPY handlers/*.go ./handlers/
COPY validate/*.go ./validate/

RUN CGO_ENABLED=1 GOOS=linux go build

EXPOSE 8080

CMD ["./event-loop-backend"]

