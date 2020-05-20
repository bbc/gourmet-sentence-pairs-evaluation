FROM node:10

WORKDIR /app
COPY . /app

ENV NODE_ENV=development \
    ENABLE_AUTH=false \
    USERNAME=user \
    PASSWORD=password

RUN yarn install && yarn lint && yarn build

EXPOSE 8080

ENTRYPOINT [ "yarn", "start" ]
