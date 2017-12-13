FROM node:8-alpine

MAINTAINER aparabolica <contact@aparabolica.com.br>

ENV MONGO_URL="mongodb://db:27017/meteor" \
    ROOT_URL="http://localhost:3000" \
    MAIL_URL="smtp://user:password@host:port" \
    BUILD_PACKAGES="python make gcc g++ git libuv bash curl tar bzip2" \
    NODE_ENV="production"

EXPOSE 3000

WORKDIR /source

RUN apk -U upgrade \
  && apk add ${BUILD_PACKAGES} \
  && update-ca-certificates \
  && rm -rf /tmp/* /var/cache/apk/*

RUN curl https://install.meteor.com/ | sh

# Copy files
COPY . /source

# Install app dependencies
RUN rm -rf /source/.meteor/local /source/node_modules /source/.deploy/local \
  && meteor npm install

RUN meteor build . \
  && mv /bundle /app

WORKDIR /app
# COPY entrypoint.sh /entrypoint.sh
# RUN chmod +x /entrypoint.sh
# ENTRYPOINT ["/entrypoint.sh"]

# Run node server
CMD ["node", "main.js"]
