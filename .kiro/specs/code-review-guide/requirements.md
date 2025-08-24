# Requirements Document

## Introduction

This feature involves creating a comprehensive code review guide and checklist for the Drafty repository that AI assistants can reference when conducting code reviews. The documentation will provide structured quality checks, technology-specific best practices, and clear criteria for evaluating code changes across the frontend (Next.js), backend (NestJS), and database (Prisma) layers.

## Requirements

### Requirement 1

**User Story:** As an AI assistant conducting code reviews, I want structured review criteria and checklists, so that I can systematically evaluate code quality, functionality, and adherence to project standards.

#### Acceptance Criteria

1. WHEN reviewing any code changes THEN the system SHALL provide a comprehensive checklist covering functionality, security, performance, and maintainability
2. WHEN reviewing frontend changes THEN the system SHALL include Next.js and React-specific criteria for component structure, state management, and performance optimization
3. WHEN reviewing backend changes THEN the system SHALL include NestJS-specific criteria for module structure, service patterns, and API design
4. WHEN reviewing database changes THEN the system SHALL include Prisma-specific criteria for schema design, migration safety, and query optimization

### Requirement 2

**User Story:** As an AI assistant, I want technology-specific review guidelines for the Drafty stack, so that I can provide accurate feedback on framework best practices and identify common anti-patterns.

#### Acceptance Criteria

1. WHEN reviewing TypeScript code THEN the system SHALL provide type safety criteria, proper typing patterns, and best practices validation
2. WHEN reviewing API endpoints THEN the system SHALL include checks for proper error handling, input validation, response structure, and Swagger documentation
3. WHEN reviewing database schema changes THEN the system SHALL include migration safety checks, rollback considerations, and data integrity validation
4. WHEN reviewing React components THEN the system SHALL include performance optimization, accessibility, and component design pattern criteria

### Requirement 3

**User Story:** As an AI assistant, I want to understand the project's tooling and standards, so that I can validate code against existing configurations and provide consistent feedback.

#### Acceptance Criteria

1. WHEN reviewing code formatting THEN the system SHALL reference Biome configuration standards for consistent style validation
2. WHEN evaluating code quality THEN the system SHALL consider existing Husky hooks and pre-commit standards
3. WHEN assessing breaking changes THEN the system SHALL provide guidance on impact assessment, versioning, and rollback considerations
4. WHEN identifying issues THEN the system SHALL provide specific, actionable feedback with examples and fix suggestions

### Requirement 4

**User Story:** As an AI assistant, I want access to common patterns and anti-patterns specific to the Drafty codebase, so that I can provide contextually relevant feedback and maintain consistency across reviews.

#### Acceptance Criteria

1. WHEN reviewing code patterns THEN the system SHALL provide quick reference sections for approved patterns and common anti-patterns
2. WHEN evaluating bug fixes THEN the system SHALL include guidance on root cause analysis and prevention strategies
3. WHEN reviewing refactoring changes THEN the system SHALL provide checks for maintaining functionality while improving code structure
4. WHEN assessing new features THEN the system SHALL include security, performance, and architectural consistency considerations