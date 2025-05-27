FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM alpine:latest

RUN apk add --no-cache \
    nodejs \
    npm \
    python3 \
    py3-pip \
    bash

WORKDIR /app

COPY --from=builder /app ./

COPY dummy/requirements.txt ./dummy/requirements.txt
RUN pip install -r ./dummy/requirements.txt --break-system-packages

RUN chmod +x /app/pocketbase /app/start.sh

EXPOSE 3000 8090 8765

CMD ["./start.sh"]
