FROM node:12.13-alpine as cafront-dev
RUN mkdir -p /home/node/app
RUN chown -R node:node /home/node/app
COPY . /home/node/app
WORKDIR /home/node/app
COPY .env-prod .env
RUN yarn install
RUN yarn build

FROM nginx:stable-alpine as cafront-prod
RUN mkdir -p /usr/share/nginx/html/public
COPY --from=cafront-dev /home/node/app/public /usr/share/nginx/html/public
COPY --from=cafront-dev /home/node/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
