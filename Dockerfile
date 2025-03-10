# Build Stage
FROM node:16-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM node:16-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# Set environment variables
ENV NODE_ENV=production

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"] 