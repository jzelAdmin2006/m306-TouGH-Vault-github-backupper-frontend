FROM bitnami/nginx:1.25
COPY dist/m306-tou-gh-vault-github-backupper-frontend/ /app
COPY ./nginx-custom.conf /opt/bitnami/nginx/conf/server_blocks/nginx-custom.conf
