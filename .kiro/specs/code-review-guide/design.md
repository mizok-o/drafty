# Design Document

## Overview

The AI Code Review Guide for Drafty will be a comprehensive reference document that provides structured criteria, checklists, and best practices for AI assistants to conduct thorough code reviews. The guide will be organized by technology layer (Frontend, Backend, Database) and review type (Feature, Bug Fix, Refactoring) to enable contextual and consistent feedback.

## Architecture

### Document Structure
```
docs/
├── CODE_REVIEW_GUIDE.md          # Main guide document
├── checklists/
│   ├── frontend-checklist.md     # Next.js/React specific checks
│   ├── backend-checklist.md      # NestJS specific checks
│   ├── database-checklist.md     # Prisma specific checks
│   └── general-checklist.md      # Cross-cutting concerns
└── examples/
    ├── good-patterns.md           # Approved code patterns
    ├── anti-patterns.md           # Common issues to avoid
    └── review-examples.md         # Sample review feedback
```

### Integration Points
- Reference existing project configurations (biome.json, package.json)
- Align with current project structure and conventions
- Integrate with existing steering documents in .kiro/steering/

## Components and Interfaces

### Main Guide Document (CODE_REVIEW_GUIDE.md)
**Purpose**: Central reference document for AI code reviews focused on identifying issues
**Sections**:
- Critical issues checklist (bugs, security, breaking changes)
- Technology-specific problem detection
- Common anti-patterns and fixes
- Issue severity classification
- Problem-focused feedback templates

### Technology-Specific Checklists

#### Frontend Checklist (frontend-checklist.md)
**Covers**:
- Next.js App Router patterns and best practices
- React component design and performance
- TypeScript usage and type safety
- CSS and styling conventions
- Client-side state management
- Performance optimization (Core Web Vitals)

#### Backend Checklist (backend-checklist.md)
**Covers**:
- NestJS module structure and dependency injection
- Controller and service patterns
- API design and RESTful conventions
- Error handling and validation
- Authentication and authorization
- Swagger/OpenAPI documentation

#### Database Checklist (database-checklist.md)
**Covers**:
- Prisma schema design principles
- Migration safety and rollback strategies
- Query optimization and performance
- Data integrity and constraints
- Indexing strategies
- Security considerations

### Pattern Libraries

#### Good Patterns (good-patterns.md)
**Contains**:
- Approved architectural patterns for Drafty
- Code examples with explanations
- Best practice implementations
- Performance-optimized solutions

#### Anti-Patterns (anti-patterns.md)
**Contains**:
- Critical bugs and security vulnerabilities with fixes
- Performance issues that cause problems
- Breaking changes and compatibility issues
- Code that will cause maintenance problems

## Data Models

### Review Criteria Structure
```typescript
interface ReviewCriteria {
  category: 'bug_risk' | 'security_vulnerability' | 'performance_issue' | 'breaking_change';
  severity: 'critical' | 'major' | 'minor';
  technology: 'frontend' | 'backend' | 'database' | 'general';
  problemDescription: string;
  detectionPoints: string[];  // How to identify this issue
  fixExample: string;         // How to fix it
}
```

### Feedback Template Structure
```typescript
interface FeedbackTemplate {
  type: 'critical_issue' | 'bug_risk' | 'security_issue' | 'performance_issue';
  category: string;
  problem: string;           // What is wrong
  impact: string;            // Why it's a problem
  solution: string;          // How to fix it
  codeExample?: string;      // Example of correct implementation
}
```

## Error Handling

### Missing Context Handling
- Provide fallback general criteria when technology-specific context is unclear
- Include guidance for requesting additional context from developers
- Maintain graceful degradation for partial code reviews

### Inconsistent Standards
- Prioritize project-specific conventions over general best practices
- Include conflict resolution guidance when standards contradict
- Provide escalation paths for ambiguous cases

## Testing Strategy

### Content Validation
- Verify all checklists cover requirements from requirements.md
- Ensure examples are syntactically correct and follow project conventions
- Validate that all referenced configurations exist in the project

### Usability Testing
- Test guide effectiveness with sample code reviews
- Validate that AI can successfully apply criteria to real code changes
- Ensure feedback templates produce clear, actionable suggestions

### Maintenance Testing
- Verify guide stays current with project technology updates
- Test integration with new project conventions
- Validate that examples remain relevant as codebase evolves

## Implementation Approach

### Phase 1: Core Documentation
1. Create main CODE_REVIEW_GUIDE.md with essential sections
2. Develop technology-specific checklists based on current project structure
3. Establish severity classification and feedback templates

### Phase 2: Pattern Libraries
1. Extract good patterns from existing codebase
2. Document common anti-patterns and their solutions
3. Create comprehensive examples with explanations

### Phase 3: Integration and Refinement
1. Test guide with actual code review scenarios
2. Refine criteria based on practical application
3. Optimize for AI assistant consumption and application

### Maintenance Strategy
- Regular updates aligned with project technology changes
- Periodic review of patterns and anti-patterns
- Continuous improvement based on review effectiveness