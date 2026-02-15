# Next.js E-Commerce Platform

A modern, full-featured e-commerce platform built with Next.js 16, featuring advanced authentication, internationalization, comprehensive testing, and production-ready optimizations.

## 🚀 Features

- **Multi-vendor E-commerce**: Complete product catalog with categories, search, and filtering
- **Advanced Cart System**: Guest cart with sync-to-user functionality, persistent storage
- **Secure Authentication**: Better Auth integration with social providers (Google, GitHub, etc.)
- **Internationalization**: Full i18n support with Next-intl (English/Farsi) and RTL support
- **Admin Dashboard**: Comprehensive admin panel for product and order management
- **Enhanced UI/UX**: Advanced icons, typography, interactive cards, modals, and theme system
- **Performance Monitoring**: Core Web Vitals tracking, bundle optimization, and memory monitoring
- **Testing Suite**: 436+ tests with 77% coverage across unit, integration, and E2E
- **Type Safety**: Full TypeScript with Zod validation and React Hook Form
- **Production Ready**: Error boundaries, security, SEO optimization, and deployment automation

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1.1** - React framework with App Router
- **React 19.2.3** - UI library with Server Components
- **TypeScript 5.9.3** - Type-safe JavaScript
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **shadcn/ui 3.6.2** - Accessible component library
- **Framer Motion 12.23.26** - Animation library

### Backend & Database
- **Prisma ORM 7.2.0** - Database toolkit with PostgreSQL
- **Better Auth 1.4.9** - Authentication framework
- **Next-intl 4.6.1** - Internationalization
- **Zustand 5.0.9** - State management

### Testing & Quality
- **Vitest 4.0.16** - Fast unit testing framework
- **Playwright 1.57.0** - E2E testing across browsers
- **Lighthouse 13.0.1** - Performance auditing
- **ESLint 9.39.2** - Code linting

### Development Tools
- **Turbo 2.7.2** - Build system and task runner
- **Husky** - Git hooks for quality gates
- **Bundle Analyzer** - Bundle size optimization

## 📦 Installation

### Prerequisites
- **Node.js 20.19+** (required for Prisma 7)
- **TypeScript 5.4.0+**
- **PostgreSQL database**
- **Git**

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nextjs-estore.git
   cd nextjs-estore
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Configure the following variables:
   ```env
   # Database
   DATABASE_URL="postgres://username:password@localhost:5432/estore"

   # Better Auth
   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"

   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"

   # Email (optional)
   RESEND_API_KEY="your-resend-api-key"
   ```

4. **Set up the database**
   ```bash
   # Push schema to database
   npx prisma db push

   # Generate Prisma client
   npx prisma generate

   # Seed the database (optional)
   npm run db:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Admin Panel: http://localhost:3000/admin

## 🧪 Testing

### Run All Tests
```bash
npm run test:all
```

### Individual Test Suites
```bash
# Unit & Component Tests
npm run test:component

# API Route Tests
npm run test:api

# Integration Tests
npm run test:e2e

# Performance Tests
npm run test:performance
npm run test:core-web-vitals

# Translation Testing
npm run test:translations
```

### Test Coverage & Strategy
- **Total Coverage**: 436+ tests passing (77%)
- **Component Tests**: 11/13 suites passing (85%) - Vitest with React Testing Library
- **API Tests**: Complete route coverage with authentication mocking
- **Integration Tests**: Full user journey testing (auth → cart → order)
- **Translation Tests**: Comprehensive i18n validation with 72 test cases covering all critical keys
- **Performance Tests**: Bundle analysis, Core Web Vitals, and load testing

#### Testing Frameworks
- **Vitest**: Fast unit testing with comprehensive mocking
- **Playwright**: E2E testing across browsers with accessibility checks
- **Lighthouse**: Automated performance and quality auditing
- **Radix UI Mocking**: Full accessibility component compatibility

#### Testing Approach
- **Component Testing**: User-centric patterns with Radix UI compatibility
- **API Testing**: Route coverage with authentication and database mocking
- **Integration Testing**: Complete user flows and admin operations
- **Translation Testing**: Automated validation of all translation keys in both English and Persian locales
- **Coverage Goals**: 85%+ component coverage with comprehensive error scenarios

## 🔧 Development Scripts

### Core Commands
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # TypeScript type checking
```

### Database Commands
```bash
npm run db:test      # Test database connection
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
```

