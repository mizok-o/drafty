/**
 * TypeScript interfaces for AI code review criteria and feedback templates
 * Used to structure issue detection and consistent problem reporting
 */

// Severity levels for issues found during code review
export type IssueSeverity = 'critical' | 'major' | 'minor';

// Technology areas for targeted review criteria
export type TechnologyArea = 'frontend' | 'backend' | 'database' | 'general';

// Issue categories for classification
export type IssueCategory = 
  | 'bug_risk' 
  | 'security_vulnerability' 
  | 'performance_issue' 
  | 'breaking_change'
  | 'maintainability'
  | 'type_safety'
  | 'api_design'
  | 'accessibility';

// Feedback template types for different kinds of issues
export type FeedbackType = 
  | 'critical_issue' 
  | 'bug_risk' 
  | 'security_issue' 
  | 'performance_issue'
  | 'best_practice'
  | 'code_quality';

/**
 * Interface for structured issue detection criteria
 * Provides systematic approach to identifying problems in code
 */
export interface ReviewCriteria {
  /** Unique identifier for the criteria */
  id: string;
  
  /** Category of issue this criteria detects */
  category: IssueCategory;
  
  /** Severity level of issues detected by this criteria */
  severity: IssueSeverity;
  
  /** Technology area this criteria applies to */
  technology: TechnologyArea;
  
  /** Human-readable description of the problem */
  problemDescription: string;
  
  /** List of specific points to check when detecting this issue */
  detectionPoints: string[];
  
  /** Example of how to fix the issue */
  fixExample: string;
  
  /** Optional: Code pattern that indicates this issue */
  antiPattern?: string;
  
  /** Optional: Recommended code pattern to use instead */
  recommendedPattern?: string;
}

/**
 * Interface for consistent problem reporting
 * Structures feedback to be actionable and clear
 */
export interface FeedbackTemplate {
  /** Type of feedback being provided */
  type: FeedbackType;
  
  /** Category of the issue */
  category: IssueCategory;
  
  /** Severity of the issue */
  severity: IssueSeverity;
  
  /** Clear description of what is wrong */
  problem: string;
  
  /** Explanation of why this is a problem and its impact */
  impact: string;
  
  /** Specific steps to fix the issue */
  solution: string;
  
  /** Optional: Example of correct implementation */
  codeExample?: string;
  
  /** Optional: Line numbers or file references where issue occurs */
  location?: {
    file: string;
    lines?: number[];
  };
  
  /** Optional: Links to documentation or resources */
  references?: string[];
}

/**
 * Interface for review context information
 * Provides additional context for more targeted reviews
 */
export interface ReviewContext {
  /** Type of change being reviewed */
  changeType: 'feature' | 'bugfix' | 'refactor' | 'hotfix' | 'documentation';
  
  /** Files being modified in this review */
  modifiedFiles: string[];
  
  /** Technology areas affected by the changes */
  affectedAreas: TechnologyArea[];
  
  /** Whether this is a breaking change */
  isBreakingChange: boolean;
  
  /** Optional: Specific areas to focus review on */
  focusAreas?: IssueCategory[];
}

/**
 * Interface for project tooling standards validation
 * Ensures code adheres to established project conventions
 */
export interface ToolingStandards {
  /** Biome configuration compliance */
  biome: {
    /** Whether code follows Biome formatting rules */
    formattingCompliant: boolean;
    
    /** Whether imports are organized according to Biome settings */
    importsOrganized: boolean;
    
    /** Whether code passes Biome linting checks */
    lintingPassed: boolean;
    
    /** Specific Biome rule violations found */
    violations: BiomeViolation[];
  };
  
  /** Pre-commit hook compliance */
  preCommit: {
    /** Whether changes would pass lint-staged checks */
    lintStagedCompliant: boolean;
    
    /** Whether all file types are properly handled */
    fileTypesSupported: boolean;
    
    /** Any pre-commit hook failures */
    hookFailures: string[];
  };
  
  /** Project structure compliance */
  structure: {
    /** Whether file naming follows conventions */
    fileNamingCorrect: boolean;
    
    /** Whether module organization is proper */
    moduleOrganizationCorrect: boolean;
    
    /** Whether technology stack is correct */
    technologyStackCorrect: boolean;
    
    /** Specific structure violations */
    violations: StructureViolation[];
  };
  
