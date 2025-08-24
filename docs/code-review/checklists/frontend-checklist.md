# Frontend Code Review Checklist

## Next.js 15 & React 18 Specific Issues

This checklist focuses on identifying critical issues, bugs, and anti-patterns in the Drafty frontend codebase built with Next.js 15, React 18, and TypeScript.

## Critical Issue Detection

### Next.js App Router Issues

#### **Route Structure Problems**
- [ ] **Missing page.tsx files**: Verify all route segments have proper page.tsx files
- [ ] **Incorrect dynamic route syntax**: Check for proper `[param]` or `[...slug]` naming
- [ ] **Layout hierarchy issues**: Ensure layout.tsx files are properly nested and don't conflict
- [ ] **Route group conflicts**: Verify `(group)` folders don't create routing conflicts

#### **Server/Client Component Boundaries**
- [ ] **"use client" misuse**: Check if client directive is used unnecessarily on server components
- [ ] **Server component async issues**: Verify server components properly handle async operations
- [ ] **Hydration mismatches**: Look for differences between server and client rendering
- [ ] **Client component in server context**: Ensure client components aren't imported in server-only contexts

#### **Data Fetching Anti-patterns**
- [ ] **fetch() without error handling**: All fetch calls should have proper error boundaries
- [ ] **Missing revalidation strategies**: Check for appropriate `revalidate` or `cache` options
- [ ] **Client-side data fetching in server components**: Server components should use server-side fetching
- [ ] **Blocking waterfalls**: Identify sequential data fetching that could be parallelized

### React Component Issues

#### **Performance Problems**
- [ ] **Missing React.memo()**: Components that receive stable props should be memoized
- [ ] **Unnecessary re-renders**: Check for objects/functions created in render that cause child re-renders
- [ ] **Large bundle imports**: Identify heavy libraries imported without code splitting
- [ ] **Unoptimized images**: Verify Next.js Image component is used instead of <img>

#### **Component Anti-patterns**
- [ ] **Prop drilling**: Deep prop passing that should use context or state management
- [ ] **Massive components**: Components over 200 lines that should be split
- [ ] **Side effects in render**: useEffect or direct DOM manipulation in component body
- [ ] **Missing key props**: Lists without proper key attributes causing reconciliation issues

#### **State Management Issues**
- [ ] **useState for derived state**: State that can be computed from props or other state
- [ ] **Missing dependency arrays**: useEffect/useMemo/useCallback without proper dependencies
- [ ] **Stale closures**: Functions capturing outdated state values
- [ ] **Unnecessary state updates**: setState calls that don't actually change the value

### TypeScript Type Safety Issues

#### **Type Definition Problems**
- [ ] **any type usage**: Explicit or implicit any types that bypass type checking
- [ ] **Missing interface definitions**: Props or data structures without proper typing
- [ ] **Incorrect generic constraints**: Generic types that don't properly constrain values
- [ ] **Type assertions without validation**: `as` casting without runtime checks

#### **API Integration Issues**
- [ ] **Untyped API responses**: fetch calls without proper response type definitions
- [ ] **Missing error type handling**: API errors not properly typed or handled
- [ ] **Inconsistent data shapes**: Frontend types that don't match backend DTOs
- [ ] **Missing null/undefined checks**: Properties accessed without proper null checking

## Security Vulnerabilities

### **XSS Prevention**
- [ ] **Unescaped user input**: Direct innerHTML or dangerouslySetInnerHTML with user data
- [ ] **Missing input validation**: Form inputs without proper sanitization
- [ ] **Unsafe external links**: Links without `rel="noopener noreferrer"`

### **Data Exposure**
- [ ] **Sensitive data in client**: API keys or secrets exposed in client-side code
- [ ] **Console.log in production**: Debug statements that might leak information
- [ ] **Unprotected routes**: Pages that should require authentication

## Performance Issues

### **Core Web Vitals Impact**
- [ ] **Large DOM size**: Components rendering excessive DOM nodes
- [ ] **Blocking JavaScript**: Heavy computations on main thread
- [ ] **Missing loading states**: No feedback during async operations
- [ ] **Unoptimized fonts**: Missing font-display or preload strategies

### **Bundle Size Issues**
- [ ] **Unused dependencies**: Libraries imported but not used
- [ ] **Missing dynamic imports**: Heavy components not code-split
- [ ] **Duplicate dependencies**: Same functionality imported multiple times

## Code Quality Issues

### **Maintainability Problems**
- [ ] **Hardcoded values**: Magic numbers or strings that should be constants
- [ ] **Missing error boundaries**: No fallback UI for component errors
- [ ] **Inconsistent naming**: Components or functions not following camelCase/PascalCase
- [ ] **Missing accessibility**: No ARIA labels, alt text, or keyboard navigation

### **Testing Gaps**
- [ ] **Untestable components**: Components tightly coupled to external dependencies
- [ ] **Missing test IDs**: No data-testid attributes for testing
- [ ] **Complex component logic**: Business logic that should be extracted to hooks or utils

