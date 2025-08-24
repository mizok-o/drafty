# Review Interface Types

This directory contains TypeScript interfaces and examples for structuring AI code review feedback in the Drafty project.

## Files

- `review-interfaces.ts` - Core TypeScript interfaces for review criteria and feedback
- `../examples/feedback-examples.ts` - Practical examples of how to use the interfaces

## Core Interfaces

### ReviewCriteria
Defines structured criteria for detecting specific types of issues in code. Each criteria includes:
- **Detection points**: Specific things to look for
- **Problem description**: What the issue is
- **Fix example**: How to resolve it
- **Anti-patterns**: Code patterns to avoid
- **Recommended patterns**: Better alternatives

### FeedbackTemplate
Structures consistent feedback for issues found during review:
- **Problem**: Clear description of what's wrong
- **Impact**: Why this matters and potential consequences
- **Solution**: Specific steps to fix the issue
- **Code example**: Demonstration of correct implementation

### ReviewContext
Provides context about the type of changes being reviewed to enable more targeted feedback.

### ReviewResult
Aggregates all findings from a complete code review with summary statistics.

## Usage Guidelines for AI Assistants

### 1. Issue Detection
When reviewing code, use `ReviewCriteria` to systematically check for:
- **Security vulnerabilities** (severity: critical)
- **Performance issues** (severity: major/minor)
- **Bug risks** (severity: critical/major)
- **Breaking changes** (severity: critical)
- **Type safety issues** (severity: minor/major)

### 2. Feedback Structure
Always structure feedback using `FeedbackTemplate`:

```typescript
const feedback: FeedbackTemplate = {
  type: 'security_issue',
  category: 'security_vulnerability',
  severity: 'critical',
  problem: 'Clear description of the issue',
  impact: 'Why this is problematic',
  solution: 'How to fix it',
  codeExample: '// Example of correct implementation'
};
```

### 3. Severity Guidelines
- **Critical**: Security vulnerabilities, data loss risks, breaking changes
- **Major**: Performance issues, significant bugs, maintainability problems
- **Minor**: Code style, minor type safety issues, documentation

### 4. Technology-Specific Focus

#### Frontend (Next.js/React)
- Component performance and re-rendering
- TypeScript type safety
- Accessibility compliance
- Next.js App Router best practices

#### Backend (NestJS)
- Input validation and security
- Proper error handling
- API design consistency
- Authentication/authorization

#### Database (Prisma)
- Migration safety
- Query performance
- Data integrity
- Schema design

## Example Usage

```typescript
import { ReviewCriteria, FeedbackTemplate } from './review-interfaces';

// Define criteria for detecting issues
const criteria: ReviewCriteria = {
  id: 'react-key-prop',
  category: 'bug_risk',
  severity: 'major',
  technology: 'frontend',
  problemDescription: 'Missing key prop in list rendering',
  detectionPoints: [
    'Array.map() without key prop',
    'Using array index as key',
    'Non-unique keys in lists'
  ],
  fixExample: 'Use unique, stable identifiers as keys'
};

// Structure feedback when issue is found
const feedback: FeedbackTemplate = {
  type: 'bug_risk',
  category: 'bug_risk',
  severity: 'major',
  problem: 'List items rendered without proper key props',
  impact: 'Can cause rendering bugs and poor performance in React',
  solution: 'Add unique key prop to each list item',
  codeExample: `
// Good: Use unique, stable keys
{items.map(item => (
  <ListItem key={item.id} data={item} />
))}
  `
};
```

## Integration with Code Review Guide

These interfaces are designed to work with the main code review guide documents:
- Reference `docs/CODE_REVIEW_GUIDE.md` for comprehensive review criteria
- Use technology-specific checklists in `docs/checklists/`
- Follow patterns from `docs/examples/anti-patterns.md`

The interfaces provide the structure, while the guide documents provide the content and context for effective code reviews.