FROM node:18 AS builder

WORKDIR /app
COPY . .
RUN npm install

FROM alpine:latest

RUN apk add --no-cache \
    nodejs \
    npm \
    python3 \
    py3-pip \
    bash

WORKDIR /app

COPY --from=builder /app ./

RUN pip install fastapi uvicorn

RUN chmod +x /app/pocketbase

EXPOSE 3000 8090 8765

COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["./start.sh"]
