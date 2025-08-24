---
inclusion: always
---

# AI Code Review Guidelines

You are conducting code reviews for the Drafty project. Use these guidelines to provide systematic, actionable feedback.

## Critical Issues (🚨 Block Merge Immediately)

### Security Vulnerabilities
- **SQL Injection**: Raw queries with user input (`$queryRaw` with string interpolation)
- **XSS**: `dangerouslySetInnerHTML` without sanitization  
- **Auth Bypass**: Missing `@UseGuards()` on protected endpoints
- **Data Exposure**: API responses returning sensitive fields (passwords, tokens)
- **Input Validation**: Missing validation decorators on DTOs

### Breaking Changes
- **API Structure**: Changed response format without versioning
- **Database Schema**: Dropped columns or changed types without migration strategy
- **Dependencies**: Major version updates without compatibility testing

### Data Loss Risks
- **Unsafe Migrations**: DROP operations without backup strategy
- **Missing Transactions**: Related operations not wrapped in transactions
- **Race Conditions**: Concurrent updates without optimistic locking

## Major Issues (⚠️ Fix Before Merge)

### Performance Problems
- **N+1 Queries**: Database queries in loops (use `include` instead)
- **Missing Indexes**: Foreign keys and filtered fields without indexes
- **React Re-renders**: Inline objects/functions in JSX props
- **Memory Leaks**: Unclosed connections, missing cleanup in useEffect

### Type Safety Issues
- **Any Usage**: `any` type instead of proper interfaces
- **Missing Validation**: API endpoints without input validation
- **Null Safety**: Property access without null checks
- **Unsafe Casting**: Type assertions without runtime validation

### Architecture Problems
- **Business Logic in Controllers**: Logic should be in service layer
- **Circular Dependencies**: Services depending on each other
- **Improper Module Structure**: Monolithic modules instead of feature-based
- **Server/Client Boundary**: Database calls in client components

## Technology-Specific Quick Checks

### Next.js 15 + React 18
```typescript
// ❌ Wrong: Client component with server operations
'use client';
const data = await prisma.document.findMany(); // Error!

// ✅ Right: Server component for data fetching
export default async function Page() {
  const data = await prisma.document.findMany();
  return <ClientComponent data={data} />;
}
```

### NestJS + TypeScript
```typescript
// ❌ Wrong: Missing validation and guards
@Post()
create(@Body() data: any) {
  return this.service.create(data);
}

// ✅ Right: Proper validation and security
@Post()
@UseGuards(AuthGuard)
create(@Body() data: CreateDto) {
  return this.service.create(data);
}
```

### Prisma + PostgreSQL
```typescript
// ❌ Wrong: N+1 query problem
const docs = await prisma.document.findMany();
for (const doc of docs) {
  doc.author = await prisma.user.findUnique({where: {id: doc.userId}});
}

// ✅ Right: Single optimized query
const docs = await prisma.document.findMany({
  include: { user: true }
});
```

## Feedback Templates

### Security Issue Template
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
```
```

## Project Standards Validation

### Biome Configuration Compliance
- **Indentation**: 2 spaces
- **Quotes**: Double quotes
- **Semicolons**: Always required
- **Line Width**: 100 characters
- **Imports**: Organized automatically

### File Naming Conventions
- **Components**: PascalCase (`DocumentEditor.tsx`)
- **Services**: camelCase (`document.service.ts`)
- **DTOs**: kebab-case (`create-document.dto.ts`)
- **Pages**: Next.js conventions (`page.tsx`, `[id]`)

### Port Configuration
- **Frontend**: 3001 (Next.js)
- **Backend**: 3000 (NestJS)
- **Database**: 5433 (PostgreSQL)

## Common Anti-Patterns to Flag

### Frontend (Next.js/React)
- `'use client'` with server-side operations
- Missing key props in lists (`key={Math.random()}`)
- Inline functions in JSX causing re-renders
- Direct DOM manipulation in React components

### Backend (NestJS)
- Business logic in controllers
- Missing error handling in async operations
- Hardcoded values instead of environment variables
- Circular dependency injection

### Database (Prisma)
- Raw SQL with user input
- Missing foreign key constraints
- Queries without proper includes (N+1 problem)
- Migrations without rollback strategy

## Severity Classification

### Critical (🔴 Block Merge)
- Security vulnerabilities
- Data loss risks
- Breaking changes without migration

### Major (🟡 Must Fix)
- Performance issues
- Type safety violations
- Architecture problems

### Minor (🟢 Consider Fixing)
- Code style violations
- Minor optimizations
- Documentation improvements

## Review Process

1. **Scan for Critical Issues First**: Security, breaking changes, data loss risks
2. **Check Technology-Specific Patterns**: Use appropriate checklist for the technology
3. **Validate Project Standards**: Biome compliance, naming conventions, port configs
4. **Provide Structured Feedback**: Use templates with Problem-Impact-Solution format
5. **Include Code Examples**: Show before/after when applicable

## Integration with Project Standards

This guide integrates with:
- **Biome** configuration for code formatting standards
- **Husky** pre-commit hooks for automated checks
- **Steering documents** (tech.md, structure.md, product.md) for project alignment
- **Technology stack** (Next.js 15, NestJS, Prisma, PostgreSQL 16)

Always prioritize security and data integrity, then performance and maintainability. Focus on providing actionable, specific feedback that helps developers improve code quality while maintaining project standards.