FROM node:alpine
ADD ./src /src
WORKDIR /src/web
RUN npm install
ARG COUCH_DB_ADDRESS=https://command-center.agrzes.pl:6984
RUN COUCH_DB_ADDRESS=$COUCH_DB_ADDRESS npm run build
WORKDIR /src
RUN npm install
RUN npm run build
CMD npm start
EXPOSE 3000
