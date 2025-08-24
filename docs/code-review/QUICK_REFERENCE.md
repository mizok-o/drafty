# Quick Reference Cards for AI Code Review

## Critical Issues Checklist (Must Fix Immediately)

### 🚨 Security Vulnerabilities
- [ ] **SQL Injection**: Raw queries with user input (`$queryRaw` with string interpolation)
- [ ] **XSS**: `dangerouslySetInnerHTML` without sanitization
- [ ] **Auth Bypass**: Missing `@UseGuards()` on protected endpoints
- [ ] **Data Exposure**: API responses returning sensitive fields (passwords, tokens)
- [ ] **Input Validation**: Missing validation decorators on DTOs

### 💥 Breaking Changes
- [ ] **API Structure**: Changed response format without versioning
- [ ] **Database Schema**: Dropped columns or changed types without migration strategy
- [ ] **Dependencies**: Major version updates without compatibility testing

### 🔴 Data Loss Risks
- [ ] **Unsafe Migrations**: DROP operations without backup strategy
- [ ] **Missing Transactions**: Related operations not wrapped in transactions
- [ ] **Race Conditions**: Concurrent updates without optimistic locking

## Major Issues Checklist (Fix Before Merge)

### ⚠️ Performance Problems
- [ ] **N+1 Queries**: Database queries in loops (use `include` instead)
- [ ] **Missing Indexes**: Foreign keys and filtered fields without indexes
- [ ] **React Re-renders**: Inline objects/functions in JSX props
- [ ] **Memory Leaks**: Unclosed connections, missing cleanup in useEffect

### 🔒 Type Safety Issues
- [ ] **Any Usage**: `any` type instead of proper interfaces
- [ ] **Missing Validation**: API endpoints without input validation
- [ ] **Null Safety**: Property access without null checks
- [ ] **Unsafe Casting**: Type assertions without runtime validation

### 🏗️ Architecture Problems
- [ ] **Business Logic in Controllers**: Logic should be in service layer
- [ ] **Circular Dependencies**: Services depending on each other
- [ ] **Improper Module Structure**: Monolithic modules instead of feature-based
- [ ] **Server/Client Boundary**: Database calls in client components

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

## Feedback Templates Quick Reference

### Security Issue Template
```
🚨 **SECURITY ISSUE**: [Brief description]
**Problem**: [What makes this a security risk]
**Impact**: [Potential consequences]
**Solution**: [Specific fix with code example]
```

### Performance Issue Template
```
⚠️ **PERFORMANCE ISSUE**: [Brief description]
**Problem**: [What causes the performance problem]
**Impact**: [Performance degradation details]
**Solution**: [Optimization approach with code example]
```

### Breaking Change Template
```
💥 **BREAKING CHANGE**: [Brief description]
**Problem**: [What makes this change breaking]
**Impact**: [Systems/clients affected]
**Solution**: [Migration strategy or backward compatibility]
```

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

## Quick Commands Reference

### Backend Validation
```bash
npm run check          # Biome linting and formatting
npm run build          # TypeScript compilation
npm run test           # Jest test suite
npm run db:migrate     # Database migrations
```

### Frontend Validation
```bash
npm run build          # Next.js build
npm run type-check     # TypeScript validation
npm run dev            # Development server
```

### Project-wide
```bash
npx lint-staged        # Pre-commit checks
docker-compose up      # Start all services
```

## Emergency Response

### If Critical Security Issue Found
1. **Stop deployment** immediately
2. **Assess impact** - what data/systems affected
3. **Apply fix** using security templates
4. **Test thoroughly** before re-deployment
5. **Document incident** for future prevention

### If Breaking Change Detected
1. **Evaluate necessity** - is change required?
2. **Plan migration** - backward compatibility or versioning
3. **Update documentation** - API changes, migration guides
4. **Coordinate deployment** - staged rollout if needed
5. **Monitor impact** - watch for client failures

### If Performance Issue Found
1. **Measure impact** - response times, resource usage
2. **Prioritize fix** - based on user impact
3. **Apply optimization** - use performance templates
4. **Validate improvement** - benchmark before/after
5. **Monitor production** - ensure fix is effective

## Integration Points

### With Steering Documents
- **tech.md**: Validate technology stack compliance
- **structure.md**: Check file organization and naming
- **product.md**: Ensure features support collaborative editing

### With Project Tooling
- **Biome**: Code formatting and linting standards
- **Husky**: Pre-commit hook compliance
- **Docker**: Service configuration validation
- **Prisma**: Database schema and query patterns

## Maintenance Reminders

### Weekly
- Review any new false positives/negatives
- Update examples with newly discovered patterns
- Check guide effectiveness metrics

### Monthly
- Analyze review feedback trends
- Update templates based on common issues
- Validate against technology updates

### Quarterly
- Comprehensive guide review
- Update for framework version changes
- Benchmark against industry standards

---

**Remember**: This guide focuses on identifying problems and providing actionable solutions. Always prioritize security and data integrity, then performance and maintainability.