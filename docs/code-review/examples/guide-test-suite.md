# Code Review Guide Test Suite

This document contains test cases to validate the effectiveness of the AI Code Review Guide. Each test case includes problematic code, expected AI responses, and validation criteria.

## Test Categories

1. [Security Vulnerability Tests](#security-vulnerability-tests)
2. [Performance Issue Tests](#performance-issue-tests)
3. [Breaking Change Tests](#breaking-change-tests)
4. [Type Safety Tests](#type-safety-tests)
5. [Architecture Pattern Tests](#architecture-pattern-tests)
6. [Integration Tests](#integration-tests)

## Security Vulnerability Tests

### Test SV-001: SQL Injection via Raw Queries

**Test Code**:
```typescript
// backend/src/document/document.service.ts
async searchDocuments(query: string, userId: string) {
  const sql = `
    SELECT * FROM documents 
    WHERE content LIKE '%${query}%' 
    AND user_id = ${userId}
  `;
  return await this.prisma.$queryRaw(sql);
}
```

**Expected AI Response**:
- ✅ Should identify SQL injection vulnerability
- ✅ Should classify as "critical" severity
- ✅ Should use security vulnerability template
- ✅ Should provide parameterized query solution
- ✅ Should reference requirement 2.2 (API security)

**Validation Criteria**:
```typescript
interface ExpectedResponse {
  severity: 'critical';
  category: 'security_vulnerability';
  problem: string; // Should mention SQL injection
  solution: string; // Should suggest Prisma type-safe queries
  codeExample: string; // Should show proper Prisma usage
}
```

### Test SV-002: XSS via Unescaped Content

**Test Code**:
```typescript
// frontend/src/components/DocumentContent.tsx
function DocumentContent({ content }: { content: string }) {
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: content }}
      className="document-content"
    />
  );
}
```

**Expected AI Response**:
- ✅ Should identify XSS vulnerability
- ✅ Should classify as "critical" severity
- ✅ Should suggest proper content sanitization
- ✅ Should recommend using React's default escaping

### Test SV-003: Exposed Sensitive Data

**Test Code**:
```typescript
// backend/src/user/user.controller.ts
@Get(':id')
async getUser(@Param('id') id: string) {
  return await this.userService.findById(id); // Returns password hash, tokens, etc.
}
```

**Expected AI Response**:
- ✅ Should identify data exposure issue
- ✅ Should classify as "critical" severity
- ✅ Should suggest DTO for response filtering
- ✅ Should provide example of safe response structure

## Performance Issue Tests

### Test PF-001: N+1 Query Problem

**Test Code**:
```typescript
// backend/src/document/document.service.ts
async getDocumentsWithAuthors() {
  const documents = await this.prisma.document.findMany();
  
  for (const doc of documents) {
    doc.author = await this.prisma.user.findUnique({
      where: { id: doc.userId }
    });
  }
  
  return documents;
}
```

**Expected AI Response**:
- ✅ Should identify N+1 query problem
- ✅ Should classify as "major" severity
- ✅ Should suggest using Prisma includes
- ✅ Should provide optimized query example
- ✅ Should reference requirement 2.3 (query optimization)

### Test PF-002: React Performance Issues

**Test Code**:
```typescript
// frontend/src/components/DocumentList.tsx
function DocumentList({ documents }: { documents: Document[] }) {
  return (
    <div>
      {documents.map(doc => (
        <DocumentItem 
          key={doc.id}
          document={doc}
          onEdit={() => console.log('edit', doc.id)} // New function every render
          style={{padding: '10px'}} // New object every render
        />
      ))}
    </div>
  );
}
```

**Expected AI Response**:
- ✅ Should identify unnecessary re-renders
- ✅ Should classify as "major" severity
- ✅ Should suggest useCallback and useMemo
- ✅ Should provide optimized component example

### Test PF-003: Missing Database Indexes

**Test Code**:
```prisma
// backend/prisma/schema.prisma
model Document {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  userId    Int      // No index on frequently queried field
  status    String   // No index on filter field
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id])
}
```

**Expected AI Response**:
- ✅ Should identify missing indexes
- ✅ Should classify as "major" severity
- ✅ Should suggest adding indexes on userId, status, createdAt
- ✅ Should provide schema with proper indexing

## Breaking Change Tests

### Test BC-001: API Response Structure Change

**Test Code**:
```typescript
// backend/src/document/document.controller.ts
@Get(':id')
async getDocument(@Param('id') id: string) {
  const doc = await this.documentService.findOne(id);
  
  // Changed from flat structure to nested
  return {
    document: {
      metadata: { id: doc.id, title: doc.title },
      content: { body: doc.content }
    }
  };
}
```

**Expected AI Response**:
- ✅ Should identify breaking API change
- ✅ Should classify as "critical" severity
- ✅ Should suggest versioning or backward compatibility
- ✅ Should reference requirement 3.3 (breaking changes)

### Test BC-002: Database Schema Breaking Change

**Test Code**:
```prisma
// backend/prisma/schema.prisma - Migration removing required field
model Document {
  id        Int      @id @default(autoincrement())
  title     String
  // content   String   // Removed without migration strategy
  userId    Int
  createdAt DateTime @default(now())
}
```

**Expected AI Response**:
- ✅ Should identify data loss risk
- ✅ Should classify as "critical" severity
- ✅ Should suggest safe migration strategy
- ✅ Should provide multi-step migration example

### Test BC-003: Dependency Breaking Change

**Test Code**:
```json
{
  "dependencies": {
    "react": "^19.0.0",  // Major version jump
    "@nestjs/core": "^12.0.0"  // Major version jump
  }
}
```

**Expected AI Response**:
- ✅ Should identify potential breaking changes
- ✅ Should classify as "major" severity
- ✅ Should suggest incremental updates with testing
- ✅ Should recommend checking changelog and migration guides

## Type Safety Tests

### Test TS-001: Any Type Usage

**Test Code**:
```typescript
// backend/src/document/document.controller.ts
@Post()
async createDocument(@Body() data: any) {
  return await this.documentService.create(data);
}

const processDocument = (doc: any) => {
  return doc.content.toUpperCase();
};
```

**Expected AI Response**:
- ✅ Should identify type safety issues
- ✅ Should classify as "major" severity
- ✅ Should suggest proper interfaces and DTOs
- ✅ Should reference requirement 2.1 (TypeScript usage)

### Test TS-002: Missing Null Safety

**Test Code**:
```typescript
// frontend/src/utils/document.ts
function getDocumentTitle(document: Document) {
  return document.user.profile.firstName + ' - ' + document.title;
}
```

**Expected AI Response**:
- ✅ Should identify null pointer risk
- ✅ Should classify as "major" severity
- ✅ Should suggest optional chaining and null checks
- ✅ Should provide safe implementation example

### Test TS-003: Unsafe Type Casting

**Test Code**:
```typescript
// backend/src/document/document.service.ts
async updateDocument(id: string, data: any) {
  const documentId = +id; // Unsafe conversion
  const updateData = data as UpdateDocumentDto; // Unsafe casting
  
  return await this.prisma.document.update({
    where: { id: documentId },
    data: updateData
  });
}
```

**Expected AI Response**:
- ✅ Should identify unsafe type operations
- ✅ Should classify as "major" severity
- ✅ Should suggest proper validation and parsing
- ✅ Should provide type-safe implementation

## Architecture Pattern Tests

### Test AP-001: Improper NestJS Module Structure

**Test Code**:
```typescript
// backend/src/app.module.ts
@Module({
  imports: [PrismaModule],
  controllers: [
    DocumentController,
    UserController,
    AuthController,
    CommentController,
    FileController
  ],
  providers: [
    DocumentService,
    UserService,
    AuthService,
    CommentService,
    FileService,
    EmailService,
    NotificationService
  ],
})
export class AppModule {}
```

**Expected AI Response**:
- ✅ Should identify monolithic module structure
- ✅ Should classify as "major" severity
- ✅ Should suggest feature-based modules
- ✅ Should provide proper module organization example

### Test AP-002: Business Logic in Controller

**Test Code**:
```typescript
// backend/src/document/document.controller.ts
@Post()
async createDocument(@Body() createDocumentDto: CreateDocumentDto) {
  // Business logic in controller - anti-pattern
  if (!createDocumentDto.title || createDocumentDto.title.length < 3) {
    throw new BadRequestException('Title must be at least 3 characters');
  }
  
  const slug = createDocumentDto.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-');
  
  const document = await this.prisma.document.create({
    data: {
      ...createDocumentDto,
      slug,
      userId: 1 // Hardcoded
    }
  });
  
  // Send notification email
  await this.emailService.sendDocumentCreated(document);
  
  return document;
}
```

**Expected AI Response**:
- ✅ Should identify business logic in controller
- ✅ Should classify as "major" severity
- ✅ Should suggest moving logic to service layer
- ✅ Should provide proper separation of concerns example

### Test AP-003: Improper Next.js App Router Usage

**Test Code**:
```typescript
// frontend/src/app/documents/page.tsx
'use client';

import { PrismaClient } from '@prisma/client';
import { useState, useEffect } from 'react';

const prisma = new PrismaClient();

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  
  useEffect(() => {
    // Database calls in client component
    const fetchDocuments = async () => {
      const docs = await prisma.document.findMany();
      setDocuments(docs);
    };
    
    fetchDocuments();
  }, []);
  
  return <div>{/* render documents */}</div>;
}
```

**Expected AI Response**:
- ✅ Should identify server/client boundary violation
- ✅ Should classify as "critical" severity
- ✅ Should suggest proper server component usage
- ✅ Should provide correct App Router pattern

## Integration Tests

### Test IT-001: WebSocket Security

**Test Code**:
```typescript
// backend/src/websocket/document.gateway.ts
@WebSocketGateway()
export class DocumentGateway {
  @SubscribeMessage('document-update')
  handleDocumentUpdate(client: Socket, payload: any) {
    // No authentication check
    // No input validation
    // No rate limiting
    
    this.server.emit('document-updated', payload);
  }
}
```

**Expected AI Response**:
- ✅ Should identify multiple security issues
- ✅ Should classify as "critical" severity
- ✅ Should suggest authentication, validation, rate limiting
- ✅ Should provide secure WebSocket implementation

### Test IT-002: Missing Error Handling

**Test Code**:
```typescript
// backend/src/document/document.service.ts
async createDocument(createDocumentDto: CreateDocumentDto) {
  const document = await this.prisma.document.create({
    data: createDocumentDto
  });
  
  // No error handling for Prisma errors
  // No transaction handling
  // No validation of business rules
  
  return document;
}
```

**Expected AI Response**:
- ✅ Should identify missing error handling
- ✅ Should classify as "major" severity
- ✅ Should suggest try-catch blocks and proper error types
- ✅ Should provide robust error handling example

## Test Execution Framework

### Automated Test Runner

```typescript
interface TestCase {
  id: string;
  category: string;
  description: string;
  inputCode: string;
  expectedResponse: ExpectedAIResponse;
  validationCriteria: ValidationCriteria[];
}

interface ExpectedAIResponse {
  severity: 'critical' | 'major' | 'minor';
  category: string;
  shouldIdentify: string[];
  shouldSuggest: string[];
  shouldReference: string[];
}

interface ValidationCriteria {
  type: 'contains' | 'matches' | 'structure';
  field: string;
  value: string | RegExp | object;
}

// Example test execution
const testSuite: TestCase[] = [
  {
    id: 'SV-001',
    category: 'security',
    description: 'SQL Injection Detection',
    inputCode: `/* SQL injection test code */`,
    expectedResponse: {
      severity: 'critical',
      category: 'security_vulnerability',
      shouldIdentify: ['SQL injection', 'raw query'],
      shouldSuggest: ['parameterized queries', 'Prisma type-safe'],
      shouldReference: ['requirement 2.2']
    },
    validationCriteria: [
      {
        type: 'contains',
        field: 'problem',
        value: 'SQL injection'
      },
      {
        type: 'matches',
        field: 'severity',
        value: 'critical'
      }
    ]
  }
];
```

### Manual Test Checklist

For each test case, verify:

- [ ] **Issue Detection**: AI correctly identifies the problem
- [ ] **Severity Classification**: Appropriate severity level assigned
- [ ] **Template Usage**: Correct feedback template applied
- [ ] **Solution Quality**: Actionable and specific solution provided
- [ ] **Code Examples**: Working code examples included
- [ ] **Requirement References**: Relevant requirements cited
- [ ] **Consistency**: Similar issues receive similar feedback
- [ ] **Completeness**: All aspects of the problem addressed

### Performance Benchmarks

The guide should achieve:

- **Security Detection Rate**: >95% for critical security issues
- **Performance Issue Detection**: >90% for major performance problems
- **Breaking Change Detection**: >95% for API/schema breaking changes
- **False Positive Rate**: <10% for all categories
- **Response Time**: Feedback provided within reasonable time limits
- **Consistency Score**: >90% similar feedback for similar issues

### Continuous Improvement

Track and analyze:

1. **Missed Issues**: Problems not caught by the guide
2. **False Positives**: Issues incorrectly flagged
3. **Feedback Quality**: Usefulness of provided solutions
4. **Developer Satisfaction**: Effectiveness from user perspective
5. **Guide Updates**: Frequency of required updates

### Test Results Documentation

```markdown
## Test Execution Results

### Test Run: 2024-01-15

**Overall Results**:
- Total Tests: 25
- Passed: 23 (92%)
- Failed: 2 (8%)
- Skipped: 0

**Category Breakdown**:
- Security: 8/8 passed (100%)
- Performance: 6/7 passed (86%)
- Breaking Changes: 5/5 passed (100%)
- Type Safety: 4/5 passed (80%)

**Failed Tests**:
- PF-002: React performance issues - Severity incorrectly classified as minor instead of major
- TS-003: Unsafe type casting - Missing code example in solution

**Action Items**:
1. Update performance issue severity guidelines
2. Add more code examples to type safety templates
3. Review and update test cases based on failures
```

## Maintenance Schedule

### Weekly
- Run automated test suite
- Review any new false positives/negatives
- Update test cases for new patterns discovered

### Monthly
- Analyze test results trends
- Update guide based on common failures
- Add new test cases for emerging patterns

### Quarterly
- Comprehensive guide effectiveness review
- Update test suite for technology changes
- Benchmark against industry standards

This test suite ensures the Code Review Guide remains effective and continues to catch critical issues while providing valuable feedback to developers.