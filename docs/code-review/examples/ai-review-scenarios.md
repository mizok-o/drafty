# AI Review Scenarios

This document contains realistic code review scenarios to test the effectiveness of the AI Code Review Guide. Each scenario includes the code to be reviewed, the expected AI response, and validation criteria.

## Scenario Categories

1. [New Feature Reviews](#new-feature-reviews)
2. [Bug Fix Reviews](#bug-fix-reviews)
3. [Refactoring Reviews](#refactoring-reviews)
4. [Security Update Reviews](#security-update-reviews)
5. [Performance Optimization Reviews](#performance-optimization-reviews)
6. [Migration Reviews](#migration-reviews)

## New Feature Reviews

### Scenario NF-001: Document Collaboration Feature

**Context**: Adding real-time collaborative editing to documents
**Files Changed**: 
- `backend/src/websocket/collaboration.gateway.ts` (new)
- `backend/src/document/document.service.ts` (modified)
- `frontend/src/hooks/useCollaboration.ts` (new)

**Code to Review**:

```typescript
// backend/src/websocket/collaboration.gateway.ts
import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class CollaborationGateway {
  @SubscribeMessage('join-document')
  handleJoinDocument(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    client.join(`document-${data.documentId}`);
    client.emit('joined-document', { documentId: data.documentId });
  }

  @SubscribeMessage('document-change')
  handleDocumentChange(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    // Broadcast change to all users in the document room
    client.to(`document-${data.documentId}`).emit('document-updated', {
      change: data.change,
      userId: data.userId,
      timestamp: new Date()
    });
  }

  @SubscribeMessage('cursor-position')
  handleCursorPosition(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    client.to(`document-${data.documentId}`).emit('cursor-moved', {
      userId: data.userId,
      position: data.position
    });
  }
}
```

```typescript
// frontend/src/hooks/useCollaboration.ts
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useCollaboration(documentId: string) {
  const [socket, setSocket] = useState(null);
  const [collaborators, setCollaborators] = useState([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.emit('join-document', { documentId });

    newSocket.on('document-updated', (data) => {
      // Apply changes to document
      console.log('Document updated:', data);
    });

    newSocket.on('cursor-moved', (data) => {
      // Update cursor positions
      setCollaborators(prev => 
        prev.map(collab => 
          collab.userId === data.userId 
            ? { ...collab, position: data.position }
            : collab
        )
      );
    });

    return () => newSocket.close();
  }, [documentId]);

  const sendChange = (change) => {
    if (socket) {
      socket.emit('document-change', {
        documentId,
        change,
        userId: 'current-user' // Hardcoded for now
      });
    }
  };

  return { sendChange, collaborators };
}
```

**Expected AI Review Response**:

```markdown
🚨 **SECURITY ISSUE**: Missing authentication and authorization in WebSocket gateway

**Problem**: The WebSocket gateway accepts connections and document changes without any authentication or authorization checks, allowing unauthorized users to join any document and make changes.

**Impact**: This creates a critical security vulnerability where malicious users could access private documents, make unauthorized changes, or disrupt collaborative sessions.

**Solution**: Implement proper authentication middleware and authorization checks for document access.

**Example Fix**:
```typescript
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
})
@UseGuards(WsAuthGuard)
export class CollaborationGateway {
  @SubscribeMessage('join-document')
  async handleJoinDocument(
    @MessageBody() data: JoinDocumentDto, 
    @ConnectedSocket() client: AuthenticatedSocket
  ) {
    // Verify user has access to document
    const hasAccess = await this.documentService.checkUserAccess(
      data.documentId, 
      client.user.id
    );
    
    if (!hasAccess) {
      client.emit('error', { message: 'Access denied' });
      return;
    }
    
    client.join(`document-${data.documentId}`);
    client.emit('joined-document', { documentId: data.documentId });
  }
}
```

⚠️ **PERFORMANCE ISSUE**: Missing rate limiting on WebSocket events

**Problem**: The WebSocket handlers don't implement rate limiting, allowing users to spam events and potentially overwhelm the server.

**Impact**: This could lead to denial of service attacks or degraded performance for legitimate users during collaborative editing sessions.

**Solution**: Implement rate limiting middleware for WebSocket events.

🔒 **TYPE SAFETY ISSUE**: Using 'any' type for WebSocket message payloads

**Problem**: All WebSocket message handlers use 'any' type, eliminating type safety and validation.

**Impact**: This could lead to runtime errors when clients send malformed data, and makes the code harder to maintain.

**Solution**: Define proper DTOs for all WebSocket message types.

❌ **ERROR HANDLING ISSUE**: Missing error handling in React hook

**Problem**: The useCollaboration hook doesn't handle WebSocket connection errors or cleanup properly.

**Impact**: This could lead to memory leaks, failed reconnections, or unhandled errors in the frontend.

**Solution**: Add proper error handling and cleanup logic.
```

### Scenario NF-002: Document Export Feature

**Context**: Adding PDF export functionality
**Files Changed**:
- `backend/src/document/document.controller.ts` (modified)
- `backend/src/export/export.service.ts` (new)

**Code to Review**:

```typescript
// backend/src/export/export.service.ts
import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';

@Injectable()
export class ExportService {
  async exportToPdf(documentId: number, userId: number) {
    // Get document content
    const document = await this.prisma.document.findUnique({
      where: { id: documentId }
    });

    // Create HTML template
    const html = `
      <html>
        <body>
          <h1>${document.title}</h1>
          <div>${document.content}</div>
        </body>
      </html>
    `;

    // Generate PDF
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html);
    
    const pdfPath = `/tmp/document-${documentId}.pdf`;
    await page.pdf({ path: pdfPath, format: 'A4' });
    
    await browser.close();

    // Return file path
    return pdfPath;
  }
}
```

```typescript
// backend/src/document/document.controller.ts (addition)
@Get(':id/export/pdf')
async exportPdf(@Param('id') id: string, @Res() res: Response) {
  const pdfPath = await this.exportService.exportToPdf(+id, 1); // Hardcoded user
  
  const fileStream = fs.createReadStream(pdfPath);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=document.pdf');
  
  fileStream.pipe(res);
  
  // Clean up file
  fs.unlinkSync(pdfPath);
}
```

**Expected AI Review Issues**:
- Missing authorization check
- XSS vulnerability in HTML template
- Resource leak (browser instances)
- Hardcoded user ID
- Synchronous file operations
- Missing error handling
- Temporary file security issues

## Bug Fix Reviews

### Scenario BF-001: Document Update Race Condition

**Context**: Fixing concurrent document updates causing data loss
**Files Changed**: `backend/src/document/document.service.ts`

**Code to Review**:

```typescript
// backend/src/document/document.service.ts
async updateDocument(id: number, updateData: UpdateDocumentDto, userId: number) {
  // Check if document exists and user has access
  const existingDocument = await this.prisma.document.findUnique({
    where: { id }
  });

  if (!existingDocument) {
    throw new NotFoundException('Document not found');
  }

  if (existingDocument.userId !== userId) {
    throw new ForbiddenException('Access denied');
  }

  // Update document
  const updatedDocument = await this.prisma.document.update({
    where: { id },
    data: {
      ...updateData,
      updatedAt: new Date()
    }
  });

  return updatedDocument;
}
```

**Expected AI Review Issues**:
- Race condition between check and update
- Missing optimistic locking
- No version control for concurrent edits
- Potential data loss in collaborative scenarios

### Scenario BF-002: Memory Leak in WebSocket Connections

**Context**: Fixing memory leaks in WebSocket gateway
**Files Changed**: `backend/src/websocket/document.gateway.ts`

**Code to Review**:

```typescript
// backend/src/websocket/document.gateway.ts
@WebSocketGateway()
export class DocumentGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private activeConnections = new Map();

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
    this.activeConnections.set(client.id, {
      socket: client,
      documentId: null,
      userId: null
    });
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
    // Missing cleanup of activeConnections Map
  }

  @SubscribeMessage('join-document')
  handleJoinDocument(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const connection = this.activeConnections.get(client.id);
    connection.documentId = data.documentId;
    connection.userId = data.userId;
    
    client.join(`document-${data.documentId}`);
  }
}
```

**Expected AI Review Issues**:
- Memory leak in activeConnections Map
- Missing cleanup in handleDisconnect
- No error handling for Map operations
- Potential null reference errors

## Refactoring Reviews

### Scenario RF-001: Service Layer Extraction

**Context**: Extracting business logic from controller to service
**Files Changed**: 
- `backend/src/document/document.controller.ts` (modified)
- `backend/src/document/document.service.ts` (modified)

**Code to Review**:

```typescript
// Before refactoring - business logic in controller
@Post()
async createDocument(@Body() createDocumentDto: CreateDocumentDto, @Request() req) {
  // Validation logic in controller
  if (!createDocumentDto.title || createDocumentDto.title.length < 3) {
    throw new BadRequestException('Title must be at least 3 characters');
  }

  // Business logic in controller
  const slug = createDocumentDto.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');

  // Database operation in controller
  const document = await this.prisma.document.create({
    data: {
      ...createDocumentDto,
      slug,
      userId: req.user.id
    }
  });

  // Side effects in controller
  await this.emailService.sendDocumentCreated(document, req.user);

  return document;
}
```

**Expected AI Review Focus**:
- Proper separation of concerns
- Business logic moved to service layer
- Controller should only handle HTTP concerns
- Validation should use DTOs and pipes

## Security Update Reviews

### Scenario SU-001: JWT Authentication Implementation

**Context**: Adding JWT authentication to replace session-based auth
**Files Changed**:
- `backend/src/auth/auth.service.ts` (new)
- `backend/src/auth/jwt.strategy.ts` (new)
- `backend/src/auth/auth.controller.ts` (new)

**Code to Review**:

```typescript
// backend/src/auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    
    if (user && user.password === password) { // Plain text comparison
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload), // No expiration set
    };
  }
}
```

**Expected AI Review Issues**:
- Plain text password comparison (should use bcrypt)
- Missing JWT expiration
- No refresh token mechanism
- Weak JWT secret (if hardcoded)
- Missing rate limiting for login attempts

## Performance Optimization Reviews

### Scenario PO-001: Database Query Optimization

**Context**: Optimizing slow document search queries
**Files Changed**: 
- `backend/src/document/document.service.ts` (modified)
- `backend/prisma/schema.prisma` (modified)

**Code to Review**:

```typescript
// backend/src/document/document.service.ts
async searchDocuments(query: string, userId: number, page: number = 1) {
  const limit = 20;
  const offset = (page - 1) * limit;

  // Inefficient: Multiple separate queries
  const documents = await this.prisma.document.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } }
      ],
      userId
    },
    skip: offset,
    take: limit
  });

  // Separate query for total count
  const total = await this.prisma.document.count({
    where: {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } }
      ],
      userId
    }
  });

  // N+1 problem: Getting author for each document
  for (const doc of documents) {
    doc.author = await this.prisma.user.findUnique({
      where: { id: doc.userId }
    });
  }

  return { documents, total, page, totalPages: Math.ceil(total / limit) };
}
```

**Expected AI Review Issues**:
- N+1 query problem
- Duplicate WHERE conditions
- Missing database indexes
- Case-sensitive search
- No full-text search optimization

## Migration Reviews

### Scenario MG-001: Adding Document Versioning

**Context**: Adding version history to documents
**Files Changed**:
- `backend/prisma/schema.prisma` (modified)
- `backend/prisma/migrations/add-document-versions.sql` (new)

**Code to Review**:

```prisma
// backend/prisma/schema.prisma
model Document {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  version   Int      @default(1) // New field
  userId    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
  versions DocumentVersion[] // New relation
  
  @@map("documents")
}

model DocumentVersion { // New model
  id         Int      @id @default(autoincrement())
  documentId Int
  title      String
  content    String?
  version    Int
  createdAt  DateTime @default(now())
  
  document Document @relation(fields: [documentId], references: [id])
  
  @@map("document_versions")
}
```

```sql
-- backend/prisma/migrations/add-document-versions.sql
-- Add version column to documents
ALTER TABLE documents ADD COLUMN version INTEGER DEFAULT 1;

-- Create document_versions table
CREATE TABLE document_versions (
  id SERIAL PRIMARY KEY,
  document_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  version INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (document_id) REFERENCES documents(id)
);

-- Copy existing documents to versions table
INSERT INTO document_versions (document_id, title, content, version, created_at)
SELECT id, title, content, 1, created_at FROM documents;
```

**Expected AI Review Issues**:
- Missing cascade delete behavior
- No indexes on new foreign keys
- Potential data inconsistency during migration
- Missing rollback strategy
- No version limit (could grow indefinitely)

## Validation Criteria

For each scenario, the AI should:

### ✅ Correctly Identify Issues
- [ ] Security vulnerabilities (authentication, authorization, XSS, SQL injection)
- [ ] Performance problems (N+1 queries, missing indexes, memory leaks)
- [ ] Breaking changes (API modifications, schema changes)
- [ ] Type safety issues (any usage, missing validation)
- [ ] Architecture problems (separation of concerns, proper patterns)

### ✅ Provide Quality Feedback
- [ ] Use appropriate severity levels (critical, major, minor)
- [ ] Follow problem-impact-solution structure
- [ ] Include specific code examples
- [ ] Reference relevant requirements
- [ ] Suggest actionable solutions

### ✅ Maintain Consistency
- [ ] Similar issues receive similar feedback
- [ ] Consistent template usage
- [ ] Appropriate categorization
- [ ] Proper requirement references

### ✅ Consider Context
- [ ] Technology stack specifics (Next.js, NestJS, Prisma)
- [ ] Project conventions and standards
- [ ] Collaborative editing requirements
- [ ] Performance and scalability needs

## Test Execution

To validate the guide effectiveness:

1. **Run each scenario** through the AI review process
2. **Compare responses** against expected issues and feedback quality
3. **Measure accuracy** of issue detection and classification
4. **Evaluate solution quality** and actionability
5. **Check consistency** across similar issue types
6. **Validate completeness** of coverage for each scenario

## Continuous Improvement

Based on test results:

1. **Update guide** for missed issues or incorrect classifications
2. **Add new scenarios** for emerging patterns
3. **Refine templates** based on feedback quality
4. **Adjust severity levels** based on real-world impact
5. **Enhance examples** for better clarity and guidance

This comprehensive set of scenarios ensures the AI Code Review Guide can handle realistic code review situations and provide valuable, actionable feedback to developers working on the Drafty project.