# URL Shortener API

A modern URL shortening service with built-in analytics, user authentication, and OAuth integration.

## Features

- **URL Shortening**: Create short, easy-to-share links
- **Custom Short Codes**: Option to create personalized short URLs
- **Click Analytics**: Track clicks, referrers, and browser statistics
- **User Authentication**: Register, login, token refresh, and logout functionality
- **OAuth Integration**: Sign in with Google and GitHub
- **API Documentation**: Interactive Swagger documentation
- **Docker Support**: Easy containerized setup for development and production

## Technology Stack

- **Backend**: NestJS (Node.js framework)
- **Database**: PostgreSQL
- **Authentication**: JWT (access & refresh tokens)
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker & Docker Compose

## Installation

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- PostgreSQL database
- (Optional) Docker and Docker Compose

### Standard Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd url-shortener-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database credentials and other settings.

5. Run database migrations:
   ```bash
   npm run migration:run
   ```

6. Start the development server:
   ```bash
   npm run start:dev
   ```

### Docker Installation

See [DOCKER.md](DOCKER.md) for detailed instructions on running the application with Docker.

Quick start:
```bash
docker-compose up -d
```

## API Documentation

Once the application is running, access the interactive API documentation at:
```
http://localhost:3000/api/docs
```

### Main Endpoints

- **Authentication**
  - `POST /auth/register` - Register new user
  - `POST /auth/login` - Login
  - `POST /auth/logout` - Logout
  - `POST /auth/refresh` - Refresh access token
  - `GET /auth/google` - Google OAuth login
  - `GET /auth/github` - GitHub OAuth login

- **URL Management**
  - `POST /shorten` - Create short URL
  - `GET /urls` - Get user's URLs
  - `DELETE /urls/:id` - Delete URL
  - `GET /:shortCode` - Redirect to original URL

- **Analytics**
  - `GET /analytics/:shortCode` - Get click analytics for URL

- **User Management**
  - `GET /users/me` - Get current user
  - `PATCH /users/me` - Update user profile

## Authentication

The application uses JWT authentication with two types of tokens:

1. **Access Token**: Short-lived token for API access (15 minutes)
2. **Refresh Token**: Long-lived token for obtaining new access tokens (7 days)

The refresh token is stored as an HTTP-only cookie for security.

## OAuth Configuration

To enable OAuth authentication:

1. Set up OAuth applications in Google and GitHub developer consoles
2. Add the credentials to your `.env` file:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
   ```

## Environment Variables

Important environment variables to configure:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Application port | 3000 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_USERNAME | Database username | postgres |
| DB_PASSWORD | Database password | password |
| DB_DATABASE | Database name | url_shortener |
| JWT_ACCESS_SECRET | Secret for access tokens | |
| JWT_REFRESH_SECRET | Secret for refresh tokens | |
| FRONTEND_URL | URL of frontend application | http://localhost:3001 |

## Development

### Available Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build the application
- `npm run format` - Format code with Prettier
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

### Database Migrations

- `npm run migration:generate -- -n YourMigrationName` - Generate a new migration
- `npm run migration:run` - Run migrations
- `npm run migration:revert` - Revert the last migration

## Deployment

### Production Considerations

1. Set `NODE_ENV=production` in your environment
2. Use strong, unique secrets for JWT tokens
3. Configure proper CORS settings for production
4. Set `secure: true` for cookies in production
5. Use a reverse proxy (like Nginx) in front of the application

### Docker Deployment

For production deployment with Docker:

```bash
docker-compose up -d
```

## License

[MIT License](LICENSE)

## Contributors

- [Your Name](https://github.com/johnkeychishugi)
