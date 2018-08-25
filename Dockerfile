FROM node:alpine
ADD ./src /src
WORKDIR /src/web
RUN npm install
RUN npm run build
WORKDIR /src
RUN npm install
RUN npm run build
CMD npm start
EXPOSE 3000
