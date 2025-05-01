
FROM node:21.5
#docker build -t share-to-webex .
#docker run -p 10031:10031 -i -t share-to-webex

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY prod.env .env

CMD [ "npm", "start" ]