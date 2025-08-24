# Real Code Examples from Drafty Codebase

This document contains real code examples showing common issues found in the Drafty codebase, along with before/after examples and sample AI review comments for different problem scenarios.

## Table of Contents

1. [Backend Examples (NestJS)](#backend-examples-nestjs)
2. [Database Examples (Prisma)](#database-examples-prisma)
3. [Frontend Examples (Next.js/React)](#frontend-examples-nextjsreact)
4. [Sample AI Review Comments](#sample-ai-review-comments)
5. [Test Scenarios](#test-scenarios)

## Backend Examples (NestJS)

### Example 1: Missing Input Validation and Error Handling

**❌ Current Code (Problematic):**
```typescript
// backend/src/document/document.controller.ts
@Controller("documents")
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentService.create(createDocumentDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentService.update(+id, updateDocumentDto);
  }
}
```

**Issues Identified:**
1. No error handling for invalid input
2. Converting string to number with `+id` without validation
3. Missing authentication guards
4. No API documentation decorators
5. No response type definitions

**✅ Improved Code:**
```typescript
// backend/src/document/document.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Put, 
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpException
} from "@nestjs/common";
import { ApiTags, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { DocumentService } from "./document.service";
import type { CreateDocumentDto } from "./dto/create-document.dto";
import type { UpdateDocumentDto } from "./dto/update-document.dto";
import type { DocumentResponseDto } from "./dto/document-response.dto";

@ApiTags('documents')
@Controller("documents")
@UseGuards(AuthGuard('jwt'))
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  @ApiResponse({ status: 201, description: 'Document created successfully', type: DocumentResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createDocumentDto: CreateDocumentDto): Promise<DocumentResponseDto> {
    try {
      return await this.documentService.create(createDocumentDto);
    } catch (error) {
      throw new HttpException(
        'Failed to create document',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document found', type: DocumentResponseDto })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DocumentResponseDto> {
    return await this.documentService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update document by ID' })
  @ApiResponse({ status: 200, description: 'Document updated successfully', type: DocumentResponseDto })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateDocumentDto: UpdateDocumentDto
  ): Promise<DocumentResponseDto> {
    return await this.documentService.update(id, updateDocumentDto);
  }
}
```

### Example 2: Service Layer Issues

**❌ Current Code (Problematic):**
```typescript
// backend/src/document/document.service.ts
@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(createDocumentDto: CreateDocumentDto) {
    return this.prisma.document.create({
      data: {
        ...createDocumentDto,
        userId: 1, // Hardcoded user ID
      },
    });
  }

  async findOne(id: number) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });
    
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    
    return document;
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto) {
    await this.findOne(id); // Unnecessary extra query
    
    return this.prisma.document.update({
      where: { id },
      data: updateDocumentDto,
    });
  }
}
```

**Issues Identified:**
1. Hardcoded user ID
2. Unnecessary database query in update method
3. No transaction handling for data consistency
4. Missing proper error handling for Prisma errors
5. No user context/authentication integration

**✅ Improved Code:**
```typescript
// backend/src/document/document.service.ts
import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import type { CreateDocumentDto } from "./dto/create-document.dto";
import type { UpdateDocumentDto } from "./dto/update-document.dto";
import type { User } from "@prisma/client";

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}

  async create(createDocumentDto: CreateDocumentDto, user: User) {
    try {
      return await this.prisma.document.create({
        data: {
          ...createDocumentDto,
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        throw new BadRequestException('Invalid document data');
      }
      throw new InternalServerErrorException('Failed to create document');
    }
  }

  async findOne(id: number, user?: User) {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });
      
      if (!document) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }

      // Check if user has access to this document
      if (user && document.userId !== user.id) {
        throw new ForbiddenException('Access denied to this document');
      }
      
      return document;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve document');
    }
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto, user: User) {
    try {
      // Use upsert pattern to handle not found case
      const document = await this.prisma.document.update({
        where: { 
          id,
          userId: user.id // Ensure user owns the document
        },
        data: updateDocumentDto,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return document;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Document with ID ${id} not found or access denied`);
        }
      }
      throw new InternalServerErrorException('Failed to update document');
    }
  }
}
```

## Database Examples (Prisma)

### Example 3: Schema Design Issues

**❌ Current Schema (Problematic):**
```prisma
// backend/prisma/schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  documents  Document[]
  
  @@map("users")
}

