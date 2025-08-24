# AI Code Review Guide for Drafty

## Quick Reference - Critical Issues Detection

### 🚨 Critical Issues (Must Fix Immediately)
- **Security vulnerabilities**: SQL injection, XSS, authentication bypasses
- **Breaking changes**: API contract changes, database schema breaking changes
- **Data loss risks**: Unsafe migrations, missing transaction boundaries
- **Performance killers**: N+1 queries, memory leaks, blocking operations

### ⚠️ Major Issues (Fix Before Merge)
- **Bug risks**: Unhandled errors, race conditions, null pointer exceptions
- **Type safety**: Missing TypeScript types, `any` usage, unsafe casting
- **API inconsistencies**: Missing validation, improper error responses
- **Resource leaks**: Unclosed connections, missing cleanup

### 📋 Minor Issues (Address When Possible)
- **Code quality**: Duplicated logic, complex functions, poor naming
- **Performance optimizations**: Unnecessary re-renders, inefficient algorithms
- **Documentation**: Missing JSDoc, outdated comments
- **Style violations**: Biome configuration deviations

## Severity Classification System

### Critical (🔴 Severity 1)
**Impact**: System failure, security breach, data corruption
**Examples**:
- Authentication bypass vulnerabilities
- SQL injection or XSS vulnerabilities
- Database migrations that cause data loss
- Breaking API changes without versioning

**Review Action**: Block merge immediately, require security review

### Major (🟡 Severity 2)
**Impact**: Feature failure, significant performance degradation
**Examples**:
- Unhandled promise rejections
- N+1 database query problems
- Missing input validation on API endpoints
- TypeScript `any` usage in critical paths

**Review Action**: Must fix before merge

### Minor (🟢 Severity 3)
**Impact**: Code quality, maintainability, minor performance
**Examples**:
- Missing JSDoc comments
- Inefficient but functional algorithms
- Style guide violations
- Duplicated code blocks

**Review Action**: Address in current PR or create follow-up issue

## Technology-Specific Problem Detection

### Frontend (Next.js + React + TypeScript)
**Critical Issues to Check**:
- Client-side data exposure (API keys, sensitive data)
- Hydration mismatches causing runtime errors
- Infinite re-render loops
- Memory leaks in useEffect hooks

**Common Bug Patterns**:
- Missing dependency arrays in useEffect
- Stale closure problems in event handlers
- Improper state updates causing race conditions
- Missing error boundaries for component failures

### Backend (NestJS + TypeScript)
**Critical Issues to Check**:
- Missing authentication/authorization guards
- Unvalidated user input reaching database
- Exposed internal error details to clients
- Missing transaction boundaries for data consistency

**Common Bug Patterns**:
- Circular dependency injection
- Missing error handling in async operations
- Improper use of decorators
- Memory leaks from unclosed database connections

### Database (Prisma + PostgreSQL)
**Critical Issues to Check**:
- Unsafe migration operations (DROP, ALTER without backup)
- Missing foreign key constraints
- Queries without proper indexing causing locks
- Raw SQL queries vulnerable to injection

**Common Bug Patterns**:
- N+1 query problems
- Missing transaction isolation
- Inefficient query patterns
- Schema changes breaking existing code

## Problem-Focused Feedback Templates

Use these standardized templates to provide consistent, actionable feedback for different types of issues. Each template follows the Problem-Impact-Solution structure for clarity.

### Security Vulnerability Template
```
🚨 **SECURITY ISSUE**: [Brief description]

**Problem**: [What makes this a security risk]
**Impact**: [Potential consequences - data breach, unauthorized access, etc.]
**Solution**: [Specific fix with code example]

**Example Fix**:
```typescript
// Before (vulnerable)
const query = `SELECT * FROM users WHERE id = ${userId}`;

// After (secure)
const user = await prisma.user.findUnique({ where: { id: userId } });
```
```

