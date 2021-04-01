# Stage 1
# pull official base image
FROM node:15.12.0-alpine as build-step

# set working directory
WORKDIR /app

# install app dependencies
COPY package.json yarn.lock ./
RUN yarn install

# add app and build it for production
COPY . ./
RUN yarn build

# Stage 2 - Web server for the prod build
FROM nginx:1.19.8-alpine

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-step /app/build /usr/share/nginx/html