model Document {
  id        Int      @id @default(autoincrement())
  title     String?
  content   String?
  published Boolean  @default(false)
  userId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user    User     @relation(fields: [userId], references: [id])
  
  @@map("documents")
}
```

**Issues Identified:**
1. No length constraints on string fields
2. Missing indexes on frequently queried fields
3. No enum for document status
4. Missing cascade delete behavior
5. No validation constraints

**✅ Improved Schema:**
```prisma
// backend/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum DocumentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique @db.VarChar(255)
  name      String?  @db.VarChar(100)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  documents Document[]
  
  @@map("users")
  @@index([email])
}

model Document {
  id        Int            @id @default(autoincrement())
  title     String         @db.VarChar(255)
  content   String?        @db.Text
  status    DocumentStatus @default(DRAFT)
  userId    Int
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("documents")
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}
```

### Example 4: Query Optimization Issues

**❌ Current Code (N+1 Problem):**
```typescript
// Inefficient: Multiple queries
async getDocumentsWithAuthors() {
  const documents = await this.prisma.document.findMany({
    orderBy: { updatedAt: 'desc' },
  });

  // N+1 problem: One query per document
  for (const doc of documents) {
    doc.author = await this.prisma.user.findUnique({
      where: { id: doc.userId }
    });
  }

  return documents;
}

async getDocumentStats() {
  const totalDocs = await this.prisma.document.count();
  const publishedDocs = await this.prisma.document.count({
    where: { published: true }
  });
  const draftDocs = await this.prisma.document.count({
    where: { published: false }
  });

  return { totalDocs, publishedDocs, draftDocs };
}
```

**✅ Optimized Code:**
```typescript
// Efficient: Single query with includes
async getDocumentsWithAuthors() {
  return await this.prisma.document.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
          // Exclude sensitive fields like password
        }
      }
    }
  });
}

// Efficient: Single aggregation query
async getDocumentStats() {
  const stats = await this.prisma.document.groupBy({
    by: ['status'],
    _count: {
      id: true
    }
  });

  return {
    total: stats.reduce((sum, stat) => sum + stat._count.id, 0),
    published: stats.find(s => s.status === 'PUBLISHED')?._count.id || 0,
    draft: stats.find(s => s.status === 'DRAFT')?._count.id || 0,
    archived: stats.find(s => s.status === 'ARCHIVED')?._count.id || 0
  };
}
```

## Frontend Examples (Next.js/React)

### Example 5: Next.js App Router Issues

**❌ Current Code (Problematic):**
```typescript
// Mixing server and client code incorrectly
'use client';

import { PrismaClient } from '@prisma/client';
import { useState, useEffect } from 'react';

const prisma = new PrismaClient(); // Wrong: Prisma in client component

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    // Wrong: Database calls in client component
    const fetchDocuments = async () => {
      const docs = await prisma.document.findMany();
      setDocuments(docs);
    };

    fetchDocuments();
  }, []);

  return (
    <div>
      {documents.map(doc => (
        <div key={Math.random()}> {/* Wrong: Random keys */}
          <h2>{doc.title}</h2>
          <p>{doc.content}</p>
        </div>
      ))}
    </div>
  );
}
```

**✅ Improved Code:**
```typescript
// app/documents/page.tsx (Server Component)
import { prisma } from '@/lib/prisma';
import { DocumentList } from './components/DocumentList';

export default async function DocumentsPage() {
  // Server-side data fetching
  const documents = await prisma.document.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return (
    <div>
      <h1>Documents</h1>
      <DocumentList documents={documents} />
    </div>
  );
}

