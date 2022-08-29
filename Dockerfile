FROM node:16.14.2-bullseye

RUN mkdir /app

COPY . /app

WORKDIR /app

RUN npm install

RUN npm rebuild bcrypt --build-from-source

CMD ["npm", "start"]

#EXPOSE PORT 5000
EXPOSE 5000
