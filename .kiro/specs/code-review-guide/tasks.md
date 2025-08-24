# Implementation Plan

- [x] 1. Create main code review guide document structure
  - Create docs/CODE_REVIEW_GUIDE.md with essential sections for AI reference
  - Implement quick reference section for critical issues detection
  - Add severity classification system for bug risks and security issues
  - _Requirements: 1.1, 4.1_

- [x] 2. Implement frontend-specific issue detection checklist
  - Create docs/checklists/frontend-checklist.md for Next.js and React issues
  - Add React component anti-patterns and performance problems detection
  - Include TypeScript type safety issue identification
  - Add Next.js App Router specific problem patterns
  - _Requirements: 1.2, 2.4_

- [x] 3. Implement backend-specific issue detection checklist
  - Create docs/checklists/backend-checklist.md for NestJS issues
  - Add NestJS module structure problems and dependency injection issues
  - Include API security vulnerabilities and error handling problems
  - Add Swagger documentation inconsistency detection
  - _Requirements: 1.3, 2.2_

- [x] 4. Implement database-specific issue detection checklist
  - Create docs/checklists/database-checklist.md for Prisma issues
  - Add migration safety problems and rollback risk detection
  - Include query performance issues and N+1 problem identification
  - Add data integrity and constraint violation detection
  - _Requirements: 1.4, 2.3_

- [x] 5. Create critical anti-patterns reference
  - Create docs/examples/anti-patterns.md with common critical issues
  - Document security vulnerabilities specific to Drafty stack
  - Add performance bottlenecks and their detection methods
  - Include breaking change patterns and compatibility issues
  - _Requirements: 4.2, 4.4_

- [x] 6. Implement problem-focused feedback templates
  - Create standardized templates for different issue types in main guide
  - Add specific feedback formats for bug risks, security issues, and performance problems
  - Include code fix examples for common issues
  - Implement clear problem-impact-solution structure
  - _Requirements: 3.4, 4.3_

- [x] 7. Create TypeScript interfaces for review criteria
  - Define ReviewCriteria interface for structured issue detection
  - Implement FeedbackTemplate interface for consistent problem reporting
  - Add type definitions for severity levels and issue categories
  - Create examples of how AI should structure feedback
  - _Requirements: 2.1, 3.4_

- [x] 8. Integrate with existing project tooling standards
  - Reference biome.json configuration for style issue detection
  - Align with existing Husky hooks and pre-commit standards
  - Document how to validate against current project conventions
  - Add integration points with existing steering documents
  - _Requirements: 3.1, 3.2_

- [x] 9. Create comprehensive examples and test cases
  - Add real code examples showing common issues in Drafty codebase
  - Create before/after examples for each major issue type
  - Include sample AI review comments for different problem scenarios
  - Test guide effectiveness with actual code review scenarios
  - _Requirements: 4.1, 4.3_

- [x] 10. Finalize documentation structure and validation
  - Ensure all checklists cover critical requirements from requirements.md
  - Validate that examples follow current project conventions
  - Create quick reference cards for immediate AI use
  - Add maintenance guidelines for keeping guide current
  - _Requirements: 1.1, 3.3_