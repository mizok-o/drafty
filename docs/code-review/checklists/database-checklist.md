# Database Code Review Checklist - Prisma

## Critical Issues Detection

### Migration Safety Problems
- [ ] **Breaking Schema Changes**: Check for column drops, type changes, or constraint additions without proper migration strategy
- [ ] **Data Loss Risk**: Verify migrations don't cause data loss (dropping columns with data, changing non-nullable fields)
- [ ] **Rollback Safety**: Ensure migrations can be safely rolled back without breaking existing data
- [ ] **Migration Dependencies**: Check for proper migration ordering and dependency management
- [ ] **Production Impact**: Verify migrations won't cause downtime or lock tables for extended periods

### Query Performance Issues
- [ ] **N+1 Query Problems**: Look for missing `include` or `select` statements that cause multiple database calls
- [ ] **Missing Indexes**: Check if queries on non-indexed fields could cause performance issues
- [ ] **Inefficient Queries**: Identify queries that fetch unnecessary data or use inefficient patterns
- [ ] **Batch Operations**: Verify bulk operations use `createMany`, `updateMany`, or transactions instead of loops
- [ ] **Query Complexity**: Check for overly complex queries that should be optimized or split

### Data Integrity and Constraints
- [ ] **Foreign Key Violations**: Ensure proper relationship handling and cascade behaviors
- [ ] **Unique Constraint Issues**: Verify unique constraints are properly handled in application logic
- [ ] **Required Field Validation**: Check that required fields are validated before database operations
- [ ] **Data Type Mismatches**: Ensure data types match schema definitions and business requirements
- [ ] **Constraint Violations**: Look for operations that might violate database constraints

## Prisma-Specific Best Practices

### Schema Design
- [ ] **Model Relationships**: Verify relationships are properly defined with correct cardinality
- [ ] **Field Types**: Check that field types are appropriate for the data being stored
- [ ] **Default Values**: Ensure default values are sensible and won't cause issues
- [ ] **Enum Usage**: Verify enums are used appropriately and values are properly handled
- [ ] **Index Strategy**: Check that indexes are defined for frequently queried fields

### Query Patterns
- [ ] **Proper Includes**: Verify related data is fetched efficiently using `include` or `select`
- [ ] **Transaction Usage**: Check that related operations are wrapped in transactions when needed
- [ ] **Error Handling**: Ensure Prisma errors are properly caught and handled
- [ ] **Type Safety**: Verify TypeScript types are properly used with Prisma client
- [ ] **Connection Management**: Check that database connections are properly managed

## Common Anti-Patterns to Avoid

### Performance Anti-Patterns
```typescript
// ❌ N+1 Query Problem
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({ where: { userId: user.id } });
}

// ✅ Proper Include Usage
const users = await prisma.user.findMany({
  include: { posts: true }
});
```

### Migration Anti-Patterns
```prisma
// ❌ Dangerous Migration - Data Loss Risk
model User {
  id    Int    @id @default(autoincrement())
  // email String @unique // Removing this field loses data
  name  String
}

// ✅ Safe Migration - Rename Instead
model User {
  id       Int    @id @default(autoincrement())
  email    String @unique @map("user_email") // Rename, don't drop
  name     String
}
```

### Data Integrity Anti-Patterns
```typescript
// ❌ Missing Transaction for Related Operations
await prisma.user.create({ data: userData });
await prisma.profile.create({ data: profileData }); // Could fail, leaving orphaned user

// ✅ Proper Transaction Usage
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.profile.create({ data: { ...profileData, userId: user.id } });
});
```

## Security Considerations

### SQL Injection Prevention
- [ ] **Parameterized Queries**: Verify all user input is properly parameterized (Prisma handles this automatically)
- [ ] **Raw Query Safety**: Check that any raw SQL queries properly escape user input
- [ ] **Input Validation**: Ensure user input is validated before database operations

### Access Control
- [ ] **Row Level Security**: Verify proper filtering based on user permissions
- [ ] **Sensitive Data**: Check that sensitive fields are not accidentally exposed
- [ ] **Audit Trails**: Ensure important operations are properly logged

## Performance Optimization

### Query Optimization
- [ ] **Select Only Needed Fields**: Use `select` to fetch only required data
- [ ] **Pagination**: Implement proper pagination for large datasets using `skip` and `take`
- [ ] **Caching Strategy**: Consider caching for frequently accessed, rarely changed data
- [ ] **Connection Pooling**: Verify proper connection pool configuration

### Database Design
- [ ] **Normalization**: Check that data is properly normalized to avoid redundancy
- [ ] **Denormalization**: Consider strategic denormalization for performance-critical queries
- [ ] **Archival Strategy**: Plan for data archival and cleanup of old records

