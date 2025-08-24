# Before/After Code Examples

This document provides comprehensive before/after examples for each major issue type that the AI Code Review Guide should detect and help fix. Each example includes the problematic code, the improved version, and detailed explanations.

## Table of Contents

1. [Security Vulnerabilities](#security-vulnerabilities)
2. [Performance Issues](#performance-issues)
3. [Breaking Changes](#breaking-changes)
4. [Type Safety Issues](#type-safety-issues)
5. [Architecture Problems](#architecture-problems)
6. [Error Handling Issues](#error-handling-issues)
7. [Database Design Problems](#database-design-problems)
8. [React/Next.js Issues](#reactnextjs-issues)

## Security Vulnerabilities

### SQL Injection Prevention

**❌ Before (Vulnerable to SQL Injection):**
```typescript
// backend/src/document/document.service.ts
async searchDocuments(searchTerm: string, userId: string) {
  // CRITICAL: SQL injection vulnerability
  const query = `
    SELECT d.*, u.name as author_name 
    FROM documents d 
    JOIN users u ON d.user_id = u.id 
    WHERE d.content LIKE '%${searchTerm}%' 
    AND d.user_id = ${userId}
    ORDER BY d.created_at DESC
  `;
  
  return await this.prisma.$queryRaw(query);
}
```

**✅ After (Secure Implementation):**
```typescript
// backend/src/document/document.service.ts
async searchDocuments(searchTerm: string, userId: number) {
  // Secure: Using Prisma's type-safe queries
  return await this.prisma.document.findMany({
    where: {
      AND: [
        { userId },
        {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { content: { contains: searchTerm, mode: 'insensitive' } }
          ]
        }
      ]
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
          // Exclude sensitive fields like password
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}
```

**Key Improvements:**
- Eliminated raw SQL with user input
- Used Prisma's parameterized queries
- Added proper type safety
- Implemented case-insensitive search
- Excluded sensitive user data from response

### XSS Prevention

**❌ Before (Vulnerable to XSS):**
```typescript
// frontend/src/components/DocumentContent.tsx
interface DocumentContentProps {
  content: string;
  allowHtml?: boolean;
}

function DocumentContent({ content, allowHtml = true }: DocumentContentProps) {
  if (allowHtml) {
    // CRITICAL: XSS vulnerability - unescaped HTML
    return (
      <div 
        className="document-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  
  return <div className="document-content">{content}</div>;
}
```

**✅ After (XSS Protected):**
```typescript
// frontend/src/components/DocumentContent.tsx
import DOMPurify from 'dompurify';
import { useMemo } from 'react';

interface DocumentContentProps {
  content: string;
  allowHtml?: boolean;
}

function DocumentContent({ content, allowHtml = false }: DocumentContentProps) {
  // Sanitize HTML content to prevent XSS
  const sanitizedContent = useMemo(() => {
    if (!allowHtml) return content;
    
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3'],
      ALLOWED_ATTR: ['class'],
      FORBID_SCRIPT: true
    });
  }, [content, allowHtml]);
  
  if (allowHtml) {
    return (
      <div 
        className="document-content"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  }
  
  // Default to escaped content (React's default behavior)
  return <div className="document-content">{content}</div>;
}
```

**Key Improvements:**
- Added DOMPurify for HTML sanitization
- Restricted allowed HTML tags and attributes
- Made HTML rendering opt-in (default false)
- Used useMemo for performance optimization
- Maintained React's default XSS protection for plain text

### Authentication & Authorization

**❌ Before (Missing Security Controls):**
```typescript
// backend/src/document/document.controller.ts
@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get(':id')
  async getDocument(@Param('id') id: string) {
    // No authentication check
    // No authorization check
    return await this.documentService.findOne(+id);
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    // Anyone can delete any document
    return await this.documentService.remove(+id);
  }
}
```

**✅ After (Secure with Auth & Authorization):**
```typescript
// backend/src/document/document.controller.ts
import { 
  Controller, 
  Get, 
  Delete, 
  Param, 
  UseGuards, 
  Request,
  ForbiddenException,
  ParseIntPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiTags('documents')
@Controller('documents')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocument(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    const document = await this.documentService.findOne(id);
    
    // Check if user has access to this document
    if (document.userId !== req.user.id && !document.isPublic) {
      throw new ForbiddenException('Access denied to this document');
    }
    
    return document;
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async deleteDocument(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any
  ) {
    const document = await this.documentService.findOne(id);
    
    // Only document owner can delete
    if (document.userId !== req.user.id) {
      throw new ForbiddenException('Only document owner can delete');
    }
    
    return await this.documentService.remove(id);
  }
}
```

**Key Improvements:**
- Added JWT authentication guard
- Implemented ownership-based authorization
- Added proper input validation with ParseIntPipe
- Added comprehensive API documentation
- Included proper error responses for security violations

## Performance Issues

### N+1 Query Problem

**❌ Before (N+1 Query Problem):**
```typescript
// backend/src/document/document.service.ts
async getDocumentsWithDetails() {
  // First query: Get all documents
  const documents = await this.prisma.document.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // N queries: One for each document's author and comments
  for (const document of documents) {
    // Query 2, 3, 4... N+1: Get author for each document
    document.author = await this.prisma.user.findUnique({
      where: { id: document.userId }
    });

    // Query N+2, N+3... 2N+1: Get comments for each document
    document.comments = await this.prisma.comment.findMany({
      where: { documentId: document.id },
      include: {
        user: {
          select: { id: true, name: true }
        }
      }
    });
  }

  return documents;
}
```

**✅ After (Optimized Single Query):**
```typescript
// backend/src/document/document.service.ts
async getDocumentsWithDetails() {
  // Single optimized query with all related data
  return await this.prisma.document.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
          // Exclude sensitive fields
        }
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      },
      _count: {
        select: {
          comments: true
        }
      }
    }
  });
}
```

**Key Improvements:**
- Reduced from N+1 queries to 1 query
- Included all related data in single request
- Added comment count for additional metadata
- Maintained proper field selection for security
- Ordered comments chronologically

### React Performance Optimization

**❌ Before (Performance Issues):**
```typescript
// frontend/src/components/DocumentList.tsx
import { useState } from 'react';

interface Document {
  id: string;
  title: string;
  content: string;
  author: { name: string };
}

function DocumentList({ documents }: { documents: Document[] }) {
  const [filter, setFilter] = useState('');

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter documents..."
      />
      
      {documents
        .filter(doc => 
          // Expensive operation on every render
          doc.title.toLowerCase().includes(filter.toLowerCase()) ||
          doc.content.toLowerCase().includes(filter.toLowerCase())
        )
        .map(doc => (
          <div key={doc.id}>
            <h3>{doc.title}</h3>
            <p>By: {doc.author.name}</p>
            <p>{doc.content.substring(0, 100)}...</p>
            
            {/* New objects created on every render */}
            <button 
              onClick={() => console.log('Edit', doc.id)}
              style={{ marginRight: '10px' }}
            >
              Edit
            </button>
            
            <button 
              onClick={() => console.log('Delete', doc.id)}
              style={{ marginLeft: '10px' }}
            >
              Delete
            </button>
          </div>
        ))}
    </div>
  );
}
```

**✅ After (Optimized Performance):**
```typescript
// frontend/src/components/DocumentList.tsx
import { useState, useMemo, useCallback } from 'react';

interface Document {
  id: string;
  title: string;
  content: string;
  author: { name: string };
}

interface DocumentListProps {
  documents: Document[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function DocumentList({ documents, onEdit, onDelete }: DocumentListProps) {
  const [filter, setFilter] = useState('');

  // Memoize expensive filtering operation
  const filteredDocuments = useMemo(() => {
    if (!filter) return documents;
    
    const lowerFilter = filter.toLowerCase();
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(lowerFilter) ||
      doc.content.toLowerCase().includes(lowerFilter)
    );
  }, [documents, filter]);

  // Memoize button styles
  const buttonStyles = useMemo(() => ({
    edit: { marginRight: '10px' },
    delete: { marginLeft: '10px' }
  }), []);

  // Stable callback references
  const handleEdit = useCallback((id: string) => {
    onEdit?.(id);
  }, [onEdit]);

  const handleDelete = useCallback((id: string) => {
    onDelete?.(id);
  }, [onDelete]);

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter documents..."
      />
      
      {filteredDocuments.map(doc => (
        <DocumentItem
          key={doc.id}
          document={doc}
          onEdit={handleEdit}
          onDelete={handleDelete}
          buttonStyles={buttonStyles}
        />
      ))}
    </div>
  );
}

// Separate component for better performance
const DocumentItem = React.memo(({ 
  document, 
  onEdit, 
  onDelete, 
  buttonStyles 
}: {
  document: Document;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  buttonStyles: { edit: React.CSSProperties; delete: React.CSSProperties };
}) => {
  const handleEdit = useCallback(() => {
    onEdit(document.id);
  }, [onEdit, document.id]);

  const handleDelete = useCallback(() => {
    onDelete(document.id);
  }, [onDelete, document.id]);

  return (
    <div>
      <h3>{document.title}</h3>
      <p>By: {document.author.name}</p>
      <p>{document.content.substring(0, 100)}...</p>
      
      <button onClick={handleEdit} style={buttonStyles.edit}>
        Edit
      </button>
      
      <button onClick={handleDelete} style={buttonStyles.delete}>
        Delete
      </button>
    </div>
  );
});
```

**Key Improvements:**
- Memoized expensive filtering operation
- Used stable callback references with useCallback
- Memoized style objects to prevent re-creation
- Separated DocumentItem into memoized component
- Eliminated inline object/function creation
- Added proper prop types for better type safety

### Database Index Optimization

**❌ Before (Missing Indexes):**
```prisma
// backend/prisma/schema.prisma
model Document {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  status    String   // No index - slow filtering
  userId    Int      // No index - slow joins
  createdAt DateTime @default(now()) // No index - slow sorting
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
  
  @@map("documents")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  documents Document[]
  
  @@map("users")
}
```

**✅ After (Optimized with Indexes):**
```prisma
// backend/prisma/schema.prisma
enum DocumentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
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
  // Indexes for common query patterns
  @@index([userId])                    // For user's documents
  @@index([status])                    // For filtering by status
  @@index([createdAt])                 // For sorting by date
  @@index([userId, status])            // Composite for user + status queries
  @@index([status, createdAt])         // Composite for status + date queries
  @@fulltext([title, content])         // Full-text search
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique @db.VarChar(255)
  name      String?  @db.VarChar(100)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  documents Document[]
  
  @@map("users")
  @@index([email])  // For login queries
}
```

**Key Improvements:**
- Added enum for document status (type safety + performance)
- Created indexes for all frequently queried fields
- Added composite indexes for common query combinations
- Added full-text search index for content search
- Specified appropriate column types and lengths
- Added cascade delete for data integrity

## Breaking Changes

### API Versioning for Backward Compatibility

**❌ Before (Breaking API Change):**
```typescript
// backend/src/document/document.controller.ts
@Get(':id')
async getDocument(@Param('id') id: string) {
  const document = await this.documentService.findOne(+id);
  
  // BREAKING: Changed response structure without versioning
  return {
    documentData: {
      metadata: {
        id: document.id,
        title: document.title,
        createdAt: document.createdAt
      },
      content: {
        body: document.content,
        wordCount: document.content?.split(' ').length || 0
      },
      author: {
        id: document.user.id,
        name: document.user.name
      }
    }
  };
}
```

**✅ After (Backward Compatible with Versioning):**
```typescript
// backend/src/document/document.controller.ts
@Get(':id')
@ApiResponse({ status: 200, description: 'Document (v1 format)' })
async getDocument(@Param('id') id: string) {
  const document = await this.documentService.findOne(+id);
  
  // Maintain v1 format for backward compatibility
  return {
    id: document.id,
    title: document.title,
    content: document.content,
    userId: document.userId,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
    // Add new fields as optional
    author: document.user ? {
      id: document.user.id,
      name: document.user.name
    } : undefined
  };
}

@Get('v2/:id')
@ApiResponse({ status: 200, description: 'Document (v2 format)' })
async getDocumentV2(@Param('id') id: string) {
  const document = await this.documentService.findOne(+id);
  
  // New structured format in v2
  return {
    document: {
      metadata: {
        id: document.id,
        title: document.title,
        createdAt: document.createdAt,
        updatedAt: document.updatedAt
      },
      content: {
        body: document.content,
        wordCount: document.content?.split(' ').length || 0
      },
      author: {
        id: document.user.id,
        name: document.user.name,
        email: document.user.email
      }
    }
  };
}
```

**Key Improvements:**
- Maintained original API format for backward compatibility
- Added new v2 endpoint with improved structure
- Added optional fields to v1 instead of breaking changes
- Provided clear API documentation for both versions
- Allowed gradual migration path for clients

### Safe Database Migration

**❌ Before (Dangerous Migration):**
```sql
-- Dangerous: Immediate column drop could cause data loss
ALTER TABLE documents DROP COLUMN content;
ALTER TABLE documents ADD COLUMN body TEXT;

-- Dangerous: Changing column type without data validation
ALTER TABLE documents ALTER COLUMN status TYPE VARCHAR(20);
```

**✅ After (Safe Multi-Step Migration):**
```sql
-- Migration 1: Add new column
ALTER TABLE documents ADD COLUMN body TEXT;

-- Migration 2: Copy data (run after deployment)
UPDATE documents SET body = content WHERE content IS NOT NULL;

-- Migration 3: Add enum type (separate migration)
CREATE TYPE document_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- Migration 4: Add new status column with enum
ALTER TABLE documents ADD COLUMN status_new document_status DEFAULT 'DRAFT';

-- Migration 5: Migrate status data
UPDATE documents 
SET status_new = CASE 
  WHEN status = 'draft' THEN 'DRAFT'::document_status
  WHEN status = 'published' THEN 'PUBLISHED'::document_status
  ELSE 'DRAFT'::document_status
END;

-- Migration 6: (After verification) Drop old columns
-- ALTER TABLE documents DROP COLUMN content;
-- ALTER TABLE documents DROP COLUMN status;
-- ALTER TABLE documents RENAME COLUMN body TO content;
-- ALTER TABLE documents RENAME COLUMN status_new TO status;
```

**Key Improvements:**
- Multi-step migration process prevents data loss
- Added new columns before removing old ones
- Included data validation and migration steps
- Provided rollback strategy
- Used proper enum types for better data integrity

## Type Safety Issues

### Proper TypeScript Interface Usage

**❌ Before (Poor Type Safety):**
```typescript
// backend/src/document/document.service.ts
async createDocument(data: any, user: any) {
  // No type safety - could fail at runtime
  const document = await this.prisma.document.create({
    data: {
      title: data.title,
      content: data.content,
      userId: user.id,
      status: data.status || 'draft'
    }
  });

  return document;
}

async processDocuments(documents: any[]) {
  return documents.map((doc: any) => {
    return {
      id: doc.id,
      title: doc.title.toUpperCase(), // Could fail if title is null
      wordCount: doc.content.split(' ').length, // Could fail if content is null
      authorName: doc.user.name // Could fail if user is null
    };
  });
}
```

**✅ After (Type-Safe Implementation):**
```typescript
// backend/src/document/dto/create-document.dto.ts
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export class CreateDocumentDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(10000)
  content?: string;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;
}

// backend/src/document/interfaces/document.interface.ts
export interface DocumentWithAuthor {
  id: number;
  title: string;
  content: string | null;
  status: DocumentStatus;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ProcessedDocument {
  id: number;
  title: string;
  wordCount: number;
  authorName: string;
}

// backend/src/document/document.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import type { User } from '@prisma/client';
import type { CreateDocumentDto } from './dto/create-document.dto';
import type { DocumentWithAuthor, ProcessedDocument } from './interfaces/document.interface';

@Injectable()
export class DocumentService {
  async createDocument(
    createDocumentDto: CreateDocumentDto, 
    user: User
  ): Promise<DocumentWithAuthor> {
    try {
      const document = await this.prisma.document.create({
        data: {
          title: createDocumentDto.title,
          content: createDocumentDto.content,
          status: createDocumentDto.status || DocumentStatus.DRAFT,
          userId: user.id
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

      return document;
    } catch (error) {
      throw new BadRequestException('Failed to create document');
    }
  }

  processDocuments(documents: DocumentWithAuthor[]): ProcessedDocument[] {
    return documents.map((doc) => {
      // Type-safe with proper null checking
      const title = doc.title || 'Untitled';
      const content = doc.content || '';
      const authorName = doc.user?.name || 'Unknown Author';
      
      return {
        id: doc.id,
        title: title.toUpperCase(),
        wordCount: content.split(' ').filter(word => word.length > 0).length,
        authorName
      };
    });
  }
}
```

**Key Improvements:**
- Added comprehensive type definitions with interfaces
- Used class-validator for runtime validation
- Implemented proper null checking and default values
- Added enum for document status type safety
- Included proper error handling with typed exceptions
- Used Prisma's generated types for database operations

This comprehensive before/after examples document provides clear guidance on how to transform problematic code into secure, performant, and maintainable implementations following the Drafty project's standards and best practices.