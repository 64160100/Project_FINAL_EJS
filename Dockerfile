ARG NODE_VERSION=18.17.0

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default.
ENV NODE_ENV production

WORKDIR /usr/src/app

# Install system dependencies required for native npm module compilation
RUN apk add --no-cache python3 make g++

# Copy package.json and package-lock.json
COPY ["package.json", "package-lock.json", "./"]

# Install app dependencies
RUN npm ci --omit=dev

# If bcrypt still fails to load, force a rebuild
RUN npm rebuild bcrypt --build-from-source

# Copy the rest of the source files into the image.
COPY . .

# Expose the port that the application listens on.
EXPOSE 3000

# Run the application.
CMD ["node", "server.js"]