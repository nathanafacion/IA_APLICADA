FROM node:25-alpine3.22 as build

WORKDIR /src/

COPY package.json package-lock.json /src/

COPY . /src/

RUN  npm ci --silent

USER node

CMD npm run start