### Performance Issue Template
```
⚠️ **PERFORMANCE ISSUE**: [Brief description]

**Problem**: [What causes the performance problem]
**Impact**: [Performance degradation - slow response, high memory usage, etc.]
**Solution**: [Optimization approach with code example]

**Example Fix**:
```typescript
// Before (N+1 problem)
const documents = await prisma.document.findMany();
for (const doc of documents) {
  doc.author = await prisma.user.findUnique({ where: { id: doc.authorId } });
}

// After (optimized)
const documents = await prisma.document.findMany({
  include: { author: true }
});
```
```

### Bug Risk Template
```
🐛 **BUG RISK**: [Brief description]

**Problem**: [What could go wrong]
**Impact**: [Runtime errors, data inconsistency, etc.]
**Solution**: [How to make it safer]

**Example Fix**:
```typescript
// Before (risky)
const result = await apiCall();
return result.data.items[0].value;

// After (safe)
const result = await apiCall();
if (!result?.data?.items?.length) {
  throw new Error('No items found');
}
return result.data.items[0]?.value ?? null;
```
```

### Breaking Change Template
```
💥 **BREAKING CHANGE**: [Brief description]

**Problem**: [What makes this change breaking]
**Impact**: [Systems/clients that will be affected]
**Solution**: [Migration strategy or backward compatibility approach]

**Example Fix**:
```typescript
// Before (breaking)
interface DocumentResponse {
  id: string;
  content: string;
}

// After (backward compatible)
interface DocumentResponse {
  id: string;
  content: string;
  title?: string; // New optional field
}

// Or with versioning
interface DocumentResponseV2 extends DocumentResponse {
  title: string;
  createdAt: Date;
}
```
```

### Type Safety Issue Template
```
🔒 **TYPE SAFETY ISSUE**: [Brief description]

**Problem**: [How type safety is compromised]
**Impact**: [Runtime errors, loss of IDE support, maintenance issues]
**Solution**: [Proper typing approach]

**Example Fix**:
```typescript
// Before (unsafe)
const processData = (data: any) => {
  return data.items.map((item: any) => item.value);
};

// After (type-safe)
interface DataItem {
  value: string;
  id: number;
}

interface ApiResponse {
  items: DataItem[];
}

const processData = (data: ApiResponse): string[] => {
  return data.items.map(item => item.value);
};
```
```

### Error Handling Issue Template
```
❌ **ERROR HANDLING ISSUE**: [Brief description]

**Problem**: [What errors are not properly handled]
**Impact**: [Unhandled exceptions, poor user experience, system instability]
**Solution**: [Proper error handling strategy]

**Example Fix**:
```typescript
// Before (poor error handling)
const updateDocument = async (id: string, data: UpdateDocumentDto) => {
  const document = await prisma.document.update({
    where: { id },
    data
  });
  return document;
};

// After (proper error handling)
const updateDocument = async (id: string, data: UpdateDocumentDto) => {
  try {
    const document = await prisma.document.update({
      where: { id },
      data
    });
    return document;
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundException(`Document with id ${id} not found`);
    }
    throw new InternalServerErrorException('Failed to update document');
  }
};
```
```

### API Design Issue Template
```
🔌 **API DESIGN ISSUE**: [Brief description]

**Problem**: [What makes the API design problematic]
**Impact**: [Poor developer experience, inconsistency, maintenance burden]
**Solution**: [Better API design approach]

**Example Fix**:
```typescript
// Before (inconsistent)
@Get('/document/:id')
getDocument(@Param('id') id: string) {
  return this.documentService.findOne(id);
}

@Get('/documents')
getAllDocuments() {
  return this.documentService.findAll();
}

// After (consistent with proper response structure)
@Get('/documents/:id')
@ApiResponse({ type: DocumentResponseDto })
async getDocument(@Param('id') id: string): Promise<ApiResponse<DocumentResponseDto>> {
  const document = await this.documentService.findOne(id);
  return {
    success: true,
    data: document
  };
}

