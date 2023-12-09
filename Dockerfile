FROM node:17-alpine

WORKDIR /usr/app

# Install dependencies
COPY ./package.json ./
RUN npm install

# Install aws-sdk
RUN npm install aws-sdk

COPY ./ ./

# Default command
CMD ["npm", "start"]
