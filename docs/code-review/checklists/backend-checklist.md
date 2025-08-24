# Backend Code Review Checklist - NestJS

## Critical Issues Detection

### 🔴 Security Vulnerabilities
- [ ] **Input Validation Missing**: Check if DTOs have proper validation decorators (`@IsString`, `@IsEmail`, etc.)
- [ ] **SQL Injection Risk**: Verify Prisma queries use parameterized queries, not string concatenation
- [ ] **Authentication Bypass**: Ensure protected routes have `@UseGuards()` decorator
- [ ] **Sensitive Data Exposure**: Check if passwords/secrets are properly hashed and not logged
- [ ] **CORS Misconfiguration**: Verify CORS settings don't allow overly permissive origins
- [ ] **Rate Limiting Missing**: Check if endpoints lack rate limiting for abuse prevention

### 🔴 NestJS Module Structure Problems
- [ ] **Circular Dependencies**: Look for imports that create circular dependency chains
- [ ] **Missing Module Exports**: Verify services are exported in module if used elsewhere
- [ ] **Incorrect Provider Scope**: Check if singleton services are accidentally scoped as REQUEST
- [ ] **Missing Dependency Injection**: Ensure services use constructor injection, not direct imports
- [ ] **Module Import Issues**: Verify `forRoot()` vs `forFeature()` usage for dynamic modules

### 🔴 API Design & Error Handling
- [ ] **Unhandled Exceptions**: Check if controllers catch and properly format errors
- [ ] **Missing HTTP Status Codes**: Verify appropriate status codes (201 for creation, 404 for not found)
- [ ] **Inconsistent Response Format**: Ensure all endpoints follow same response structure
- [ ] **Missing Request Validation**: Check if request bodies are validated with ValidationPipe
- [ ] **Error Information Leakage**: Verify error messages don't expose internal system details

## NestJS-Specific Patterns

### Controller Issues
```typescript
// ❌ Bad: Missing validation and error handling
@Post()
async create(@Body() data: any) {
  return this.service.create(data);
}

// ✅ Good: Proper validation and error handling
@Post()
@HttpCode(201)
async create(@Body() createDto: CreateDocumentDto): Promise<DocumentResponseDto> {
  try {
    return await this.service.create(createDto);
  } catch (error) {
    throw new BadRequestException('Failed to create document');
  }
}
```

### Service Pattern Issues
```typescript
// ❌ Bad: Direct database access in controller
@Injectable()
export class DocumentController {
  constructor(private prisma: PrismaService) {}
  
  @Get()
  async findAll() {
    return this.prisma.document.findMany();
  }
}

// ✅ Good: Service layer abstraction
@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}
  
  async findAll(): Promise<Document[]> {
    return this.prisma.document.findMany({
      where: { published: true }
    });
  }
}
```

### Dependency Injection Issues
```typescript
// ❌ Bad: Missing @Injectable decorator
export class DocumentService {
  constructor(private prisma: PrismaService) {}
}

// ❌ Bad: Direct service instantiation
export class DocumentController {
  private service = new DocumentService();
}

// ✅ Good: Proper DI setup
@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}
}

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}
}
```

## API Security Checklist

### Authentication & Authorization
- [ ] **Missing Guards**: Check if sensitive endpoints have authentication guards
- [ ] **Role-Based Access**: Verify proper role checking for admin/user-specific actions
- [ ] **JWT Token Validation**: Ensure JWT tokens are properly validated and not expired
- [ ] **Password Security**: Check if passwords are hashed with bcrypt or similar

### Input Validation
- [ ] **DTO Validation**: Verify all DTOs have proper class-validator decorators
- [ ] **File Upload Security**: Check file type validation and size limits
- [ ] **Query Parameter Validation**: Ensure query params are validated and sanitized
- [ ] **Path Parameter Validation**: Verify route parameters are validated (UUIDs, numbers)

## Performance Issues

### Database Queries
- [ ] **N+1 Query Problem**: Check if relations are properly included with `include` or `select`
- [ ] **Missing Pagination**: Verify large datasets use proper pagination
- [ ] **Inefficient Queries**: Look for unnecessary database calls in loops
- [ ] **Missing Indexes**: Check if frequently queried fields have database indexes

### Memory & Resource Management
- [ ] **Memory Leaks**: Check for unclosed connections or event listeners
- [ ] **Large Response Payloads**: Verify responses don't include unnecessary data
- [ ] **Blocking Operations**: Ensure CPU-intensive tasks don't block event loop

## Swagger Documentation Issues

### Missing Documentation
- [ ] **Missing @ApiTags**: Check if controllers have proper API tags
- [ ] **Missing @ApiOperation**: Verify endpoints have operation descriptions
- [ ] **Missing @ApiResponse**: Check if response schemas are documented
- [ ] **Missing @ApiProperty**: Ensure DTO properties have API documentation

