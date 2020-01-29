FROM node:13-alpine

RUN apk update && \
  apk add bash && \
  yarn global add @stoplight/spectral

COPY . .

RUN npm install && \
  npm run build && \
  npm test

ENTRYPOINT ["./entrypoint.js"]
