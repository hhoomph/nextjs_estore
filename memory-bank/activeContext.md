---
title: Active Context - Next.js E-commerce Store
version: 1.0
last_updated: 2025-12-28
---

# Active Context

## Current Work Focus

### Phase 4: Authentication Flow & Security (IN PROGRESS)
The project is currently in Phase 4 of the implementation plan, focusing on fixing authentication flow issues and ensuring security compliance.

**Current Priorities:**
1. **Fix Navbar Route Exclusions**: Ensure navbar doesn't appear on auth and admin routes
2. **Optimize Cart Synchronization**: Eliminate render loops and improve cart performance
3. **Fix Authentication Redirect Loops**: Resolve middleware and session synchronization issues

## Recent Changes & Progress

### Completed Phases
- ✅ **Phase 1**: Project Analysis & Critical Fixes
  - Fixed database import errors in actions
  - Resolved navbar reference issues
  - Fixed React Hook violations
  - Consolidated navbar implementations

- ✅ **Phase 2**: Performance & Render Loop Optimization
  - Optimized session sync hooks
  - Fixed dependency arrays in custom hooks
  - Implemented proper cleanup mechanisms
  - Memoized expensive computations

- ✅ **Phase 3**: Database Integration & Store Management
  - Verified Prisma setup and connections
  - Fixed database import paths
  - Implemented session synchronization
  - Optimized store persistence

### Current Phase Progress
- 🔄 **Phase 4**: Authentication Flow & Security (IN PROGRESS)
  - Working on navbar route exclusions
  - Investigating cart synchronization issues
  - Debugging authentication middleware

## Active Decisions & Considerations

### Technical Decisions Made

