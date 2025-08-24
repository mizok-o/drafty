# AI Code Review Guide

This directory contains comprehensive documentation for AI-assisted code reviews in the Drafty project.

## Quick Start

For immediate use, start with:
- **[Quick Reference](./QUICK_REFERENCE.md)** - Essential checklists and templates
- **[Main Guide](./CODE_REVIEW_GUIDE.md)** - Complete review methodology

## Documentation Structure

### Core Documentation
- **[CODE_REVIEW_GUIDE.md](./CODE_REVIEW_GUIDE.md)** - Main guide with templates and criteria
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Quick reference cards for immediate AI use
- **[MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md)** - Guidelines for keeping the guide current
- **[VALIDATION_REPORT.md](./VALIDATION_REPORT.md)** - Complete validation and coverage analysis

### Technology-Specific Checklists
- **[Frontend Checklist](./checklists/frontend-checklist.md)** - Next.js 15 + React 18 + TypeScript
- **[Backend Checklist](./checklists/backend-checklist.md)** - NestJS + TypeScript + Swagger
- **[Database Checklist](./checklists/database-checklist.md)** - Prisma + PostgreSQL

### Examples and Patterns
- **[Anti-Patterns](./examples/anti-patterns.md)** - Critical anti-patterns with detection guidelines
- **[Before/After Examples](./examples/before-after-examples.md)** - Code transformation examples
- **[Real Code Examples](./examples/real-code-examples.md)** - Actual Drafty codebase examples
- **[AI Review Scenarios](./examples/ai-review-scenarios.md)** - Test scenarios for validation
- **[Feedback Examples](./examples/feedback-examples.ts)** - Structured feedback templates
- **[Test Suite](./examples/guide-test-suite.md)** - Comprehensive testing framework

### Type Definitions
- **[Review Interfaces](./types/review-interfaces.ts)** - TypeScript interfaces for structured reviews

## Usage

### For AI Assistants
1. Start with the **Quick Reference** for immediate issue detection
2. Use **Technology-Specific Checklists** for detailed reviews
3. Apply **Feedback Templates** from the main guide for consistent responses
4. Reference **Examples** for context and validation

### For Developers
1. Review the **Main Guide** to understand the review methodology
2. Check **Examples** to see common issues and fixes
3. Use **Validation Report** to understand coverage and compliance

### For Maintainers
1. Follow the **Maintenance Guide** for regular updates
2. Use the **Test Suite** to validate guide effectiveness
3. Reference **Type Definitions** for structured improvements

## Integration

This guide integrates with:
- **Biome** configuration for code formatting standards
- **Husky** pre-commit hooks for automated checks
- **Steering documents** (tech.md, structure.md, product.md) for project alignment
- **Technology stack** (Next.js 15, NestJS, Prisma, PostgreSQL 16)

## Requirements Coverage

The guide provides 100% coverage of all requirements:
- ✅ Structured review criteria and checklists
- ✅ Technology-specific guidelines for Drafty stack
- ✅ Project tooling and standards integration
- ✅ Common patterns and anti-patterns documentation

## Maintenance

The guide is maintained on a regular schedule:
- **Daily**: Automated testing and issue tracking
- **Weekly**: Pattern analysis and template updates
- **Monthly**: Comprehensive content review
- **Quarterly**: Strategic review and technology alignment

For maintenance procedures, see [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md).