### Testing Commands
```bash
npm run test:all         # Run all test suites
npm run test:unit        # Unit tests only
npm run test:e2e         # E2E tests with Playwright
npm run test:translations # Translation key validation
npm run lighthouse       # Performance audit
```

### Optimization Commands
```bash
npm run analyze:bundle        # Bundle size analysis
npm run optimize:bundle       # Bundle optimization
npm run perf:test            # Performance testing
npm run load:test            # Load testing
```

## 📁 Project Structure

```
nextjs-estore/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── (features)/        # Feature-specific routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── features/         # Feature components
│   ├── layout/           # Layout components
│   └── errors/           # Error boundaries
├── lib/                  # Utility libraries
│   ├── stores/           # Zustand stores
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── validations/      # Zod schemas
│   └── auth.ts           # Authentication setup
├── types/                # TypeScript type definitions
├── messages/             # Internationalization files
├── prisma/               # Database schema and migrations
├── tests/                # Test files and configurations
├── scripts/              # Build and utility scripts
└── public/               # Static assets
```



## 🚀 Performance Optimizations

### Bundle Optimization
- **Code Splitting**: Route-based and component-based splitting
- **Lazy Loading**: Dynamic imports for heavy components
- **Tree Shaking**: Eliminated unused dependencies
- **Bundle Analysis**: Automated bundle size monitoring

### Runtime Performance
- **Server Components**: Optimized data fetching and rendering
- **Caching Strategies**: ISR, revalidation, and cache management
- **Image Optimization**: Next.js Image component with lazy loading
- **Database Optimization**: Efficient queries with Prisma

### Core Web Vitals
- **Lighthouse Score**: 90+ across all metrics
- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1

## 🔒 Security Features

### Authentication Security
- **Secure Sessions**: HTTP-only cookies with secure flags
- **CSRF Protection**: Built-in CSRF token validation
- **Rate Limiting**: API rate limiting and abuse prevention
- **Input Validation**: Comprehensive input sanitization

### Data Protection
- **SQL Injection Prevention**: Parameterized queries via Prisma
- **XSS Protection**: Input sanitization and CSP headers
- **Secure Headers**: Security headers and CORS configuration
- **Data Encryption**: Sensitive data encryption at rest



## 📊 Monitoring & Analytics

### Performance Monitoring
- **Lighthouse CI**: Automated performance regression detection
- **Bundle Analysis**: Bundle size tracking and optimization
- **Core Web Vitals**: Real user performance monitoring
- **Error Tracking**: Client and server error monitoring

### Business Analytics
- **Sales Reports**: Revenue, conversion, and product performance
- **User Analytics**: User behavior and engagement metrics
- **Inventory Tracking**: Stock levels and reorder alerts
- **Admin Dashboard**: Real-time business metrics

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Configuration
- **Production Database**: Configure production PostgreSQL instance
- **Environment Variables**: Set production OAuth and API keys
- **SSL Certificate**: Configure HTTPS certificates
- **CDN Setup**: Configure asset delivery and caching

### Monitoring Setup
- **Error Tracking**: Set up error monitoring (Sentry, LogRocket)
- **Performance Monitoring**: Configure APM (New Relic, DataDog)
- **Analytics**: Set up Google Analytics or similar
- **Uptime Monitoring**: Configure uptime checks and alerts

## 🤝 Contributing

### Development Workflow
1. **Fork and Clone**: Fork the repository and clone locally
2. **Install Dependencies**: Run `npm install` or `bun install`
3. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
4. **Run Tests**: Ensure all tests pass with `npm run test:all`
5. **Code Quality**: Run linting with `npm run lint`
6. **Commit Changes**: Use conventional commit format
7. **Create PR**: Submit a pull request with detailed description

### Code Quality Standards
- **ESLint**: Strict linting rules enforced
- **TypeScript**: Strict type checking enabled
- **Testing**: All features must have corresponding tests
- **Performance**: Bundle size and performance budgets maintained

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team**: For the incredible React framework
- **Prisma Team**: For the database toolkit and ORM
- **shadcn**: For the beautiful component library
- **Better Auth**: For the comprehensive authentication framework
- **Vercel**: For the deployment platform and inspiration

## 📞 Support

For support, please:
1. Check the [Issues](https://github.com/your-username/nextjs-estore/issues) page
2. Review the [Documentation](./docs/)
3. Create a new issue with detailed information

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.