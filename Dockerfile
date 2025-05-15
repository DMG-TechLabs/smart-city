# Dockerfile

FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install
FROM alpine:latest

RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY --from=builder /app ./

RUN chmod +x /app/pocketbase

EXPOSE 3000 8090

CMD sh -c "./pocketbase serve --http=0.0.0.0:8090 & npm run dev"

