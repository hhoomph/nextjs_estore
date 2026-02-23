# Quick Start Guide - E-Store Application

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ or Bun
- Neon PostgreSQL account (already configured)
- Environment variables set (already done in `.env.local`)

### Start Development Server
```bash
npm run dev
# or
bun dev
```

**Server runs at:** http://localhost:3000

---

## 🏠 Core Features Available

### Homepage
- Featured products section (showing 8 sample products)
- Hero section with call-to-action
- Feature highlights
- Responsive design

**Access:** http://localhost:3000

### Product Catalog
- Browse all 8 sample products
- Filter by category (Electronics, Fashion, Home & Garden)
- Sort by price, name, or newest
- View product details with images

**Access:** http://localhost:3000/products

### Shopping Cart
- Add products to cart
- View cart items
- Update quantities
- Proceed to checkout

**Access:** http://localhost:3000/cart

### User Authentication
- Create account
- Sign in
- Manage profile
- View order history

**Sign Up:** http://localhost:3000/auth/signup  
**Sign In:** http://localhost:3000/auth/signin

### Admin Dashboard
- View analytics
- Manage products
- Manage users
- Track orders
- Manage categories

**Access:** http://localhost:3000/admin/signin

---

## 📊 Sample Data Available

### Products (8 Total)
1. **Wireless Headphones** - $199.99 (on sale: $149.99)
2. **Smart Watch** - $299.99
3. **Casual T-Shirt** - $29.99 (on sale: $19.99)
4. **Winter Jacket** - $129.99
5. **Coffee Maker** - $79.99 (on sale: $59.99)
6. **Bedding Set** - $149.99
7. **USB-C Cable** - $12.99
8. **Running Shoes** - $109.99 (on sale: $89.99)

### Categories
- Electronics (3 products)
- Fashion (3 products)  
- Home & Garden (2 products)

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Build for production
npm run start            # Run production build

# Database
npm run db:seed          # Seed additional data
npm run db:studio        # Open Prisma Studio

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # Run linter
npm run lint:fix         # Fix linting issues
npm run typecheck        # Check TypeScript types

# Performance
npm run lighthouse       # Run Lighthouse audit
npm run analyze:bundle   # Analyze bundle size
```

---

## 🔧 Configuration

### Environment Variables (`.env.local`)
```
DATABASE_URL=postgresql://...  # Already configured
```

### Localization
- **Default:** Persian (Farsi)
- **Supported:** English, Persian
- **Switch language:** Use language switcher in navbar

### Theme
- **Light/Dark mode:** Toggle in sidebar
- **RTL Support:** Automatic for Persian

---

## 📝 Key Pages

| Page | URL | Status |
|------|-----|--------|
| Homepage | `/` | ✅ Live |
| Products | `/products` | ✅ Live |
| Product Detail | `/products/[slug]` | ✅ Live |
| Cart | `/cart` | ✅ Live |
| Checkout | `/checkout` | ✅ Live |
| Sign Up | `/auth/signup` | ✅ Live |
| Sign In | `/auth/signin` | ✅ Live |
| Dashboard | `/dashboard` | ✅ Live |
| Admin Panel | `/admin` | ✅ Live |
| Blog | `/blog` | ✅ Live |

---

## 🐛 Troubleshooting

### Issue: Products not showing
**Solution:** Check that database is connected and seeded
```bash
npm run db:seed
```

### Issue: Build errors
**Solution:** Clear cache and rebuild
```bash
npm run cache:clear
npm run build
```

### Issue: Database connection failed
**Solution:** Verify `.env.local` has valid DATABASE_URL
```bash
echo $DATABASE_URL  # Check environment variable
```

### Issue: Slow page loads
**Solution:** Clear .next cache and restart
```bash
rm -rf .next
npm run dev
```

---

## 🔐 Admin Access

To access admin dashboard:
1. Go to http://localhost:3000/admin/signin
2. Create admin account (first user becomes admin)
3. Access admin features

---

## 📱 Mobile Testing

Test responsive design on:
- iPhone (375px width)
- iPad (768px width)
- Desktop (1920px width)

All pages are fully responsive.

---

## 🎨 Customization

### Update Products
- Edit in database directly via Prisma Studio
- Or modify `/scripts/seed-products.ts`

### Change Colors/Theme
- Edit CSS variables in `/app/globals.css`
- Theme system in `/components/providers/theme-provider.tsx`

### Add More Features
- Create new components in `/components`
- Create new pages in `/app`
- Create API routes in `/app/api`

---

## 📚 Documentation

For more detailed information, see:
- `DIAGNOSTIC_REPORT.md` - Complete system audit
- `FIXES_IMPLEMENTED.md` - All fixes applied
- `README.md` - Project overview

---

## ✅ Current Status

- ✅ Database: Connected & Populated
- ✅ Frontend: All pages rendering
- ✅ Authentication: Ready
- ✅ Shopping: Fully functional
- ✅ Admin: Operational
- ✅ Performance: Optimized
- ✅ Security: Implemented

**Application is ready for testing and deployment!**

---

## 📞 Support

For issues or questions:
1. Check `DIAGNOSTIC_REPORT.md` for detailed information
2. Review `FIXES_IMPLEMENTED.md` for recent changes
3. Check database with Prisma Studio: `npm run db:studio`

---

Last Updated: 2026-02-21  
Version: 1.0 (Production Ready)
