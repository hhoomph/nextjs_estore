# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Blog Feature**: Complete blog system with posts, categories, comments, and search
  - Full CRUD operations for blog posts with rich content editor
  - Category and tag management system
  - Nested comment system with user replies
  - Advanced search and filtering capabilities
  - SEO optimization with dynamic meta tags
  - Full internationalization support (English/Persian)
  - Responsive design and mobile optimization
  - Comment moderation and approval workflow
  - Blog analytics and engagement tracking

- **RTL Support**: Complete Right-to-Left (RTL) support for Persian (Farsi) language
  - HTML attributes (`lang="fa"`, `dir="rtl"`) properly set for Persian pages
  - Homepage links include locale prefixes (`/fa/products` instead of `/products`)
  - Full RTL typography and layout support

- **Translation Validation**: Comprehensive translation key validation tests
  - Automated tests to ensure all required translation keys exist in both English and Persian
  - Prevents MISSING_MESSAGE errors in production
  - Validates namespace consistency across languages

- **Staging Verification**: Production deployment verification script
  - Automated checks for RTL support, translations, and functionality
  - Pre-deployment validation script (`bun run staging:verify`)
  - Comprehensive deployment checklist

- **Enhanced E2E Testing**: Improved Playwright test coverage
  - Fixed navigation element visibility issues
  - Corrected URL expectations for locale-prefixed routes
  - Enhanced test configuration for proper port handling

### Fixed
- **Internationalization Critical Fixes**: Complete resolution of MISSING_MESSAGE errors
  - **Added missing `auth.signin` keys**: Added `phone.label`, `phone.placeholder`, and `hasAccount` keys to English locale
  - **Fixed Social Sharing conflicts**: Removed duplicate "Social Sharing" section in Persian messages
  - **Added missing `blog` keys**: Added complete blog translation section to English locale with all required keys
  - **Namespace consistency**: Ensured all component-required keys exist in both languages with proper namespaces

- **Translation Keys**: Added missing translation keys in English locale
  - Added `available` key to "Status Messages" namespace
  - Added `cart`, `continueShopping`, `orderSummary`, `proceedToCheckout` keys to "Cart Operations" namespace
  - Added complete blog translation section with `title`, `readMore`, `noPosts`, `description`, `keywords`
  - Ensured all component-required keys exist in both languages

- **Locale Routing**: Fixed homepage navigation to include locale prefixes
  - Product and category links now correctly use `/${locale}/` prefixes
  - Prevents navigation to wrong URLs when in Persian locale

- **RTL Attributes**: Fixed HTML language and direction attributes
  - Proper `lang="fa"` and `dir="rtl"` attributes for Persian pages
  - Dynamic attribute setting based on current locale

### Technical Improvements
- **Type Safety**: Full TypeScript compilation passes without MISSING_MESSAGE errors
- **Component Architecture**: Proper namespace usage in translation hooks
- **Test Infrastructure**: Added comprehensive translation validation (72 test cases) to CI pipeline
- **Build Process**: Successful production builds with all locales properly generated
- **Deployment Automation**: Staging verification and deployment checklists

### Documentation
- **README.md**: Updated with current project capabilities and enhanced translation testing details
- **CHANGELOG.md**: Created comprehensive changelog for all changes
- **Deployment Documentation**: Added staging verification and deployment procedures

## [1.0.0] - 2025-01-01

### Added
- Initial release of Next.js e-commerce platform
- Multilingual support (English/Persian) with next-intl
- Authentication system with Better Auth
- Database integration with Prisma and PostgreSQL
- Shopping cart and wishlist functionality
- Product catalog with categories
- Admin dashboard for product management
- Responsive design with Tailwind CSS
- SEO optimization and meta tags
- Performance monitoring and analytics