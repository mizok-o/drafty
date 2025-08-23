can# Project Structure

## Root Level
```
drafty/
├── frontend/           # Next.js frontend application
├── backend/            # NestJS backend API
├── docker-compose.yaml # Container orchestration
├── .env               # Environment variables
└── .husky/            # Git hooks configuration
```

## Frontend Structure (`/frontend`)
```
frontend/
├── src/
│   ├── app/           # Next.js App Router pages
│   │   ├── documents/ # Document-related pages
│   │   │   └── [id]/  # Dynamic document routes
│   │   │       └── edit/ # Document editing interface
│   │   ├── layout.tsx # Root layout component
│   │   ├── page.tsx   # Home page
│   │   └── globals.css # Global styles
│   └── lib/           # Shared utilities
│       ├── api.ts     # API client functions
│       └── websocket.ts # WebSocket client
├── package.json       # Dependencies and scripts
└── biome.json         # Code formatting configuration
```

## Backend Structure (`/backend`)
```
backend/
├── src/
│   ├── app.module.ts     # Main application module
│   ├── main.ts           # Application entry point
│   ├── document/         # Document feature module
│   │   ├── document.controller.ts
│   │   ├── document.service.ts
│   │   ├── document.module.ts
│   │   └── dto/          # Data transfer objects
│   ├── prisma/           # Database service
│   ├── websocket/        # WebSocket gateway
│   └── types/            # Shared type definitions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migration files
├── dist/                 # Compiled JavaScript output
└── package.json          # Dependencies and scripts
```

## Key Conventions

### File Naming
- **Components**: PascalCase (e.g., `EditDocumentClient.tsx`)
- **Pages**: lowercase with Next.js conventions (e.g., `page.tsx`, `[id]`)
- **Services/Utilities**: camelCase (e.g., `document.service.ts`)
- **Types/DTOs**: kebab-case with descriptive suffix (e.g., `create-document.dto.ts`)

### Module Organization
- **Feature-based**: Each major feature (documents, users) has its own module
- **Separation of concerns**: Controllers, services, and DTOs are separated
- **Shared utilities**: Common code in `/lib` (frontend) or `/types` (backend)

### Database
- **Models**: PascalCase in schema, lowercase plural table names
- **Relations**: Properly defined with foreign keys
- **Migrations**: Timestamped with descriptive names

### API Structure
- **RESTful endpoints**: Following REST conventions
- **WebSocket events**: Real-time updates for collaborative features
- **Swagger documentation**: Auto-generated API docs at `/api`

### Environment Configuration
- **Separate .env files**: Root level and per-service
- **Port configuration**: Frontend (3001), Backend (3000), Database (5433)
- **Docker networking**: Services communicate via container names