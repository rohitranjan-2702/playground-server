# FROM ubuntu:20.04

# # install node
# RUN apt-get update && apt-get install -y curl gnupg

# RUN curl -sL https://deb.nodesource.com/setup_16.x | bash -

# # install node
# RUN apt-get install -y nodejs

# # install nginx
# RUN apt-get install -y nginx

# RUN sudo docker cp nginx-base:/etc/nginx/conf.d/default.conf ~/Desktop/default.conf

# Fetching the minified node image on apline linux
FROM node:20

RUN groupadd -r user && useradd -r -g user user

RUN mkdir /usr/src/workspace

COPY workspaces/ /usr/src/workspace/

# Setting up the work directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN apt-get update -y && apt-get install -y openssl

# Installing pm2 globally
# RUN npm install pm2 -g

# Installing dependencies
RUN npm install

COPY . .

# COPY --chown=user:user . /usr/src/app
# RUN chmod -R 700 /usr/src/app

# Exposing server port
# EXPOSE 3000

# Starting our application
CMD ["npm", "run", "dev"]
# CMD ["pm2", "start", "dist/index.js"]