#### Authentication Strategy
- **Better Auth**: Chosen for comprehensive auth features and security **[See Nextjs.md Authentication](./Nextjs.md#authentication-better-auth)**
- **Session Management**: HTTP-only cookies for security
- **Middleware Integration**: Using Next.js proxy.ts for auth handling **[See Nextjs.md Middleware Integration](./Nextjs.md#middleware-integration)**
- **Route Protection**: Server-side auth checks in Server Components

#### State Management Architecture
- **Zustand**: Lightweight, scalable store for client state
- **Server State**: Direct database queries in Server Components
- **Persistence**: Local storage for cart, database for user data
- **Synchronization**: Guest-to-user cart merging on login

#### Internationalization Approach
- **next-intl**: Route-based localization with [locale] dynamic segments
- **Primary Languages**: Persian (fa) and English (en)
- **RTL Support**: Proper right-to-left layout for Persian
- **Translation Keys**: Structured JSON files for maintainability

### Current Challenges

#### Navbar Route Exclusion Issues
- **Problem**: Navbar appears on auth/admin routes despite exclusion logic
- **Investigation**: Regex patterns in `EXCLUDED_ROUTES` may not match correctly
- **Solution**: Update route matching logic and add debug logging

#### Cart Synchronization Performance
- **Problem**: Complex hook dependencies causing unnecessary re-renders
- **Investigation**: `useCartSync` hook has over-complicated dependency arrays
- **Solution**: Simplify dependencies and memoize expensive operations

#### Authentication Redirect Loops
- **Problem**: Potential circular redirects in auth middleware
- **Investigation**: Session sync and route protection logic conflicts
- **Solution**: Review and refactor middleware configuration

## Important Patterns & Preferences

### Code Organization
- **Server Components First**: Default to Server Components, use Client only when needed
- **Co-located Logic**: Server Actions next to components that use them
- **Atomic Design**: Components organized by complexity (atoms → molecules → organisms)
- **Feature-based Structure**: Related code grouped by feature/domain

### Performance Patterns
- **Memoization**: `useMemo`, `useCallback` for expensive operations
- **Code Splitting**: Automatic with App Router, manual for heavy components
- **Image Optimization**: Next.js Image component with proper sizing
- **Database Optimization**: Selective field fetching, proper indexing

### Error Handling
- **Error Boundaries**: For UI-level error containment
- **Try-Catch**: In Server Actions and API routes
- **Validation**: Zod schemas for input validation
- **Logging**: Structured error logging with context

## Current Work Patterns

### Development Workflow
1. **Identify Issue**: Review error logs and user reports
2. **Investigate Root Cause**: Use debugging tools and logging
3. **Implement Fix**: Apply minimal, targeted changes
4. **Test Thoroughly**: Verify fix works and doesn't break other features
5. **Document Changes**: Update relevant memory bank files

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API routes and database operations
- **E2E Tests**: Critical user flows with Playwright
- **Performance Tests**: Lighthouse CI for Core Web Vitals

### Code Quality Standards
- **TypeScript Strict**: No implicit any, strict null checks
- **ESLint Compliance**: Zero lint errors
- **Import Organization**: Sorted, clean imports
- **Documentation**: JSDoc for complex functions

## Next Steps & Priorities

### Immediate Tasks (Next 1-2 Days)
1. **Fix Navbar Route Exclusions**
   - Update regex patterns in UnifiedNavbar.tsx
   - Add debug logging for route matching
   - Test exclusion logic thoroughly

2. **Optimize Cart Synchronization**
   - Simplify useCartSync hook dependencies
   - Memoize expensive cart computations
   - Test guest-to-user merging performance

3. **Resolve Auth Redirect Loops**
   - Review middleware configuration
   - Fix session synchronization issues
   - Test complete auth flow

### Short-term Goals (Next Week)
- Complete Phase 4 authentication fixes
- Begin Phase 5 error boundaries implementation
- Add comprehensive testing infrastructure
- Performance optimization and monitoring

### Medium-term Goals (Next Month)
- Complete all implementation phases
- Achieve production readiness
- Implement advanced features (analytics, multi-vendor)
- Performance optimization and scaling

## Open Questions & Decisions Needed

### Technical Questions
- **Auth Middleware Strategy**: Should we use Next.js middleware.ts or proxy.ts approach?
- **Cart Persistence**: Local storage vs. database-only approach for guests?
- **Image Storage**: Local file storage vs. cloud storage (AWS S3, Cloudinary)?
- **Caching Strategy**: Redis implementation for session and data caching?

### Business Questions
- **Payment Integration**: Which payment gateways to prioritize (Stripe, PayPal, local options)?
- **Shipping Integration**: Which shipping providers to support initially?
- **Analytics**: Which analytics platform (Google Analytics, Mixpanel, custom)?
- **SEO Strategy**: Technical SEO vs. content marketing focus?

## Risk Assessment

### High-Risk Items
- **Authentication Flow**: Complex middleware and session management
- **Cart Synchronization**: State management across guest/user transitions
- **Performance**: Bundle size and Core Web Vitals targets
- **Internationalization**: RTL support and Persian localization

### Mitigation Strategies
- **Incremental Testing**: Test each auth flow component individually
- **Error Boundaries**: Comprehensive error handling for user-facing features
- **Performance Monitoring**: Lighthouse CI and performance budgets
- **Accessibility Testing**: Automated accessibility checks

## Success Metrics

### Current Metrics
- **Lint Errors**: Targeting zero
- **Type Errors**: Targeting zero
- **Runtime Errors**: Targeting zero
- **Performance Score**: Targeting > 90 (Lighthouse)
- **Bundle Size**: Targeting < 200KB initial load

### Phase Completion Criteria
- **Phase 4**: Smooth auth flow, no redirect loops, proper route exclusions
- **Phase 5**: Comprehensive error handling, >80% test coverage
- **Phase 6**: Optimized performance, clean codebase, production ready

## Communication & Collaboration

### Team Coordination
- **Daily Standups**: Quick progress updates and blocker identification
- **Code Reviews**: Required for all changes, focus on best practices
- **Documentation**: Update memory bank files with significant changes
- **Testing**: Automated tests for critical paths

### Stakeholder Updates
- **Weekly Progress**: High-level updates on phase completion
- **Demo Sessions**: Functional demos of completed features
- **Risk Communication**: Early identification of potential issues
- **Success Celebration**: Recognition of completed milestones

## Learning & Insights

### Key Learnings So Far
- **Next.js 16 Complexity**: App Router and Server Components require careful state management
- **Authentication Integration**: Better Auth provides comprehensive features but needs careful configuration
- **Performance Optimization**: Server Components significantly reduce bundle size
- **Internationalization**: Route-based i18n adds complexity but provides clean URLs

### Best Practices Identified
- **Server Components First**: Default approach reduces client bundle and improves performance
- **Co-located Actions**: Server Actions next to components improve developer experience
- **Atomic Design**: Component organization by complexity aids maintainability
- **Comprehensive Testing**: Prevents regressions and ensures quality

### Areas for Improvement
- **Error Handling**: More comprehensive error boundaries needed
- **Testing Coverage**: Unit and integration tests crucial for reliability
- **Performance Monitoring**: Continuous monitoring prevents degradation
- **Documentation**: Memory bank system proves valuable for complex projects

## Current Environment

### Development Environment
- **Node.js**: 20.19+ (required for Prisma 7)
- **Bun**: Latest stable for package management
- **VS Code**: Primary IDE with TypeScript and Next.js extensions
- **Git**: Version control with conventional commits

### Testing Environment
- **Vitest**: Unit testing framework
- **Playwright**: E2E testing for critical flows
- **Lighthouse CI**: Performance and accessibility testing

### Deployment Environment
- **Vercel**: Primary hosting platform (optimized for Next.js)
- **PostgreSQL**: Prisma Postgres for database
- **Environment Config**: Separate environments for dev/staging/production

This active context document will be updated with each significant change or decision to maintain accurate project state and guide development decisions.