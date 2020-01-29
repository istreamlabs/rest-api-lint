FROM node:13-alpine

ARG extra=true
WORKDIR /action

RUN apk update && \
  apk add bash

COPY . .

RUN ln -s $(pwd)/entrypoint.js /usr/bin/rest-api-lint && \
  npm install && \
  npm run build && \
  ${extra}

ENTRYPOINT ["rest-api-lint"]