### Inconsistent Documentation
- [ ] **Outdated Examples**: Verify example responses match actual API responses
- [ ] **Missing Error Responses**: Check if error cases are documented
- [ ] **Incorrect Types**: Ensure documented types match actual implementation
- [ ] **Missing Required Fields**: Verify required fields are marked in documentation

```typescript
// ❌ Bad: Missing Swagger documentation
@Controller('documents')
export class DocumentController {
  @Post()
  async create(@Body() createDto: CreateDocumentDto) {
    return this.service.create(createDto);
  }
}

// ✅ Good: Complete Swagger documentation
@ApiTags('documents')
@Controller('documents')
export class DocumentController {
  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  @ApiResponse({ status: 201, description: 'Document created successfully', type: DocumentResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createDto: CreateDocumentDto): Promise<DocumentResponseDto> {
    return this.service.create(createDto);
  }
}
```

## Common Anti-Patterns

### Module Organization
- [ ] **God Modules**: Check if modules have too many responsibilities
- [ ] **Tight Coupling**: Verify modules don't directly depend on implementation details
- [ ] **Missing Abstractions**: Look for services that should be behind interfaces

### Error Handling
- [ ] **Silent Failures**: Check if errors are caught but not properly handled
- [ ] **Generic Error Messages**: Verify error messages are specific and helpful
- [ ] **Missing Logging**: Ensure errors are properly logged for debugging

### Testing Considerations
- [ ] **Untestable Code**: Check if services have too many dependencies
- [ ] **Missing Mocks**: Verify external dependencies can be mocked
- [ ] **Side Effects**: Look for functions that have unexpected side effects

## Project Tooling Standards Compliance

### Biome Configuration Adherence
- [ ] **Code Formatting**: Verify code follows Biome formatting rules (2 spaces, 100 char line width)
- [ ] **Import Organization**: Check if imports are organized according to Biome's `organizeImports` setting
- [ ] **Quote Style**: Ensure double quotes are used consistently (`javascript.formatter.quoteStyle: "double"`)
- [ ] **Semicolons**: Verify all statements end with semicolons (`javascript.formatter.semicolons: "always"`)
- [ ] **Trailing Commas**: Check ES5-style trailing commas (`javascript.formatter.trailingCommas: "es5"`)

### Pre-commit Hook Compliance
- [ ] **Lint-staged Compatibility**: Ensure changes pass `npx @biomejs/biome check --fix`
- [ ] **JSON Formatting**: Verify JSON files are formatted with Biome
- [ ] **TypeScript Files**: Check that all `.ts` and `.tsx` files pass Biome linting
- [ ] **Auto-fix Compatibility**: Ensure code issues can be auto-fixed by Biome

### NestJS Project Conventions
- [ ] **File Naming**: Verify files follow camelCase convention (e.g., `document.service.ts`)
- [ ] **DTO Naming**: Check DTOs use kebab-case with descriptive suffix (e.g., `create-document.dto.ts`)
- [ ] **Module Structure**: Ensure feature-based organization with proper separation of concerns
- [ ] **Port Configuration**: Verify backend runs on port 3000 as specified in tech standards

### Package.json Script Usage
- [ ] **Build Process**: Ensure `npm run build` compiles without errors
- [ ] **Linting Commands**: Verify code passes `npm run check` and `npm run lint`
- [ ] **Database Commands**: Check proper usage of `npm run db:generate` and `npm run db:migrate`
- [ ] **Test Commands**: Ensure `npm run test` passes for new/modified code

```typescript
// ❌ Violates project standards
import {Injectable} from '@nestjs/common'  // Missing space, single quotes, no semicolon
import { PrismaService } from '../prisma/prisma.service'  // Wrong relative path style

@injectable()  // Wrong decorator casing
export class documentService {  // Wrong class naming
  constructor(private prisma:PrismaService) {}  // Missing space around colon
}

// ✅ Follows project standards
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}
}
```

### Integration with Steering Documents
- [ ] **Technology Stack**: Verify usage of NestJS with Express, TypeScript, and Swagger/OpenAPI
- [ ] **Database Integration**: Ensure proper Prisma ORM usage with PostgreSQL 16
- [ ] **API Documentation**: Check Swagger documentation follows project conventions
- [ ] **WebSocket Implementation**: Verify WebSocket usage aligns with collaborative editing requirements

## Prisma-Specific Issues

### Query Safety
- [ ] **Raw Queries**: Check if raw SQL queries are properly parameterized
- [ ] **Transaction Usage**: Verify complex operations use database transactions
- [ ] **Connection Management**: Ensure Prisma client is properly configured

### Schema Consistency
- [ ] **Migration Safety**: Check if migrations can be safely rolled back
- [ ] **Data Integrity**: Verify foreign key constraints are properly defined
- [ ] **Index Performance**: Ensure frequently queried fields have appropriate indexes