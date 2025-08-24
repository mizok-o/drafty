/**
 * Examples of how AI should structure feedback using the review interfaces
 * These examples demonstrate proper usage of ReviewCriteria and FeedbackTemplate
 */

import type { 
  ReviewCriteria, 
  FeedbackTemplate, 
  ReviewContext, 
  ReviewResult 
} from '../types/review-interfaces';

// Example ReviewCriteria for different types of issues

export const reactPerformanceCriteria: ReviewCriteria = {
  id: 'react-unnecessary-rerenders',
  category: 'performance_issue',
  severity: 'major',
  technology: 'frontend',
  problemDescription: 'React component causing unnecessary re-renders due to inline object/function creation',
  detectionPoints: [
    'Inline object creation in JSX props (e.g., style={{}} or onClick={() => {}})',
    'New object/array creation in render method without useMemo/useCallback',
    'Missing dependency arrays in useEffect/useMemo/useCallback',
    'Props drilling causing parent re-renders to cascade'
  ],
  fixExample: `
// Bad: Creates new object on every render
<Component style={{margin: 10}} onClick={() => handleClick()} />

// Good: Use useMemo and useCallback
const style = useMemo(() => ({margin: 10}), []);
const handleClickCallback = useCallback(() => handleClick(), []);
<Component style={style} onClick={handleClickCallback} />
  `,
  antiPattern: 'style={{}} onClick={() => {}}',
  recommendedPattern: 'useMemo(() => ({}), []) useCallback(() => {}, [])'
};

export const nestjsSecurityCriteria: ReviewCriteria = {
  id: 'nestjs-missing-validation',
  category: 'security_vulnerability',
  severity: 'critical',
  technology: 'backend',
  problemDescription: 'API endpoint missing input validation and sanitization',
  detectionPoints: [
    'Controller methods without @Body(), @Param(), or @Query() validation decorators',
    'DTO classes without class-validator decorators',
    'Raw database queries with user input without parameterization',
    'Missing authentication guards on sensitive endpoints'
  ],
  fixExample: `
// Bad: No validation
@Post()
createUser(@Body() userData: any) {
  return this.userService.create(userData);
}

// Good: Proper validation
@Post()
@UseGuards(AuthGuard)
createUser(@Body() userData: CreateUserDto) {
  return this.userService.create(userData);
}
  `,
  antiPattern: '@Body() userData: any',
  recommendedPattern: '@Body() userData: CreateUserDto with validation decorators'
};

export const prismaMigrationCriteria: ReviewCriteria = {
  id: 'prisma-unsafe-migration',
  category: 'bug_risk',
  severity: 'critical',
  technology: 'database',
  problemDescription: 'Database migration that could cause data loss or downtime',
  detectionPoints: [
    'Dropping columns without backup strategy',
    'Changing column types that could truncate data',
    'Adding non-nullable columns without default values to existing tables',
    'Renaming tables or columns without proper migration path'
  ],
  fixExample: `
// Bad: Dropping column directly
- model User {
-   oldField String
    name     String
  }

// Good: Deprecate first, then remove in separate migration
model User {
  oldField String? // Make optional first
  name     String
}
  `,
  antiPattern: 'Immediate column drops or type changes',
  recommendedPattern: 'Multi-step migrations with backwards compatibility'
};

// Example FeedbackTemplate instances

export const securityVulnerabilityFeedback: FeedbackTemplate = {
  type: 'security_issue',
  category: 'security_vulnerability',
  severity: 'critical',
  problem: 'API endpoint accepts unvalidated user input that could lead to injection attacks',
  impact: 'This creates a critical security vulnerability where malicious users could inject harmful data, potentially leading to data breaches, unauthorized access, or system compromise.',
  solution: 'Add proper input validation using class-validator decorators on your DTO classes and ensure all controller parameters use typed DTOs instead of "any" type.',
  codeExample: `
// Add validation to your DTO:
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// Use the DTO in your controller:
@Post()
@UseGuards(AuthGuard)
createUser(@Body() userData: CreateUserDto) {
  return this.userService.create(userData);
}
  `,
  location: {
    file: 'src/user/user.controller.ts',
    lines: [15, 18]
  },
  references: [
    'https://docs.nestjs.com/techniques/validation',
    'https://github.com/typestack/class-validator'
  ]
};

export const performanceIssueFeedback: FeedbackTemplate = {
  type: 'performance_issue',
  category: 'performance_issue',
  severity: 'major',
  problem: 'React component creates new objects/functions on every render causing unnecessary re-renders',
  impact: 'This causes performance degradation as child components re-render unnecessarily, leading to poor user experience especially on slower devices or with complex component trees.',
  solution: 'Use useMemo for objects and useCallback for functions to maintain referential equality between renders.',
  codeExample: `
// Wrap object creation in useMemo:
const buttonStyle = useMemo(() => ({
  backgroundColor: isActive ? 'blue' : 'gray',
  padding: '10px'
}), [isActive]);

// Wrap function creation in useCallback:
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);

return <Button style={buttonStyle} onClick={() => handleClick(item.id)} />;
  `,
  location: {
    file: 'src/components/ItemList.tsx',
    lines: [25, 30]
  }
};

// Example ReviewContext

export const featureReviewContext: ReviewContext = {
  changeType: 'feature',
  modifiedFiles: [
    'src/document/document.controller.ts',
    'src/document/dto/create-document.dto.ts',
    'frontend/src/app/documents/create/page.tsx'
  ],
  affectedAreas: ['backend', 'frontend'],
  isBreakingChange: false,
  focusAreas: ['security_vulnerability', 'api_design', 'type_safety']
};

// Example complete ReviewResult

export const exampleReviewResult: ReviewResult = {
  summary: {
    totalIssues: 3,
    criticalIssues: 1,
    majorIssues: 1,
    minorIssues: 1,
    overallRating: 'needs_changes'
  },
  feedback: [
    securityVulnerabilityFeedback,
    performanceIssueFeedback,
    {
      type: 'best_practice',
      category: 'type_safety',
      severity: 'minor',
      problem: 'Using "any" type instead of proper TypeScript interfaces',
      impact: 'Reduces type safety and makes code harder to maintain and debug.',
      solution: 'Define proper interfaces for your data structures.',
      codeExample: `
// Instead of:
const userData: any = { name: 'John', email: 'john@example.com' };

// Use:
interface User {
  name: string;
  email: string;
}
const userData: User = { name: 'John', email: 'john@example.com' };
      `
    }
  ],
  context: featureReviewContext,
  reviewedAt: new Date('2024-01-15T10:30:00Z')
};

// Helper function for AI to structure feedback consistently
export function createFeedback(
  type: FeedbackTemplate['type'],
  category: FeedbackTemplate['category'],
  severity: FeedbackTemplate['severity'],
  problem: string,
  impact: string,
  solution: string,
  codeExample?: string,
  location?: FeedbackTemplate['location']
): FeedbackTemplate {
  return {
    type,
    category,
    severity,
    problem,
    impact,
    solution,
    codeExample,
    location
  };
}