# Use the official Node.js 18 image.
FROM node:18-alpine

# Create and change to the app directory.
WORKDIR /usr/src

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install dependencies.
RUN npm ci --omit='dev'

# Copy the rest of the application code.
COPY . .

# Expose the port the app runs on.
EXPOSE 8080

# Build the TypeScript code.
RUN npm run build

# Start the application.
CMD ["node", "dist/index.js"]
