# Docker Setup for URL Shortener API

This document provides instructions for running the URL Shortener API using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuration

1. Create a `.env` file in the root directory of the project based on the `.env.example` file:

```bash
cp .env.example .env
```

2. Edit the `.env` file to set your environment variables.

## Running the Application

### Production Mode

To run the application in production mode:

```bash
docker-compose up -d
```

This will:
- Build the NestJS application in production mode
- Start the PostgreSQL database
- Start pgAdmin (accessible at http://localhost:8080)
- Start the API (accessible at http://localhost:3000)

### Development Mode

To run the application in development mode with hot-reloading:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Stopping the Application

To stop all running containers:

```bash
docker-compose down
```

To stop and remove all containers, networks, and volumes:

```bash
docker-compose down -v
```

## Docker Services

- **api**: NestJS application
- **postgres**: PostgreSQL database
- **pgadmin**: pgAdmin for database management (optional)

## Database Access

- pgAdmin is available at http://localhost:8080
- Login to pgAdmin with:
  - Email: admin@example.com (or the value of PGADMIN_EMAIL in your .env file)
  - Password: admin (or the value of PGADMIN_PASSWORD in your .env file)
- To add the PostgreSQL server in pgAdmin:
  - Host: postgres
  - Port: 5432
  - Username: postgres (or the value of DB_USERNAME in your .env file)
  - Password: password (or the value of DB_PASSWORD in your .env file)
  - Database: url_shortener (or the value of DB_DATABASE in your .env file)

## API Documentation

Swagger documentation is available at http://localhost:3000/api/docs

## Debugging

For debugging in development mode, you can connect to the Node.js debugger at localhost:9229.

## Data Persistence

Database data is persisted in a Docker volume called `postgres-data`.

## Advanced Usage

### Viewing Logs

```bash
# View logs for all services
docker-compose logs

# View logs for a specific service
docker-compose logs api

# Follow logs
docker-compose logs -f
```

### Rebuilding the Application

If you make changes to the Dockerfile or need to rebuild the application:

```bash
docker-compose build
```

### Running Commands Inside Containers

```bash
# Run npm commands
docker-compose exec api npm install <package-name>

# Run database migrations
docker-compose exec api npm run migration:run

# Open a shell in a container
docker-compose exec api sh
``` 