@Get('/documents')
@ApiResponse({ type: [DocumentResponseDto] })
async getDocuments(): Promise<ApiResponse<DocumentResponseDto[]>> {
  const documents = await this.documentService.findAll();
  return {
    success: true,
    data: documents
  };
}
```
```

### Database Query Issue Template
```
🗄️ **DATABASE QUERY ISSUE**: [Brief description]

**Problem**: [What makes the query problematic]
**Impact**: [Performance degradation, data inconsistency, scalability issues]
**Solution**: [Optimized query approach]

**Example Fix**:
```typescript
// Before (inefficient)
const getDocumentsWithAuthors = async () => {
  const documents = await prisma.document.findMany();
  const result = [];
  
  for (const doc of documents) {
    const author = await prisma.user.findUnique({
      where: { id: doc.authorId }
    });
    result.push({ ...doc, author });
  }
  
  return result;
};

// After (optimized with proper relations)
const getDocumentsWithAuthors = async () => {
  return prisma.document.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};
```
```

### React Component Issue Template
```
⚛️ **REACT COMPONENT ISSUE**: [Brief description]

**Problem**: [What makes the component problematic]
**Impact**: [Performance issues, bugs, maintainability problems]
**Solution**: [Better component design]

**Example Fix**:
```typescript
// Before (problematic)
const DocumentList = ({ documents }: { documents: Document[] }) => {
  const [filteredDocs, setFilteredDocs] = useState([]);
  
  // Runs on every render - performance issue
  const filtered = documents.filter(doc => doc.published);
  
  useEffect(() => {
    setFilteredDocs(filtered);
  }); // Missing dependency array - infinite loop
  
  return (
    <div>
      {filteredDocs.map(doc => (
        <div key={Math.random()}> {/* Bad key - causes re-renders */}
          {doc.title}
        </div>
      ))}
    </div>
  );
};

// After (optimized)
const DocumentList = ({ documents }: { documents: Document[] }) => {
  const filteredDocs = useMemo(
    () => documents.filter(doc => doc.published),
    [documents]
  );
  
  return (
    <div>
      {filteredDocs.map(doc => (
        <div key={doc.id}>
          {doc.title}
        </div>
      ))}
    </div>
  );
};
```
```

### Migration Safety Issue Template
```
🔄 **MIGRATION SAFETY ISSUE**: [Brief description]

**Problem**: [What makes the migration risky]
**Impact**: [Data loss, downtime, rollback difficulties]
**Solution**: [Safer migration approach]

**Example Fix**:
```sql
-- Before (risky - can cause data loss)
ALTER TABLE documents DROP COLUMN old_field;

-- After (safe - with backup strategy)
-- Step 1: Add new column
ALTER TABLE documents ADD COLUMN new_field VARCHAR(255);

-- Step 2: Migrate data
UPDATE documents SET new_field = old_field WHERE old_field IS NOT NULL;

-- Step 3: In a separate migration after verification
-- ALTER TABLE documents DROP COLUMN old_field;
```
```

## Template Usage Guidelines

### When to Use Each Template
- **Security**: Authentication, authorization, input validation, data exposure issues
- **Performance**: Slow queries, memory leaks, inefficient algorithms, blocking operations
- **Bug Risk**: Null pointer exceptions, race conditions, unhandled errors
- **Breaking Change**: API changes, schema changes, interface modifications
- **Type Safety**: Missing types, `any` usage, unsafe casting
- **Error Handling**: Missing try-catch, poor error messages, unhandled promises
- **API Design**: Inconsistent endpoints, poor response structure, missing validation
- **Database Query**: N+1 problems, missing indexes, inefficient joins
- **React Component**: Performance issues, incorrect hooks usage, poor state management
- **Migration Safety**: Risky schema changes, data loss potential, rollback issues

### Feedback Structure Requirements
Each feedback comment must include:
1. **Clear problem identification** with appropriate emoji and severity
2. **Specific impact description** explaining why it matters
3. **Actionable solution** with concrete steps to fix
4. **Code example** showing before/after when applicable
5. **Reference to requirements** when the issue violates project standards

