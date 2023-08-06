FROM node:18-alpine 
WORKDIR /app
COPY . .
RUN npm install --include=dev
RUN npm i -g ts-node
EXPOSE 5001
RUN npm run start

