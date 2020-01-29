FROM node:13-alpine

ARG extra=true

RUN apk update && \
  apk add bash

COPY . .

RUN npm install && \
  npm run build && \
  ${extra}

ENTRYPOINT ["./entrypoint.js"]
