# Critical Anti-Patterns Reference

This document provides a comprehensive reference of critical anti-patterns, security vulnerabilities, performance bottlenecks, and breaking change patterns specific to the Drafty stack (Next.js 15, NestJS, Prisma, PostgreSQL).

## Table of Contents

1. [Security Vulnerabilities](#security-vulnerabilities)
2. [Performance Bottlenecks](#performance-bottlenecks)
3. [Breaking Change Patterns](#breaking-change-patterns)
4. [Frontend Anti-Patterns](#frontend-anti-patterns)
5. [Backend Anti-Patterns](#backend-anti-patterns)
6. [Database Anti-Patterns](#database-anti-patterns)
7. [TypeScript Anti-Patterns](#typescript-anti-patterns)

## Security Vulnerabilities

### SQL Injection via Raw Queries

**❌ Critical Issue:**
```typescript
// NEVER do this - vulnerable to SQL injection
const getUserDocuments = async (userId: string) => {
  return await prisma.$queryRaw`
    SELECT * FROM documents WHERE user_id = ${userId}
  `;
};
```

**✅ Correct Implementation:**
```typescript
// Use Prisma's type-safe queries
const getUserDocuments = async (userId: string) => {
  return await prisma.document.findMany({
    where: { userId }
  });
};
```

**Detection:** Look for `$queryRaw`, `$executeRaw`, or string concatenation in database queries.

### XSS via Unescaped User Input

**❌ Critical Issue:**
```typescript
// Dangerous - allows XSS attacks
const DocumentTitle = ({ title }: { title: string }) => {
  return <h1 dangerouslySetInnerHTML={{ __html: title }} />;
};
```

**✅ Correct Implementation:**
```typescript
// Safe - React automatically escapes content
const DocumentTitle = ({ title }: { title: string }) => {
  return <h1>{title}</h1>;
};
```

**Detection:** Look for `dangerouslySetInnerHTML` without proper sanitization.

### Exposed Sensitive Data in API Responses

**❌ Critical Issue:**
```typescript
// Exposes sensitive user data
@Get(':id')
async getUser(@Param('id') id: string) {
  return await this.userService.findById(id); // Returns password, tokens, etc.
}
```

**✅ Correct Implementation:**
```typescript
// Only return necessary data
@Get(':id')
async getUser(@Param('id') id: string) {
  const user = await this.userService.findById(id);
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}
```

**Detection:** Check if API endpoints return full database objects without filtering sensitive fields.

### Missing Input Validation

**❌ Critical Issue:**
```typescript
// No validation - accepts any input
@Post()
async createDocument(@Body() data: any) {
  return await this.documentService.create(data);
}
```

**✅ Correct Implementation:**
```typescript
// Proper validation with DTOs
@Post()
async createDocument(@Body() createDocumentDto: CreateDocumentDto) {
  return await this.documentService.create(createDocumentDto);
}
```

**Detection:** Look for `any` types in API endpoints or missing validation decorators.

## Performance Bottlenecks

### N+1 Query Problem

**❌ Performance Issue:**
```typescript
// Causes N+1 queries - one for documents, then one per document for user
const getDocumentsWithAuthors = async () => {
  const documents = await prisma.document.findMany();
  
  for (const doc of documents) {
    doc.author = await prisma.user.findUnique({
      where: { id: doc.userId }
    });
  }
  
  return documents;
};
```

**✅ Correct Implementation:**
```typescript
// Single query with include
const getDocumentsWithAuthors = async () => {
  return await prisma.document.findMany({
    include: {
      user: true
    }
  });
};
```

**Detection:** Look for database queries inside loops or multiple sequential queries that could be combined.

### Missing Database Indexes

**❌ Performance Issue:**
```prisma
// No index on frequently queried field
model Document {
  id        String   @id @default(cuid())
  title     String
  userId    String   // Missing index - slow queries
  createdAt DateTime @default(now())
}
```

**✅ Correct Implementation:**
```prisma
// Proper indexing for query performance
model Document {
  id        String   @id @default(cuid())
  title     String
  userId    String   
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
}
```

**Detection:** Check for missing indexes on foreign keys and frequently filtered fields.

### Inefficient React Re-renders

**❌ Performance Issue:**
```typescript
// Causes unnecessary re-renders
const DocumentList = ({ documents }: { documents: Document[] }) => {
  return (
    <div>
      {documents.map(doc => (
        <DocumentItem 
          key={doc.id} 
          document={doc}
          onEdit={() => console.log('edit')} // New function on every render
        />
      ))}
    </div>
  );
};
```

**✅ Correct Implementation:**
```typescript
// Stable callback references
const DocumentList = ({ documents }: { documents: Document[] }) => {
  const handleEdit = useCallback((id: string) => {
    console.log('edit', id);
  }, []);

  return (
    <div>
      {documents.map(doc => (
        <DocumentItem 
          key={doc.id} 
          document={doc}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
};
```

**Detection:** Look for inline functions in JSX props or missing `useCallback`/`useMemo` for expensive operations.

### Blocking WebSocket Operations

**❌ Performance Issue:**
```typescript
// Blocks event loop with synchronous operations
@SubscribeMessage('document-update')
async handleDocumentUpdate(client: Socket, payload: any) {
  // Synchronous file operations block other WebSocket events
  const content = fs.readFileSync(`./documents/${payload.id}.txt`, 'utf8');
  
  // Heavy computation blocks event loop
  const processedContent = heavyProcessingFunction(content);
  
  this.server.emit('document-updated', processedContent);
}
```

**✅ Correct Implementation:**
```typescript
// Non-blocking async operations
@SubscribeMessage('document-update')
async handleDocumentUpdate(client: Socket, payload: any) {
  try {
    // Use async file operations
    const content = await fs.promises.readFile(`./documents/${payload.id}.txt`, 'utf8');
    
    // Offload heavy computation or use streaming
    const processedContent = await this.processContentAsync(content);
    
    this.server.emit('document-updated', processedContent);
  } catch (error) {
    client.emit('error', { message: 'Failed to update document' });
  }
}
```

**Detection:** Look for synchronous operations in WebSocket handlers or missing error handling.

## Breaking Change Patterns

### Database Schema Breaking Changes

**❌ Breaking Change:**
```prisma
// Removes required field without migration strategy
model Document {
  id        String   @id @default(cuid())
  title     String
  // content   String   // Removed - breaks existing data
  userId    String
  createdAt DateTime @default(now())
}
```

**✅ Safe Migration:**
```prisma
// Gradual migration approach
model Document {
  id          String   @id @default(cuid())
  title       String
  content     String?  // Make optional first
  newContent  String?  // Add new field
  userId      String
  createdAt   DateTime @default(now())
}
```

**Detection:** Look for removed required fields, renamed columns, or changed data types without migration strategy.

### API Contract Breaking Changes

**❌ Breaking Change:**
```typescript
// Changes response structure without versioning
@Get(':id')
async getDocument(@Param('id') id: string) {
  const doc = await this.documentService.findById(id);
  
  // Changed from { id, title, content } to nested structure
  return {
    document: {
      metadata: { id: doc.id, title: doc.title },
      body: { content: doc.content }
    }
  };
}
```

**✅ Backward Compatible:**
```typescript
// Maintain existing structure or use API versioning
@Get(':id')
async getDocument(@Param('id') id: string) {
  const doc = await this.documentService.findById(id);
  
  // Keep existing structure
  return {
    id: doc.id,
    title: doc.title,
    content: doc.content
  };
}
```

**Detection:** Look for changes to existing API response structures, removed endpoints, or changed parameter requirements.

### Dependency Breaking Changes

**❌ Breaking Change:**
```json
{
  "dependencies": {
    "react": "^19.0.0"  // Major version jump without testing
  }
}
```

**✅ Safe Upgrade:**
```json
{
  "dependencies": {
    "react": "^18.2.0"  // Incremental updates with testing
  }
}
```

**Detection:** Look for major version updates in package.json without corresponding code changes or testing.

## Frontend Anti-Patterns

### Improper Next.js App Router Usage

**❌ Anti-Pattern:**
```typescript
// Using client components unnecessarily
'use client';

import { prisma } from '@/lib/prisma';

export default async function DocumentPage() {
  // Database calls in client components
  const documents = await prisma.document.findMany();
  
  return <div>{documents.map(doc => <div key={doc.id}>{doc.title}</div>)}</div>;
}
```

**✅ Correct Pattern:**
```typescript
// Server component for data fetching
import { prisma } from '@/lib/prisma';

export default async function DocumentPage() {
  const documents = await prisma.document.findMany();
  
  return <DocumentList documents={documents} />;
}

// Separate client component for interactivity
'use client';
function DocumentList({ documents }: { documents: Document[] }) {
  return (
    <div>
      {documents.map(doc => (
        <DocumentItem key={doc.id} document={doc} />
      ))}
    </div>
  );
}
```

**Detection:** Look for `'use client'` with server-side operations or unnecessary client components.

### State Management Anti-Patterns

**❌ Anti-Pattern:**
```typescript
// Prop drilling and unnecessary state
function App() {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  return (
    <DocumentList 
      user={user} 
      documents={documents} 
      loading={loading}
      setUser={setUser}
      setDocuments={setDocuments}
      setLoading={setLoading}
    />
  );
}
```

**✅ Correct Pattern:**
```typescript
// Use context or proper state management
const DocumentContext = createContext();

function App() {
  return (
    <DocumentProvider>
      <DocumentList />
    </DocumentProvider>
  );
}
```

**Detection:** Look for excessive prop passing, multiple useState calls for related data, or missing context usage.

## Backend Anti-Patterns

### Improper NestJS Module Structure

**❌ Anti-Pattern:**
```typescript
// Everything in one module
@Module({
  imports: [PrismaModule],
  controllers: [
    DocumentController, 
    UserController, 
    AuthController, 
    WebSocketGateway
  ],
  providers: [
    DocumentService, 
    UserService, 
    AuthService, 
    EmailService,
    FileService
  ],
})
export class AppModule {}
```

**✅ Correct Pattern:**
```typescript
// Feature-based modules
@Module({
  imports: [
    DocumentModule,
    UserModule,
    AuthModule,
    WebSocketModule
  ],
})
export class AppModule {}

@Module({
  imports: [PrismaModule],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService]
})
export class DocumentModule {}
```

**Detection:** Look for modules with too many controllers/providers or missing feature separation.

### Missing Error Handling

**❌ Anti-Pattern:**
```typescript
// No error handling
@Post()
async createDocument(@Body() createDocumentDto: CreateDocumentDto) {
  const document = await this.documentService.create(createDocumentDto);
  return document;
}
```

**✅ Correct Pattern:**
```typescript
// Proper error handling
@Post()
async createDocument(@Body() createDocumentDto: CreateDocumentDto) {
  try {
    const document = await this.documentService.create(createDocumentDto);
    return document;
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      throw new BadRequestException('Invalid document data');
    }
    throw new InternalServerErrorException('Failed to create document');
  }
}
```

**Detection:** Look for missing try-catch blocks in controllers or services that interact with external systems.

## Database Anti-Patterns

### Inefficient Prisma Queries

**❌ Anti-Pattern:**
```typescript
// Multiple queries instead of single optimized query
const getDocumentWithDetails = async (id: string) => {
  const document = await prisma.document.findUnique({ where: { id } });
  const author = await prisma.user.findUnique({ where: { id: document.userId } });
  const comments = await prisma.comment.findMany({ where: { documentId: id } });
  
  return { document, author, comments };
};
```

**✅ Correct Pattern:**
```typescript
// Single query with includes
const getDocumentWithDetails = async (id: string) => {
  return await prisma.document.findUnique({
    where: { id },
    include: {
      user: true,
      comments: {
        include: {
          user: true
        }
      }
    }
  });
};
```

**Detection:** Look for multiple sequential Prisma queries that could be combined with `include` or `select`.

### Missing Database Constraints

**❌ Anti-Pattern:**
```prisma
// No constraints - allows invalid data
model Document {
  id        String   @id @default(cuid())
  title     String   // No length limit
  userId    String   // No foreign key constraint
  status    String   // No enum constraint
}
```

**✅ Correct Pattern:**
```prisma
// Proper constraints
model Document {
  id        String        @id @default(cuid())
  title     String        @db.VarChar(255)
  userId    String        
  status    DocumentStatus @default(DRAFT)
  
  user      User          @relation(fields: [userId], references: [id])
  
  @@index([userId])
}

enum DocumentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

**Detection:** Look for missing foreign key constraints, enum types, or length limits on string fields.

## TypeScript Anti-Patterns

### Type Safety Violations

**❌ Anti-Pattern:**
```typescript
// Disabling TypeScript safety
const processDocument = (doc: any) => {
  // @ts-ignore
  return doc.content.toUpperCase();
};

// Using any everywhere
interface ApiResponse {
  data: any;
  status: any;
  error: any;
}
```

**✅ Correct Pattern:**
```typescript
// Proper typing
interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
}

const processDocument = (doc: Document): string => {
  return doc.content.toUpperCase();
};

interface ApiResponse<T> {
  data: T;
  status: number;
  error?: string;
}
```

**Detection:** Look for `any` types, `@ts-ignore` comments, or missing interface definitions.

### Missing Null Safety

**❌ Anti-Pattern:**
```typescript
// Assumes data always exists
const getUserName = (user: User) => {
  return user.profile.firstName + ' ' + user.profile.lastName;
};
```

**✅ Correct Pattern:**
```typescript
// Proper null checking
const getUserName = (user: User): string => {
  if (!user.profile) {
    return 'Unknown User';
  }
  
  const firstName = user.profile.firstName ?? '';
  const lastName = user.profile.lastName ?? '';
  
  return `${firstName} ${lastName}`.trim() || 'Unknown User';
};
```

**Detection:** Look for property access without null checks or missing optional chaining.

## Detection Guidelines

When reviewing code, prioritize these critical issues:

1. **Security**: SQL injection, XSS, exposed sensitive data
2. **Performance**: N+1 queries, missing indexes, blocking operations
3. **Breaking Changes**: API contract changes, schema modifications
4. **Type Safety**: `any` usage, missing null checks
5. **Architecture**: Improper module structure, missing error handling

## Project Tooling Standards Violations

### Biome Configuration Violations

**❌ Anti-Pattern:**
```typescript
// Multiple style violations
import {Document} from './types'  // Missing space, single quotes
import { User } from "./user";    // Inconsistent quote style

export default function DocumentEditor(props:any) {  // Missing space around colon
    const data = {
        title: 'My Document',  // Single quotes
        content: props.content,  // 4-space indentation
    }  // Missing semicolon
    
    return <div>{data.title}</div>
}
```

**✅ Correct Pattern:**
```typescript
// Follows Biome configuration
import { Document } from "./types";
import { User } from "./user";

export default function DocumentEditor(props: DocumentEditorProps) {
  const data = {
    title: "My Document",
    content: props.content,
  };
  
  return <div>{data.title}</div>;
}
```

**Detection:** Look for inconsistent indentation (not 2 spaces), single quotes, missing semicolons, lines over 100 characters, or unorganized imports.

### Pre-commit Hook Bypass

**❌ Anti-Pattern:**
```bash
# Bypassing pre-commit hooks
git commit --no-verify -m "Quick fix"

# Or committing code that fails linting
git add .
git commit -m "Added feature" # Fails lint-staged but forced through
```

**✅ Correct Pattern:**
```bash
# Let pre-commit hooks run and fix issues
npm run check:fix  # Fix Biome issues first
git add .
git commit -m "Added feature"  # Passes all checks
```

**Detection:** Look for commits that bypass hooks or code that would fail `npx @biomejs/biome check --fix`.

### Project Structure Violations

**❌ Anti-Pattern:**
```
backend/
├── src/
│   ├── everything.controller.ts  # Wrong naming convention
│   ├── DOCUMENT.SERVICE.TS       # Wrong case
│   ├── user-dto.ts              # Wrong location and naming
│   └── utils/
│       └── DocumentHelper.tsx    # Wrong extension in backend
```

**✅ Correct Pattern:**
```
backend/
├── src/
│   ├── document/
│   │   ├── document.controller.ts
│   │   ├── document.service.ts
│   │   └── dto/
│   │       └── create-document.dto.ts
│   └── user/
│       ├── user.controller.ts
│       └── user.service.ts
```

**Detection:** Look for incorrect file naming (not camelCase for services, not kebab-case for DTOs), wrong file extensions, or improper module organization.

### Technology Stack Violations

**❌ Anti-Pattern:**
```json
{
  "dependencies": {
    "eslint": "^8.0.0",        // Using ESLint instead of Biome
    "prettier": "^2.0.0",      // Using Prettier instead of Biome
    "express": "^4.18.0"       // Direct Express instead of NestJS
  },
  "scripts": {
    "lint": "eslint src/",     // Wrong linting tool
    "format": "prettier --write src/"  // Wrong formatting tool
  }
}
```

**✅ Correct Pattern:**
```json
{
  "dependencies": {
    "@nestjs/core": "^11.0.1",
    "@nestjs/common": "^11.0.1"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.1.1"
  },
  "scripts": {
    "check": "biome check ./src ./test",
    "check:fix": "biome check --fix ./src ./test"
  }
}
```

**Detection:** Look for usage of ESLint/Prettier instead of Biome, direct Express usage instead of NestJS, or wrong port configurations.

### Environment Configuration Violations

**❌ Anti-Pattern:**
```typescript
// Hardcoded configuration
const app = await NestFactory.create(AppModule);
await app.listen(8080);  // Wrong port, should be 3000

// In frontend
const API_URL = 'http://localhost:8080/api';  // Wrong backend port
```

**✅ Correct Pattern:**
```typescript
// Using environment variables and correct ports
const app = await NestFactory.create(AppModule);
await app.listen(process.env.PORT || 3000);

// In frontend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
```

**Detection:** Look for hardcoded ports that don't match tech standards (frontend: 3001, backend: 3000, database: 5433).

## Steering Document Integration Violations

### Technology Standards Violations

**❌ Anti-Pattern:**
```typescript
// Using wrong framework versions
import { NextApiRequest, NextApiResponse } from 'next';  // Pages Router instead of App Router

// Using wrong database ORM
import { createConnection } from 'typeorm';  // TypeORM instead of Prisma

// Wrong package manager
yarn install  // Using yarn instead of npm
```

**✅ Correct Pattern:**
```typescript
// Using correct App Router patterns
export async function GET(request: Request) {
  // App Router API route
}

// Using Prisma as specified
import { PrismaClient } from '@prisma/client';

// Using npm as specified
npm install
```

**Detection:** Look for usage of Pages Router instead of App Router, wrong ORMs, or different package managers than specified in tech.md.

### Product Context Violations

**❌ Anti-Pattern:**
```typescript
// Features that don't support collaboration
export class DocumentService {
  async updateDocument(id: string, content: string) {
    // No real-time updates - breaks collaborative editing
    return await this.prisma.document.update({
      where: { id },
      data: { content }
    });
  }
}
```

**✅ Correct Pattern:**
```typescript
// Features that support collaborative editing
export class DocumentService {
  async updateDocument(id: string, content: string) {
    const document = await this.prisma.document.update({
      where: { id },
      data: { content }
    });
    
    // Emit real-time update for collaboration
    this.websocketGateway.emitDocumentUpdate(id, document);
    
    return document;
  }
}
```

**Detection:** Look for features that don't support real-time collaboration, missing WebSocket integration, or functionality that doesn't align with document management goals.

## Tooling Integration Issues Detection

### Build Process Violations
- [ ] Code doesn't compile with `npm run build`
- [ ] TypeScript errors in production build
- [ ] Missing environment variables in build
- [ ] Wrong build output directories

### Development Environment Issues
- [ ] Services don't start on correct ports
- [ ] Docker Compose configuration doesn't match project standards
- [ ] Missing or incorrect environment files
- [ ] Database connection issues with specified configuration

### Code Quality Tool Violations
- [ ] Code fails Biome linting checks
- [ ] Imports not organized according to Biome settings
- [ ] Files not covered by lint-staged patterns
- [ ] Manual formatting that conflicts with Biome

### Integration Test Failures
- [ ] Pre-commit hooks fail on new code
- [ ] Database migrations fail in development environment
- [ ] API endpoints don't follow Swagger documentation standards
- [ ] WebSocket connections fail with specified configuration

## Quick Reference Checklist

- [ ] No raw SQL queries with user input
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] API responses don't expose sensitive data
- [ ] Database queries use proper includes/selects
- [ ] Indexes exist on foreign keys and filtered fields
- [ ] WebSocket handlers are non-blocking
- [ ] Schema changes have migration strategy
- [ ] API changes maintain backward compatibility
- [ ] Components use proper server/client boundaries
- [ ] Modules follow feature-based organization
- [ ] Error handling exists for external operations
- [ ] TypeScript types are properly defined
- [ ] Null safety is implemented
- [ ] Code follows Biome formatting standards
- [ ] Pre-commit hooks pass successfully
- [ ] File naming follows project conventions
- [ ] Technology stack matches steering documents
- [ ] Features support collaborative editing requirements