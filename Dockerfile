# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --force --omit=dev

RUN npm install tailwindcss --save --legacy-peer-deps


# Bundle app source
COPY . .

# Build the Next.js app for production
RUN npm run build -- --no-lint
# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]