  /** Integration with steering documents */
  steeringCompliance: {
    /** Whether code aligns with tech.md specifications */
    techStandardsCompliant: boolean;
    
    /** Whether structure follows structure.md conventions */
    structureStandardsCompliant: boolean;
    
    /** Whether features align with product.md goals */
    productGoalsAligned: boolean;
    
    /** Specific steering document conflicts */
    conflicts: SteeringConflict[];
  };
}

/**
 * Interface for Biome configuration violations
 */
export interface BiomeViolation {
  /** Type of Biome rule violated */
  rule: string;
  
  /** Severity of the violation */
  severity: 'error' | 'warning';
  
  /** Description of the violation */
  message: string;
  
  /** File and line where violation occurs */
  location: {
    file: string;
    line: number;
    column: number;
  };
  
  /** Whether this violation can be auto-fixed */
  autoFixable: boolean;
}

/**
 * Interface for project structure violations
 */
export interface StructureViolation {
  /** Type of structure violation */
  type: 'file_naming' | 'module_organization' | 'technology_stack' | 'directory_structure';
  
  /** Description of the violation */
  message: string;
  
  /** File or directory that violates standards */
  path: string;
  
  /** Expected pattern or structure */
  expected: string;
  
  /** Actual pattern found */
  actual: string;
}

/**
 * Interface for steering document conflicts
 */
export interface SteeringConflict {
  /** Which steering document is violated */
  document: 'tech.md' | 'structure.md' | 'product.md';
  
  /** Section of the document that's violated */
  section: string;
  
  /** Description of the conflict */
  description: string;
  
  /** Severity of the conflict */
  severity: IssueSeverity;
  
  /** Suggested resolution */
  resolution: string;
}

/**
 * Extended review criteria that includes tooling standards
 */
export interface ExtendedReviewCriteria extends ReviewCriteria {
  /** Tooling standards validation */
  toolingValidation?: {
    /** Whether this criteria requires Biome compliance */
    requiresBiomeCompliance: boolean;
    
    /** Whether this criteria requires pre-commit hook compliance */
    requiresPreCommitCompliance: boolean;
    
    /** Whether this criteria requires structure compliance */
    requiresStructureCompliance: boolean;
    
    /** Whether this criteria requires steering document compliance */
    requiresSteeringCompliance: boolean;
  };
}

/**
 * Complete review result structure with tooling validation
 * Aggregates all findings from a code review including tooling compliance
 */
export interface ReviewResult {
  /** Overall assessment of the code changes */
  summary: {
    totalIssues: number;
    criticalIssues: number;
    majorIssues: number;
    minorIssues: number;
    overallRating: 'approved' | 'needs_changes' | 'rejected';
  };
  
  /** Detailed feedback for each issue found */
  feedback: FeedbackTemplate[];
  
  /** Context information for this review */
  context: ReviewContext;
  
  /** Tooling standards validation results */
  toolingStandards: ToolingStandards;
  
  /** Timestamp of the review */
  reviewedAt: Date;
}

/**
 * Interface for validation commands and scripts
 */
export interface ValidationCommands {
  /** Backend validation commands */
  backend: {
    /** Command to run Biome checks */
    biomeCheck: string;
    
    /** Command to fix Biome issues */
    biomeFix: string;
    
    /** Command to run TypeScript compilation */
    typeCheck: string;
    
    /** Command to run tests */
    test: string;
    
    /** Command to build the application */
    build: string;
  };
  
  /** Frontend validation commands */
  frontend: {
    /** Command to run Next.js build */
    build: string;
    
    /** Command to run type checking */
    typeCheck: string;
    
    /** Command to start development server */
    dev: string;
  };
  
  /** Database validation commands */
  database: {
    /** Command to generate Prisma client */
    generate: string;
    
    /** Command to run migrations */
    migrate: string;
    
    /** Command to open Prisma Studio */
    studio: string;
    
    /** Command to reset database */
    reset: string;
  };
  
  /** Project-wide validation commands */
  project: {
    /** Command to run pre-commit checks manually */
    preCommit: string;
    
    /** Command to start all services with Docker */
    dockerUp: string;
    
    /** Command to stop all services */
    dockerDown: string;
  };
}