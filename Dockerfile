FROM node:18

WORKDIR /app
COPY *.json /app
RUN npm install && npx tsc
COPY ./dist /app
ENTRYPOINT [ "node", "app.js" ]
