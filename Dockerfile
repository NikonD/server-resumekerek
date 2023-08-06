FROM node:18-alpine as builder
WORKDIR /app
COPY . .
RUN npm install --include=dev
RUN npm i -g ts-node
RUN npm run start

EXPOSE 3000