## Common Issue Examples for Quick Reference

### Frontend Issues (Next.js + React)

#### Hydration Mismatch
```typescript
// ❌ Problem: Server/client content mismatch
const WelcomeMessage = () => {
  return <div>Welcome! Today is {new Date().toLocaleDateString()}</div>;
};

// ✅ Solution: Use useEffect for client-only content
const WelcomeMessage = () => {
  const [date, setDate] = useState<string>('');
  
  useEffect(() => {
    setDate(new Date().toLocaleDateString());
  }, []);
  
  return <div>Welcome! {date && `Today is ${date}`}</div>;
};
```

#### Memory Leak in useEffect
```typescript
// ❌ Problem: Event listener not cleaned up
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
}, []);

// ✅ Solution: Proper cleanup
useEffect(() => {
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### Backend Issues (NestJS)

#### Missing Input Validation
```typescript
// ❌ Problem: No validation on user input
@Post()
createDocument(@Body() data: any) {
  return this.documentService.create(data);
}

// ✅ Solution: Proper DTO validation
@Post()
createDocument(@Body() createDocumentDto: CreateDocumentDto) {
  return this.documentService.create(createDocumentDto);
}

// CreateDocumentDto
export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  content?: string;
}
```

#### Circular Dependency
```typescript
// ❌ Problem: Services depend on each other
@Injectable()
export class DocumentService {
  constructor(private userService: UserService) {}
}

@Injectable()
export class UserService {
  constructor(private documentService: DocumentService) {}
}

// ✅ Solution: Extract shared logic or use events
@Injectable()
export class DocumentService {
  constructor(private eventEmitter: EventEmitter2) {}
  
  async createDocument(data: CreateDocumentDto) {
    const document = await this.create(data);
    this.eventEmitter.emit('document.created', document);
    return document;
  }
}

@Injectable()
export class UserService {
  @OnEvent('document.created')
  handleDocumentCreated(document: Document) {
    // Handle the event without circular dependency
  }
}
```

### Database Issues (Prisma)

#### N+1 Query Problem
```typescript
// ❌ Problem: Multiple queries in loop
const documents = await prisma.document.findMany();
for (const doc of documents) {
  doc.comments = await prisma.comment.findMany({
    where: { documentId: doc.id }
  });
}

// ✅ Solution: Use include or select
const documents = await prisma.document.findMany({
  include: {
    comments: true,
    author: {
      select: { id: true, name: true }
    }
  }
});
```

#### Unsafe Migration
```sql
-- ❌ Problem: Dropping column without backup
ALTER TABLE documents DROP COLUMN content;

-- ✅ Solution: Safe migration steps
-- Migration 1: Add new column
ALTER TABLE documents ADD COLUMN content_new TEXT;

-- Migration 2: Copy data
UPDATE documents SET content_new = content WHERE content IS NOT NULL;

-- Migration 3: (After verification) Drop old column
-- ALTER TABLE documents DROP COLUMN content;
-- ALTER TABLE documents RENAME COLUMN content_new TO content;
```

### Security Issues

#### SQL Injection Risk
```typescript
// ❌ Problem: Raw SQL with user input
const getUserDocuments = (userId: string) => {
  return prisma.$queryRaw`SELECT * FROM documents WHERE author_id = ${userId}`;
};

// ✅ Solution: Use Prisma's type-safe queries
const getUserDocuments = (userId: string) => {
  return prisma.document.findMany({
    where: { authorId: userId }
  });
};
```

#### Exposed Sensitive Data
```typescript
// ❌ Problem: Returning sensitive user data
@Get('/users/:id')
async getUser(@Param('id') id: string) {
  return this.userService.findOne(id); // Returns password hash, etc.
}

