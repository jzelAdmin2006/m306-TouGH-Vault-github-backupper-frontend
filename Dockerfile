FROM node:latest as build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build --prod

FROM bitnami/nginx:1.25
COPY --from=build /app/dist/m306-tou-gh-vault-github-backupper-frontend/ /app
COPY ./nginx-custom.conf /opt/bitnami/nginx/conf/server_blocks/nginx-custom.conf
