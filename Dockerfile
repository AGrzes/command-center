FROM node:alpine
ADD ./src /src
WORKDIR /src
RUN npm install
CMD npm start
EXPOSE 3000
