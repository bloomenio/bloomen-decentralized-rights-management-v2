FROM node:8

# Create work directory
WORKDIR /usr/src/app

# Copy app source to work directory
COPY . /usr/src/app

# Install app dependencies
RUN npm install

RUN chmod +x wait-for-it.sh

# Build and run the app
CMD node data/load.js && npm start 