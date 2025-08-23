# Technology Stack

## Frontend
- **Framework**: Next.js 15 with React 18
- **Language**: TypeScript
- **Port**: 3001
- **Styling**: CSS (globals.css)

## Backend
- **Framework**: NestJS with Express
- **Language**: TypeScript
- **Port**: 3000
- **WebSockets**: @nestjs/websockets with ws adapter
- **API Documentation**: Swagger/OpenAPI

## Database
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Port**: 5433

## Code Quality & Formatting
- **Linter/Formatter**: Biome (replaces ESLint + Prettier)
- **Git Hooks**: Husky with lint-staged
- **Pre-commit**: Automatic code formatting and linting

## Development Environment
- **Containerization**: Docker Compose
- **Package Manager**: npm

## Common Commands

### Frontend (from /frontend)
```bash
npm run dev          # Start development server on port 3001
npm run build        # Build for production
npm run start        # Start production server
npm run check        # Run Biome linter and formatter
npm run type-check   # TypeScript type checking
```

### Backend (from /backend)
```bash
npm run start:dev    # Start development server with watch mode
npm run build        # Build the application
npm run start:prod   # Start production server
npm run check        # Run Biome linter and formatter
npm run test         # Run Jest tests

# Database commands
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database
```

### Docker
```bash
docker-compose up    # Start all services (postgres, backend)
docker-compose down  # Stop all services
```

## Code Style
- **Indentation**: 2 spaces
- **Quotes**: Double quotes for JavaScript/TypeScript
- **Semicolons**: Always required
- **Line Width**: 100 characters
- **Trailing Commas**: ES5 style