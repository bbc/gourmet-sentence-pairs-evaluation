FROM node:10

WORKDIR /app
COPY . /app

ENV NODE_ENV=development

RUN yarn install
RUN yarn lint
RUN yarn build

EXPOSE 8080

ENTRYPOINT [ "yarn", "start" ]
