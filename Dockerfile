FROM node:24-alpine

# Set working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code into the container
COPY . . 

# Build the application
RUN npm run build

# Expose the application on port 7000
EXPOSE 7000

CMD ["npm", "run", "start"]