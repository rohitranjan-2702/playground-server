# Fetching the minified node image on apline linux
FROM node:20

# Declaring env
ARG DATABASE_URL
ENV DATABASE_URL ${DATABASE_URL}

RUN groupadd -r user && useradd -r -g user user

RUN mkdir /usr/workspace

# Setting up the work directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update -y && apt-get install -y openssl

# Installing pm2 globally
RUN npm install pm2 -g

# Installing dependencies
RUN npm install

COPY . .

COPY --chown=user:user . /usr/src/app
RUN chmod -R 700 /usr/src/app

# Exposing server port
EXPOSE 8000

# Starting our application
CMD ["npm", "run", "dev"]
# CMD ["pm2", "start", "dist/index.js"]

