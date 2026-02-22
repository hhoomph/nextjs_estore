# E-Store UI & Workflow Quick Reference Guide

## Project Status
✅ **All systems operational and production ready**

---

## Key Improvements Made

### 🎨 Design System
- Modern vibrant color palette (cyan/blue primary)
- Enhanced typography with Persian support
- Improved spacing and layout system
- Modern shadow effects and border radius
- Full dark mode support

### 🏠 Homepage
- Animated hero section with blob effects
- Enhanced features section with cards
- Improved CTA buttons
- Better visual hierarchy

### 🧩 Components Enhanced
- Button: Multiple variants with loading states
- Card: Better borders and hover effects
- Badge: New variants (success, warning, info)
- Footer: Gradient background and improved styling

### ⚡ Performance
- Optimized CSS selectors
- GPU-accelerated animations
- Lazy image loading
- Efficient component rendering

---

## Running the Application

```bash
# Start development server
npm run dev

# Open in browser
# http://localhost:3000
```

## Key Files to Know

### Critical System Files
- `/app/globals.css` - Global design system
- `/lib/actions/seo.ts` - Database operations
- `/app/layout.tsx` - Root layout with providers

### Component Locations
- `/components/ui/` - Base UI components
- `/components/layout/` - Navbar, Footer, Layout
- `/components/features/` - Feature-specific components

### Pages
- `/app/page.tsx` - Homepage
- `/app/products/` - Product pages
- `/app/cart/page.tsx` - Shopping cart
- `/app/checkout/` - Checkout flow
- `/app/admin/` - Admin dashboard
- `/app/auth/` - Authentication

---

## E-Store Workflows

### User Journey
1. **Browse** → Homepage → Products → Product Details
2. **Cart** → Add Items → View Cart → Manage Quantities
3. **Checkout** → Shipping → Payment → Confirmation
4. **Account** → Create Account → View Orders → Manage Profile

### Admin Tasks
1. **Login** → Admin Dashboard
2. **Products** → View/Add/Edit Products
3. **Orders** → View/Update Orders
4. **Analytics** → View Sales Data
5. **Settings** → Manage Site Configuration

---

## Color System Reference

### Primary Colors
- Primary: `#0ea5e9` (Vibrant Cyan)
- Primary Dark: `#0284c7`
- Primary Hover: `#0369a1`

### Accent Colors
- Teal: `#0d9488` (Main Accent)
- Emerald: `#059669` (Success)
- Amber: `#d97706` (Warning)
- Rose: `#e11d48` (Alert)

### Neutral Colors
- Foreground: `#171717` (Text)
- Background: `#fafafa` (Light BG)
- Muted: `#d4d4d4` (Placeholder)

### Dark Mode
- Background: `#0a0a0a`
- Foreground: `#fafafa`
- Card: `#1a1a1a`

---

## Typography Quick Guide

### Headings
- H1: `text-5xl md:text-7xl font-bold` (Hero)
- H2: `text-3xl md:text-4xl font-bold` (Section)
- H3: `text-lg md:text-xl font-semibold` (Subsection)

### Body Text
- Large: `text-lg font-medium`
- Default: `text-base font-normal`
- Small: `text-sm font-normal`
- Muted: `text-muted-foreground`

### Persian Text
- Add class: `font-persian` for Persian fonts
- Line height: `leading-relaxed` for better readability

---

## Common Components

### Button
```tsx
<Button variant="default" size="lg">
  Click Me
</Button>

// Variants: default, destructive, outline, secondary, ghost, link, gradient
// Sizes: sm, default, lg, xl, icon
```

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Badge
```tsx
<Badge variant="success">New</Badge>

// Variants: default, secondary, destructive, outline, success, warning, info
```

---

## Responsive Breakpoints

| Breakpoint | Screen Size | Tailwind |
|-----------|------------|----------|
| Mobile | 320px - 480px | base |
| Tablet | 481px - 768px | `md:` |
| Desktop | 769px - 1024px | `lg:` |
| Large | 1025px+ | `xl:` |

---

## Layout Spacing Scale

```css
/* Standard spacing (16px base) */
0.25rem (4px) - xs
0.5rem (8px) - sm
0.75rem (12px) - md
1rem (16px) - lg
1.5rem (24px) - xl
2rem (32px) - 2xl
3rem (48px) - 3xl
```

---

## Dark Mode Usage

```tsx
// Automatic with next-themes
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()

// CSS automatically applied via .dark class
```

---

## Database Queries

### Fetch Site Settings
```tsx
// Uses fallback defaults if schema mismatch
const result = await getSiteSettings()
```

### Product Operations
```tsx
// Get all products
const products = await getProducts()

// Get product by slug
const product = await getProductBySlug(slug)
```

---

## API Routes

### Admin Settings
- GET `/api/admin/settings` - Fetch site settings
- POST `/api/admin/settings` - Update settings

### Products
- GET `/api/products` - List products
- GET `/api/products/[id]` - Get product
- POST `/api/products` - Create (admin)

### Orders
- GET `/api/orders` - List orders (user)
- POST `/api/orders` - Create order

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Analytics, Auth, etc.
NEXT_PUBLIC_GA_ID=...
AUTH_SECRET=...
```

---

## Performance Tips

1. **Use `next/image`** for all images
2. **Implement lazy loading** for components
3. **Cache database queries** appropriately
4. **Minimize re-renders** with proper hooks
5. **Use `useMemo`** for expensive calculations

---

## Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Database Errors**
- Check DATABASE_URL format
- Verify Neon connection
- Check Prisma schema sync

**Component Issues**
- Clear browser cache
- Check console for errors
- Verify imports are correct

---

## Testing Workflows

### Product Browse Flow
1. Go to /products
2. Select a product
3. View product details
4. Add to cart
5. Verify cart count increased

### Checkout Flow
1. Add item to cart
2. Go to /checkout
3. Fill in address
4. Select shipping
5. Complete payment
6. See confirmation page

### Admin Flow
1. Go to /admin/signin
2. Log in with admin credentials
3. Access dashboard
4. Manage products/orders
5. View analytics

---

## Deployment

### Vercel Deployment
```bash
# Push to GitHub
git add .
git commit -m "Ready for production"
git push

# Deploy from Vercel Dashboard
# (Automatically triggers build and deploy)
```

### Build & Start Locally
```bash
npm run build
npm start
# http://localhost:3000
```

---

## Support & Resources

### Documentation Files
- `UI_ENHANCEMENTS.md` - Design changes
- `WORKFLOW_TESTING_GUIDE.md` - Testing checklist
- `COMPREHENSIVE_ANALYSIS_REPORT.md` - Full analysis

### Framework Docs
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## Version Info
- **Project Version**: 3.0.0
- **Last Updated**: February 22, 2026
- **Status**: Production Ready
- **Author**: v0 AI Assistant

---

**Quick Navigation**
- [Home](/)
- [Products](/products)
- [Cart](/cart)
- [Admin](/admin)
- [Blog](/blog)
- [Contact](/contact)

---

**Questions?** Check the comprehensive documentation files or contact support.
