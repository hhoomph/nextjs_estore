---
title: Technical Context - Next.js E-commerce Store
version: 1.0
last_updated: 2025-12-28
---

# Technical Context

## Technology Stack

### Core Framework
- **Next.js 16**: Latest version with App Router, Server Components, Server Actions
- **React 19**: Latest React with concurrent features and improved performance
- **TypeScript 5.4+**: Strict type checking for reliability and developer experience

### Database & ORM
- **PostgreSQL**: Robust, scalable relational database
- **Prisma ORM v7**: Modern ORM with type-safe database access
- **Prisma Pg Adapter**: Direct TCP connections for better performance

### Authentication
- **Better Auth**: Comprehensive authentication framework
- **Email/Password**: Traditional authentication
- **Social Login**: Future integration capability (Google, GitHub, etc.)

### UI & Styling
- **Tailwind CSS v4**: Utility-first CSS framework with CSS-first configuration
- **shadcn/ui**: High-quality, accessible component library
- **Radix UI**: Unstyled, accessible component primitives
- **Lucide Icons**: Beautiful, consistent icon set
- **billingsdk**: Modern Billing & Monetization UI Components Library

### State Management
- **Zustand**: Lightweight, scalable state management
- **React Hook Form**: Performant forms with easy validation
- **Zod**: TypeScript-first schema validation

### Internationalization
- **next-intl**: Complete i18n solution for Next.js
- **Persian (fa)**: Primary RTL language support
- **English (en)**: Secondary LTR language support

### Development Tools
- **Bun**: Fast JavaScript runtime and package manager **[See Nextjs.md Development Workflow](./Nextjs.md#development-workflow)**
- **ESLint**: Code linting and style enforcement **[See Nextjs.md Coding Standards](./Nextjs.md#coding-standards)**
- **Prettier**: Code formatting
- **TypeScript**: Type checking **[See Nextjs.md TypeScript Configuration](./Nextjs.md#typescript-configuration)**
- **Vitest**: Fast unit testing **[See Nextjs.md Unit Tests](./Nextjs.md#unit-tests-vitest)**
- **Playwright**: End-to-end testing **[See Nextjs.md E2E Tests](./Nextjs.md#e2e-tests-playwright)**

### Deployment & Hosting
- **Vercel**: Optimized Next.js hosting platform
- **PostgreSQL Cloud**: Managed database service (Prisma Postgres) **[See Nextjs.md Database Integration](./Nextjs.md#database-integration-prisma-7)**

## Development Setup

### Environment Requirements
- **Node.js**: 20.19+ (required for Prisma v7)
- **Bun**: Latest stable version
- **Git**: Version control
- **VS Code**: Recommended IDE with extensions

### Package Management
```bash
# Using Bun for all package operations
bun install          # Install dependencies
bun add <package>    # Add new dependency
bun remove <package> # Remove dependency
bun run <script>     # Run npm scripts
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:test": "tsx scripts/test-database.ts"
  }
}
```

### Database Setup
```bash
# Initialize Prisma with cloud database
npx prisma init --db --output ../app/generated/prisma

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

### Environment Variables
```env
# Database
DATABASE_URL="postgres://..."

# Authentication
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Email (future)
RESEND_API_KEY="your-resend-key"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Project Structure

### App Router Structure
```
app/
├── [locale]/           # Internationalized routes
│   ├── (auth)/        # Route groups
│   ├── admin/         # Admin routes
│   ├── api/           # API routes
│   ├── cart/          # Shopping cart
│   ├── checkout/      # Checkout flow
│   ├── products/      # Product pages
│   └── dashboard/     # User dashboard
├── globals.css        # Global styles
├── layout.tsx         # Root layout
└── page.tsx          # Homepage
```

### Component Architecture
```
components/
├── ui/                # shadcn/ui components
├── layout/           # Layout components
├── forms/            # Form components
├── features/         # Feature-specific components
└── common/           # Shared components
```

### Utility Organization
```
lib/
├── prisma.ts         # Database client
├── auth.ts           # Authentication setup
├── utils.ts          # Utility functions
├── validations/      # Zod schemas
├── hooks/           # Custom React hooks
├── stores/          # Zustand stores
└── constants/       # App constants
```

## Development Patterns

### Server Components (Default)
- Used for data fetching and initial rendering
- No client-side JavaScript unless needed
- Direct database access allowed

### Client Components (Selective)
- Only when interactivity is required
- Marked with 'use client' directive
- Used for forms, animations, user interactions

### Server Actions
- Used for form submissions and mutations
- Co-located with components for better DX
- Automatic request deduplication

### Data Fetching Strategy
- **Server Components**: Direct database queries
- **Client Components**: API routes or Server Actions
- **Real-time**: Future WebSocket/SSE integration

## Performance Optimizations

### Build Optimizations
- **App Router**: Automatic code splitting
- **Server Components**: Reduced bundle size
- **Image Optimization**: Next.js Image component
- **Font Optimization**: Built-in font loading

### Runtime Optimizations
- **Caching**: Next.js cache API
- **Streaming**: Progressive loading
- **Lazy Loading**: Component and route lazy loading
- **Bundle Analysis**: Webpack bundle analyzer

### Database Optimizations
- **Connection Pooling**: Prisma built-in pooling
- **Query Optimization**: Selective field fetching
- **Indexing**: Proper database indexes
- **Caching**: Application-level query caching

## Code Quality Standards

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint Configuration
- Next.js recommended rules
- TypeScript strict rules
- Import sorting and organization
- Accessibility rules

### Testing Strategy
- **Unit Tests**: Component and utility testing with Vitest
- **Integration Tests**: API route testing
- **E2E Tests**: Critical user flows with Playwright
- **Performance Tests**: Lighthouse CI integration

## Security Considerations

### Authentication Security
- **Better Auth**: Industry-standard security practices
- **Password Hashing**: Automatic with Better Auth
- **Session Management**: Secure HTTP-only cookies
- **CSRF Protection**: Built-in CSRF tokens

### Data Protection
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection**: Prevented by Prisma ORM
- **XSS Protection**: React's built-in sanitization
- **Rate Limiting**: API route protection

### Infrastructure Security
- **HTTPS**: Enforced in production
- **Environment Variables**: Sensitive data protection
- **Dependency Updates**: Regular security updates
- **Access Control**: Role-based permissions

## Deployment Strategy

### Development
- Local development with `bun run dev`
- Hot reloading and Fast Refresh
- Database seeding for development

### Staging
- Vercel preview deployments
- Staging database instance
- Automated testing on PRs

### Production
- Vercel production deployment
- Production PostgreSQL database
- CDN for static assets
- Monitoring and error tracking

## Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: Lighthouse integration
- **Bundle Analysis**: Size monitoring
- **Runtime Performance**: Next.js analytics

### Error Tracking
- **Error Boundaries**: React error boundaries
- **Logging**: Structured logging
- **Alerting**: Critical error notifications

### Business Analytics
- **User Behavior**: Event tracking
- **Conversion Funnels**: Purchase flow analytics
- **Performance Metrics**: Sales and engagement KPIs

## Future Technical Roadmap

### Phase 1 (Current)
- Core e-commerce functionality
- Authentication and user management
- Multi-language support
- Admin dashboard basics

### Phase 2 (Next)
- Advanced analytics
- Performance optimizations
- Mobile app development
- Advanced search features

### Phase 3 (Future)
- Multi-vendor marketplace
- Advanced AI features
- Global expansion capabilities
- Advanced integrations