## Testing and Validation

### Test Coverage
- [ ] **Migration Tests**: Verify migrations work correctly in test environment
- [ ] **Query Tests**: Test complex queries with realistic data volumes
- [ ] **Constraint Tests**: Test that database constraints are properly enforced
- [ ] **Error Scenarios**: Test error handling for database failures and constraint violations

### Data Validation
- [ ] **Schema Validation**: Ensure schema changes are backward compatible when possible
- [ ] **Data Migration**: Test data migrations with production-like datasets
- [ ] **Performance Testing**: Verify query performance with realistic data volumes

## Prisma-Specific Gotchas

### Common Issues
- [ ] **Client Generation**: Ensure `prisma generate` is run after schema changes
- [ ] **Environment Variables**: Verify DATABASE_URL is properly configured for each environment
- [ ] **Migration State**: Check that migration state is consistent across environments
- [ ] **Type Imports**: Ensure Prisma types are imported from the correct generated location
- [ ] **Decimal Handling**: Be aware of Decimal type handling and precision requirements

### Best Practices
- [ ] **Schema Comments**: Add comments to complex fields and relationships
- [ ] **Migration Naming**: Use descriptive names for migrations
- [ ] **Seed Data**: Maintain proper seed data for development and testing
- [ ] **Backup Strategy**: Ensure proper backup and recovery procedures are in place

## Project Tooling Standards Compliance

### Biome Configuration for Prisma Files
- [ ] **Schema Formatting**: Verify `.prisma` files are included in Biome's file patterns
- [ ] **Consistent Indentation**: Check that schema files use 2-space indentation consistently
- [ ] **Line Length**: Ensure schema definitions don't exceed 100 characters per line
- [ ] **Comment Style**: Verify comments follow consistent formatting standards

### Database Configuration Standards
- [ ] **Port Configuration**: Verify PostgreSQL runs on port 5433 as specified in tech standards
- [ ] **Connection String**: Check DATABASE_URL follows project conventions
- [ ] **Environment Variables**: Ensure proper `.env` file usage for database configuration
- [ ] **Docker Integration**: Verify database works correctly with `docker-compose.yaml`

### Prisma Project Conventions
- [ ] **Schema Location**: Verify `schema.prisma` is in the correct location (`backend/prisma/`)
- [ ] **Generated Client**: Check that generated client is in expected location
- [ ] **Migration Directory**: Ensure migrations are in `backend/prisma/migrations/`
- [ ] **Naming Conventions**: Verify models use PascalCase, tables use lowercase plural

### Package.json Script Integration
- [ ] **Database Commands**: Verify proper usage of `npm run db:generate`, `db:migrate`, etc.
- [ ] **Migration Scripts**: Check that migration commands work correctly
- [ ] **Studio Access**: Ensure `npm run db:studio` provides proper database access
- [ ] **Reset Functionality**: Verify `npm run db:reset` works for development

```prisma
// ❌ Violates project standards
model document {  // Should be PascalCase
    id Int @id @default(autoincrement())
    title string  // Wrong type casing
    content String?
    authorId Int
    author user @relation(fields: [authorId], references: [id])  // Wrong model reference
}

// ✅ Follows project standards
model Document {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("documents")  // Lowercase plural table name
}
```

### Integration with Steering Documents
- [ ] **Technology Stack**: Verify usage of PostgreSQL 16 with Prisma ORM as specified
- [ ] **Project Structure**: Ensure database files follow structure conventions
- [ ] **Product Requirements**: Check that schema supports collaborative document editing features
- [ ] **API Integration**: Verify database schema aligns with NestJS backend requirements

### Development Environment Standards
- [ ] **Docker Compose**: Verify database service is properly configured in `docker-compose.yaml`
- [ ] **Environment Files**: Check that `.env` files contain proper database configuration
- [ ] **Migration Workflow**: Ensure migration process follows project conventions
- [ ] **Seed Data**: Verify seed scripts support development and testing workflows

### Common Tooling Integration Issues
- [ ] **Generated Client Location**: Check that Prisma client is generated in expected location
- [ ] **Import Paths**: Verify imports use correct paths to generated Prisma client
- [ ] **Type Definitions**: Ensure TypeScript types are properly imported from Prisma
- [ ] **Build Process**: Check that database operations work correctly in build pipeline

### Pre-commit Hook Compatibility
- [ ] **Schema Formatting**: Ensure `.prisma` files pass Biome formatting checks
- [ ] **Migration Files**: Verify migration files are properly formatted
- [ ] **Generated Code**: Check that generated Prisma code doesn't interfere with linting
- [ ] **File Extensions**: Ensure all database-related files are covered by appropriate tooling