// ✅ Solution: Use DTOs to control response
@Get('/users/:id')
async getUser(@Param('id') id: string): Promise<UserResponseDto> {
  const user = await this.userService.findOne(id);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
    // Exclude password, internal fields
  };
}
```

## Review Process Guidelines

### 1. Initial Scan
- Check for critical security issues first
- Identify breaking changes and migration risks
- Look for obvious bug patterns and error handling gaps

### 2. Technology-Specific Review
- Apply framework-specific checklists (see separate checklist files)
- Verify adherence to project conventions and patterns
- Check integration points and API contracts

### 3. Code Quality Assessment
- Evaluate maintainability and readability
- Check for proper TypeScript usage and type safety
- Assess test coverage and quality

### 4. Performance and Scalability
- Identify performance bottlenecks and optimization opportunities
- Check for proper resource management
- Evaluate database query efficiency

## Integration with Project Standards

### Biome Configuration Alignment

The project uses Biome for linting and formatting. Reference the `backend/biome.json` configuration when reviewing code style issues:

**Key Configuration Standards**:
- **Indentation**: 2 spaces (configured in `formatter.indentWidth`)
- **Line Width**: 100 characters (configured in `formatter.lineWidth`)
- **Quote Style**: Double quotes (configured in `javascript.formatter.quoteStyle`)
- **Semicolons**: Always required (configured in `javascript.formatter.semicolons`)
- **Trailing Commas**: ES5 style (configured in `javascript.formatter.trailingCommas`)
- **Import Organization**: Enabled via `assist.actions.source.organizeImports`

**Style Issue Detection**:
```typescript
// ❌ Violates Biome config (single quotes, missing semicolon)
import { Document } from './types'
const title = 'My Document'

// ✅ Follows Biome config (double quotes, semicolon, proper spacing)
import { Document } from "./types";
const title = "My Document";
```

**Biome Rules to Enforce**:
- `noNonNullAssertion`: Disabled - non-null assertions are allowed
- `noExplicitAny`: Warning level - flag but don't block for `any` usage
- `recommended`: All recommended rules are enabled
- File includes: `**/*.{js,jsx,ts,tsx,json,jsonc,css,html,vue,prisma}`

**Review Commands to Reference**:
- `npm run check`: Run Biome linter and formatter checks
- `npm run check:fix`: Auto-fix Biome issues
- `npm run lint`: Run linter only
- `npm run format`: Format code only

### Husky Hooks and Pre-commit Standards

The project uses Husky with lint-staged for pre-commit quality checks. Ensure changes comply with automated standards:

**Pre-commit Hook Configuration** (from `backend/.husky/pre-commit`):
```bash
npx lint-staged
```

**Lint-staged Configuration** (from `backend/package.json`):
```json
{
  "lint-staged": {
    "**/*.{js,jsx,ts,tsx}": [
      "npx @biomejs/biome check --fix"
    ],
    "**/*.{json,jsonc}": [
      "npx @biomejs/biome format --write"
    ]
  }
}
```

**Pre-commit Validation Checklist**:
- [ ] All TypeScript/JavaScript files pass Biome linting
- [ ] All JSON files are properly formatted
- [ ] Import statements are organized correctly
- [ ] Code follows project formatting standards
- [ ] No linting errors remain after auto-fix

**Common Pre-commit Failures to Check**:
```typescript
// ❌ Will fail pre-commit (linting errors)
import {Document} from "./types"  // Missing space, wrong quotes
const data:any = getData()        // Missing space around colon