// app/documents/components/DocumentList.tsx (Client Component)
'use client';

import { useState } from 'react';
import type { Document, User } from '@prisma/client';

type DocumentWithUser = Document & {
  user: Pick<User, 'id' | 'name'>;
};

interface DocumentListProps {
  documents: DocumentWithUser[];
}

export function DocumentList({ documents }: DocumentListProps) {
  const [filter, setFilter] = useState('');

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Filter documents..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      
      {filteredDocuments.map(doc => (
        <div key={doc.id}> {/* Correct: Stable keys */}
          <h2>{doc.title}</h2>
          <p>By: {doc.user.name}</p>
          <p>{doc.content?.substring(0, 100)}...</p>
        </div>
      ))}
    </div>
  );
}
```

### Example 6: React Performance Issues

**❌ Current Code (Performance Problems):**
```typescript
// Component with multiple performance issues
function DocumentEditor({ document, onSave }) {
  const [content, setContent] = useState(document.content);
  const [title, setTitle] = useState(document.title);

  // Problem: Creates new object on every render
  const editorConfig = {
    toolbar: ['bold', 'italic', 'underline'],
    placeholder: 'Start writing...',
    onChange: (value) => setContent(value) // Problem: New function every render
  };

  // Problem: Effect runs on every render
  useEffect(() => {
    console.log('Document changed');
  });

  // Problem: Expensive operation on every render
  const wordCount = content.split(' ').filter(word => word.length > 0).length;

  const handleSave = () => {
    onSave({
      ...document,
      title,
      content,
      wordCount
    });
  };

  return (
    <div>
      <input 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{marginBottom: '10px'}} // Problem: New object every render
      />
      
      <Editor config={editorConfig} />
      
      <div>Words: {wordCount}</div>
      
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
```

**✅ Optimized Code:**
```typescript
import { useState, useEffect, useMemo, useCallback } from 'react';

interface DocumentEditorProps {
  document: Document;
  onSave: (document: Document) => void;
}

function DocumentEditor({ document, onSave }: DocumentEditorProps) {
  const [content, setContent] = useState(document.content);
  const [title, setTitle] = useState(document.title);

  // Memoize editor configuration
  const editorConfig = useMemo(() => ({
    toolbar: ['bold', 'italic', 'underline'],
    placeholder: 'Start writing...',
    onChange: setContent // Stable reference
  }), []);

  // Proper dependency array
  useEffect(() => {
    console.log('Document changed');
  }, [document.id]);

  // Memoize expensive calculation
  const wordCount = useMemo(() => {
    return content.split(' ').filter(word => word.length > 0).length;
  }, [content]);

  // Memoize styles
  const inputStyle = useMemo(() => ({
    marginBottom: '10px'
  }), []);

  // Stable callback reference
  const handleSave = useCallback(() => {
    onSave({
      ...document,
      title,
      content,
      wordCount
    });
  }, [document, title, content, wordCount, onSave]);

  return (
    <div>
      <input 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
      />
      
      <Editor config={editorConfig} />
      
      <div>Words: {wordCount}</div>
      
      <button onClick={handleSave}>Save</button>
    </div>
  );
}

export default DocumentEditor;
```

## Sample AI Review Comments

### Security Issue Comment

```markdown
🚨 **SECURITY ISSUE**: Missing input validation on API endpoint

**Problem**: The `createDocument` endpoint accepts unvalidated user input through the `any` type, creating a critical security vulnerability.

**Impact**: This allows malicious users to inject harmful data, potentially leading to data corruption, unauthorized access, or system compromise. Without proper validation, attackers could send unexpected data structures or malicious payloads.

**Solution**: Implement proper input validation using class-validator decorators on your DTO classes.

**Example Fix**:
```typescript
// Add validation to CreateDocumentDto
export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(10000)
  content?: string;
}

// Update controller to use typed DTO
@Post()
async create(@Body() createDocumentDto: CreateDocumentDto) {
  return this.documentService.create(createDocumentDto);
}
```

**Requirements Reference**: Violates requirement 2.2 (API endpoint validation) and 4.4 (security considerations)
```

### Performance Issue Comment

```markdown
⚠️ **PERFORMANCE ISSUE**: N+1 query problem in document retrieval

**Problem**: The `getDocumentsWithAuthors` method executes one query to fetch documents, then an additional query for each document to fetch the author information.

**Impact**: This creates a significant performance bottleneck. With 100 documents, this results in 101 database queries instead of 1, causing slow response times and increased database load.

**Solution**: Use Prisma's `include` option to fetch related data in a single optimized query.

**Example Fix**:
```typescript
// Replace multiple queries
const documents = await this.prisma.document.findMany();
for (const doc of documents) {
  doc.author = await this.prisma.user.findUnique({ where: { id: doc.userId } });
}

// With single optimized query
const documents = await this.prisma.document.findMany({
  include: {
    user: {
      select: { id: true, name: true, email: true }
    }
  }
});
```

**Requirements Reference**: Addresses requirement 2.3 (query optimization) and 4.4 (performance considerations)
```

### Breaking Change Comment

```markdown
💥 **BREAKING CHANGE**: API response structure modification

**Problem**: The response structure for `/documents/:id` has been changed from a flat object to a nested structure without API versioning.

**Impact**: This will break existing frontend clients and any external integrations that depend on the current API contract. Users will experience application failures when the frontend tries to access the old structure.

**Solution**: Either maintain backward compatibility or implement proper API versioning.

**Example Fix**:
```typescript
// Option 1: Maintain backward compatibility
@Get(':id')
async getDocument(@Param('id') id: string) {
  const document = await this.documentService.findOne(id);
  
  // Keep existing flat structure
  return {
    id: document.id,
    title: document.title,
    content: document.content,
    userId: document.userId,
    // Add new fields as optional
    author?: document.user
  };
}

// Option 2: Use API versioning
@Get('v2/documents/:id')
async getDocumentV2(@Param('id') id: string) {
  // New nested structure
  return {
    document: {
      metadata: { id, title },
      content: { body }
    }
  };
}
```

**Requirements Reference**: Violates requirement 3.3 (breaking change assessment) and 4.3 (API consistency)
```

### Type Safety Issue Comment

```markdown
🔒 **TYPE SAFETY ISSUE**: Using 'any' type compromises type safety

**Problem**: Multiple functions use the `any` type instead of proper TypeScript interfaces, eliminating compile-time type checking.

**Impact**: This leads to runtime errors, loss of IDE support (autocomplete, refactoring), and makes the code harder to maintain and debug. Type-related bugs won't be caught until runtime.

**Solution**: Define proper interfaces for all data structures and replace `any` with specific types.

**Example Fix**:
```typescript
// Replace any types
const processDocument = (doc: any) => {
  return doc.content.toUpperCase(); // Could fail at runtime
};

// With proper typing
interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
}

const processDocument = (doc: Document): string => {
  return doc.content.toUpperCase(); // Type-safe
};
```

**Requirements Reference**: Addresses requirement 2.1 (TypeScript type safety) and 3.4 (maintainability)
```

## Test Scenarios

### Scenario 1: New Feature Review

**Context**: Adding real-time collaboration feature
**Files Changed**:
- `backend/src/websocket/collaboration.gateway.ts` (new)
- `backend/src/document/document.service.ts` (modified)
- `frontend/src/hooks/useCollaboration.ts` (new)

**Expected AI Review Focus**:
1. WebSocket security (authentication, rate limiting)
2. Real-time data synchronization conflicts
3. Performance impact of frequent updates
4. Error handling for connection failures
5. Type safety for WebSocket message payloads

### Scenario 2: Database Migration Review

**Context**: Adding document versioning
**Files Changed**:
- `backend/prisma/schema.prisma` (modified)
- `backend/prisma/migrations/add-document-versions.sql` (new)

**Expected AI Review Focus**:
1. Migration safety (no data loss)
2. Rollback strategy
3. Index performance impact
4. Foreign key constraints
5. Backward compatibility

### Scenario 3: Security Update Review

**Context**: Implementing JWT authentication
**Files Changed**:
- `backend/src/auth/auth.service.ts` (new)
- `backend/src/auth/jwt.strategy.ts` (new)
- `backend/src/document/document.controller.ts` (modified)

**Expected AI Review Focus**:
1. JWT token security (secret management, expiration)
2. Authentication bypass vulnerabilities
3. Authorization checks on protected endpoints
4. Password hashing and validation
5. Session management security

### Scenario 4: Performance Optimization Review

**Context**: Optimizing document search
**Files Changed**:
- `backend/src/document/document.service.ts` (modified)
- `backend/prisma/schema.prisma` (modified - added indexes)

**Expected AI Review Focus**:
1. Query optimization effectiveness
2. Index impact on write performance
3. Search result pagination
4. Caching strategy
5. Database connection pooling

### Scenario 5: Frontend Component Review

**Context**: Creating document editor component
**Files Changed**:
- `frontend/src/components/DocumentEditor.tsx` (new)
- `frontend/src/hooks/useDocumentEditor.ts` (new)

**Expected AI Review Focus**:
1. React performance (unnecessary re-renders)
2. Memory leaks in useEffect
3. Proper state management
4. Accessibility compliance
5. Error boundary implementation

## Guide Effectiveness Testing

### Test Case 1: Critical Security Issue Detection

**Input Code**:
```typescript
@Get('/user/:id/documents')
async getUserDocuments(@Param('id') userId: string) {
  const query = `SELECT * FROM documents WHERE user_id = ${userId}`;
  return await this.prisma.$queryRaw(query);
}
```

**Expected AI Response**:
- Should identify SQL injection vulnerability
- Should classify as critical security issue
- Should provide specific fix with parameterized queries
- Should reference security requirements

### Test Case 2: Performance Issue Detection

**Input Code**:
```typescript
async getDocumentsWithComments() {
  const documents = await this.prisma.document.findMany();
  for (const doc of documents) {
    doc.comments = await this.prisma.comment.findMany({
      where: { documentId: doc.id }
    });
  }
  return documents;
}
```

**Expected AI Response**:
- Should identify N+1 query problem
- Should classify as major performance issue
- Should suggest using Prisma includes
- Should provide optimized code example

### Test Case 3: Breaking Change Detection

**Input Code**:
```typescript
// Changed from returning Document to DocumentWithMetadata
@Get(':id')
async getDocument(@Param('id') id: string) {
  const doc = await this.documentService.findOne(id);
  return {
    metadata: { id: doc.id, created: doc.createdAt },
    content: { title: doc.title, body: doc.content }
  };
}
```

**Expected AI Response**:
- Should identify breaking API change
- Should classify as critical breaking change
- Should suggest versioning or backward compatibility
- Should reference API design requirements

## Validation Checklist

Use this checklist to validate the guide's effectiveness:

- [ ] AI correctly identifies security vulnerabilities (SQL injection, XSS, etc.)
- [ ] AI detects performance issues (N+1 queries, missing indexes, etc.)
- [ ] AI flags breaking changes (API modifications, schema changes, etc.)
- [ ] AI provides specific, actionable solutions with code examples
- [ ] AI references relevant requirements from requirements.md
- [ ] AI uses appropriate severity levels (critical, major, minor)
- [ ] AI follows the problem-impact-solution feedback structure
- [ ] AI considers Drafty-specific technology stack (Next.js, NestJS, Prisma)
- [ ] AI validates against project conventions and standards
- [ ] AI provides consistent feedback format across different issue types

## Maintenance Notes

This examples document should be updated when:
- New common issues are discovered in code reviews
- Technology stack is updated (framework versions, new tools)
- Project conventions change
- New security vulnerabilities are identified
- Performance patterns evolve

Regular review ensures the examples remain relevant and effective for maintaining code quality.