## Project Tooling Standards Compliance

### Biome Configuration Adherence
- [ ] **Code Formatting**: Verify code follows Biome formatting rules (2 spaces, 100 char line width)
- [ ] **Import Organization**: Check if imports are organized according to Biome's `organizeImports` setting
- [ ] **Quote Style**: Ensure double quotes are used consistently (`javascript.formatter.quoteStyle: "double"`)
- [ ] **Semicolons**: Verify all statements end with semicolons (`javascript.formatter.semicolons: "always"`)
- [ ] **Trailing Commas**: Check ES5-style trailing commas (`javascript.formatter.trailingCommas: "es5"`)
- [ ] **Arrow Parentheses**: Verify arrow functions always use parentheses (`arrowParentheses: "always"`)

### Next.js Project Conventions
- [ ] **File Naming**: Verify components use PascalCase (e.g., `EditDocumentClient.tsx`)
- [ ] **Page Structure**: Check pages follow Next.js App Router conventions (`page.tsx`, `layout.tsx`)
- [ ] **Port Configuration**: Verify frontend runs on port 3001 as specified in tech standards
- [ ] **CSS Organization**: Ensure global styles are in `globals.css` as per project structure

### TypeScript Configuration Compliance
- [ ] **Type Definitions**: Verify proper TypeScript usage without `any` types
- [ ] **Interface Definitions**: Check that all props and data structures are properly typed
- [ ] **Import Paths**: Ensure relative imports follow project conventions
- [ ] **File Extensions**: Verify `.tsx` for components, `.ts` for utilities

```typescript
// ❌ Violates project standards
import React from 'react'  // Single quotes, no semicolon
import {Document} from '../types'  // Missing space, wrong path style

export default function documentEditor(props:any) {  // Wrong naming, any type
    return <div>Content</div>  // Wrong indentation (4 spaces)
}

// ✅ Follows project standards
import React from "react";
import { Document } from "../types";

export default function DocumentEditor(props: DocumentEditorProps) {
  return <div>Content</div>;
}
```

### Integration with Steering Documents
- [ ] **Technology Stack**: Verify usage of Next.js 15 with React 18 and TypeScript
- [ ] **Project Structure**: Ensure files follow structure conventions from `.kiro/steering/structure.md`
- [ ] **Product Alignment**: Check that UI components support collaborative document editing features
- [ ] **API Integration**: Verify proper integration with backend on port 3000

### Pre-commit Hook Compatibility
- [ ] **Lint-staged Compatibility**: Ensure changes would pass automated pre-commit checks
- [ ] **Biome Auto-fix**: Verify code issues can be auto-fixed by Biome
- [ ] **JSON Formatting**: Check that any JSON files are properly formatted
- [ ] **File Extensions**: Ensure all relevant files are covered by lint-staged patterns

### Development Environment Standards
- [ ] **Package Manager**: Verify npm is used consistently (not yarn or pnpm)
- [ ] **Environment Variables**: Check `.env` file usage follows project conventions
- [ ] **Build Process**: Ensure code builds successfully with `npm run build`
- [ ] **Development Server**: Verify `npm run dev` starts correctly on port 3001

## Common Fix Examples

### **Server Component Conversion**
```typescript
// ❌ Unnecessary client component
"use client";
export default function StaticContent() {
  return <div>Static content</div>;
}

// ✅ Server component (default)
export default function StaticContent() {
  return <div>Static content</div>;
}
```

### **Proper Error Handling**
```typescript
// ❌ No error handling
const data = await fetch('/api/documents');
const documents = await data.json();

// ✅ Proper error handling
try {
  const response = await fetch('/api/documents');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const documents = await response.json();
} catch (error) {
  console.error('Failed to fetch documents:', error);
  // Handle error appropriately
}
```

### **TypeScript Type Safety**
```typescript
// ❌ Using any type
const handleSubmit = (data: any) => {
  // Type safety lost
};

// ✅ Proper typing
interface FormData {
  title: string;
  content: string;
}

const handleSubmit = (data: FormData) => {
  // Type safety maintained
};
```

### **Performance Optimization**
```typescript
// ❌ Object created in render
function DocumentList({ documents }) {
  const sortedDocs = documents.sort((a, b) => a.title.localeCompare(b.title));
  return <div>{/* render */}</div>;
}

// ✅ Memoized computation
function DocumentList({ documents }) {
  const sortedDocs = useMemo(
    () => documents.sort((a, b) => a.title.localeCompare(b.title)),
    [documents]
  );
  return <div>{/* render */}</div>;
}
```

## Issue Severity Classification

### **Critical (Must Fix)**
- Security vulnerabilities (XSS, data exposure)
- Breaking changes or runtime errors
- Severe performance issues affecting Core Web Vitals

### **Major (Should Fix)**
- Type safety violations
- Significant performance problems
- Accessibility issues
- Anti-patterns affecting maintainability

### **Minor (Consider Fixing)**
- Code style violations
- Minor performance optimizations
- Consistency improvements