// ✅ Will pass pre-commit
import { Document } from "./types";
const data: any = getData();
```

### Project Convention Validation

Validate code against established project conventions from steering documents:

**Technology Stack Compliance** (Reference: `.kiro/steering/tech.md`):
- **Frontend**: Next.js 15 with React 18, TypeScript, port 3001
- **Backend**: NestJS with Express, TypeScript, port 3000, Swagger/OpenAPI
- **Database**: PostgreSQL 16 with Prisma ORM, port 5433
- **Code Quality**: Biome (not ESLint/Prettier), Husky with lint-staged

**Project Structure Compliance** (Reference: `.kiro/steering/structure.md`):
- **File Naming**: PascalCase for components, camelCase for services, kebab-case for DTOs
- **Module Organization**: Feature-based modules with proper separation of concerns
- **API Structure**: RESTful endpoints with Swagger documentation
- **Database**: PascalCase models, lowercase plural table names

**Product Context Validation** (Reference: `.kiro/steering/product.md`):
- **Core Features**: Document creation/editing, real-time collaboration, user management
- **Target Users**: Content creators, writers, collaborative teams
- **Key Capabilities**: WebSocket real-time updates, document publishing workflow

### Integration with Existing Steering Documents

When reviewing code, reference these steering documents for context:

**Technology Standards** (`.kiro/steering/tech.md`):
- Verify correct framework versions and configurations
- Check port assignments and service communication
- Validate tooling choices (Biome vs alternatives)
- Ensure proper package manager usage (npm)

**Structure Standards** (`.kiro/steering/structure.md`):
- Validate file and directory naming conventions
- Check module organization and separation of concerns
- Verify API endpoint structure and patterns
- Ensure database schema follows naming conventions

**Product Context** (`.kiro/steering/product.md`):
- Ensure features align with product goals
- Validate user experience considerations
- Check that changes support core collaborative features
- Verify real-time functionality requirements

**Steering Document Integration Checklist**:
- [ ] Code follows technology stack specified in tech.md
- [ ] File structure matches conventions in structure.md
- [ ] Features align with product goals in product.md
- [ ] Changes support collaborative document editing use cases
- [ ] Real-time WebSocket functionality is preserved
- [ ] API changes maintain RESTful design principles

### Validation Commands and Scripts

**Backend Validation** (run from `/backend`):
```bash
# Style and linting validation
npm run check              # Full Biome check
npm run lint              # Linting only
npm run format            # Formatting only

# Type checking and compilation
npm run build             # TypeScript compilation
npm run test              # Jest test suite

# Database validation
npm run db:generate       # Prisma client generation
npm run db:migrate        # Database migration check
```

**Project-wide Validation**:
```bash
# Pre-commit simulation
npx lint-staged           # Run pre-commit checks manually

# Docker environment validation
docker-compose up         # Verify all services start correctly
```

### Common Integration Issues to Flag

**Biome Configuration Violations**:
- Code formatted with different tools (Prettier, ESLint)
- Import statements not organized according to Biome rules
- Line length exceeding 100 characters
- Inconsistent quote usage or semicolon placement

**Pre-commit Standard Violations**:
- Commits that bypass pre-commit hooks
- Code that fails lint-staged checks
- Manual formatting that conflicts with automated tools
- Missing or incorrect file extensions in lint-staged patterns

**Project Convention Violations**:
- Using wrong technology versions or alternatives
- File naming that doesn't match established patterns
- Module organization that breaks separation of concerns
- API designs that don't follow RESTful principles

**Steering Document Conflicts**:
- Technology choices that contradict tech.md specifications
- File structures that don't match structure.md conventions
- Features that don't align with product.md goals
- Changes that break collaborative editing capabilities

## Common Anti-Patterns to Flag

### Frontend Anti-Patterns
- Direct DOM manipulation in React components
- Props drilling instead of proper state management
- Missing key props in list rendering
- Synchronous operations blocking the UI thread

### Backend Anti-Patterns
- Business logic in controllers instead of services
- Missing validation decorators on DTOs
- Synchronous file operations without proper error handling
- Exposing internal implementation details in API responses

### Database Anti-Patterns
- Missing indexes on frequently queried columns
- Using SELECT * in production queries
- Missing foreign key constraints
- Performing database operations without transactions

## Maintenance Guidelines

This guide should be updated when:
- New technologies are added to the stack
- Project conventions change
- New security vulnerabilities are discovered
- Performance patterns evolve

Regular review of this guide ensures it remains effective for maintaining code quality and catching critical issues early in the development process.