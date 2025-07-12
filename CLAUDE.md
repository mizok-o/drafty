# Drafty Project Rules

## Database Schema Rules
- Table names must be lowercase and plural (e.g., users, documents)
- Use @@map directive in Prisma models to map to lowercase plural table names
- Model names should remain PascalCase (e.g., User, Document)
- Column names should be camelCase in Prisma models

## Development Guidelines
- Always use existing components and utilities when possible
- Follow NestJS conventions for backend development
- Use TypeScript strictly