---
title: System Patterns - Next.js E-commerce Store
version: 1.0
last_updated: 2025-12-28
---

# System Patterns

## Architecture Overview

### Layered Architecture
```
┌─────────────────┐
│   Presentation  │  Next.js App Router (Pages & Components)
├─────────────────┤
│   Application   │  Server Actions, API Routes, Business Logic
├─────────────────┤
│    Domain       │  Core Business Rules, Entities, Value Objects
├─────────────────┤
│ Infrastructure  │  Database, External APIs, File Storage
└─────────────────┘
```

## Design Patterns

### Repository Pattern
- **Prisma Client**: Acts as repository for data access **[See Nextjs.md Database Integration](./Nextjs.md#database-integration-prisma-7)**
- **Type-safe queries**: Generated types ensure compile-time safety
- **Connection management**: Automatic pooling and connection handling

```typescript
// lib/prisma.ts - Repository implementation
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! })
})

export default prisma
```

### Service Layer Pattern
- **Business logic separation**: Domain logic isolated from presentation
- **Dependency injection**: Services injected where needed
- **Testability**: Services can be easily mocked

### Factory Pattern
- **Prisma client creation**: Global singleton instance
- **Environment-specific configuration**: Different setups for dev/prod
- **Connection adapters**: PgAdapter for PostgreSQL

### Strategy Pattern
- **Authentication providers**: Multiple auth strategies (email, social)
- **Payment processors**: Future payment gateway flexibility
- **Shipping calculators**: Different shipping methods

## Component Patterns

### Atomic Design
```
atoms/     # Basic UI elements (Button, Input, Icon)
molecules/ # Combinations of atoms (FormField, Card, Badge)
organisms/ # Complex components (Header, ProductCard, Cart)
templates/ # Page layouts with placeholder content
pages/     # Actual pages with real content
```

### Container/Presentational Pattern
```typescript
// Presentational Component (dumb)
function ProductCard({ product, onAddToCart }) {
  return (
    <div className="card">
      <h3>{product.name}</h3>
      <button onClick={() => onAddToCart(product)}>Add to Cart</button>
    </div>
  )
}

// Container Component (smart)
function ProductCardContainer({ productId }) {
  const product = useProduct(productId)
  const addToCart = useAddToCart()

  return (
    <ProductCard
      product={product}
      onAddToCart={addToCart}
    />
  )
}
```

### Higher-Order Components (HOCs)
- **Authentication guards**: `withAuth` HOC for protected routes
- **Loading states**: `withLoading` HOC for async operations
- **Error boundaries**: `withErrorBoundary` HOC for error handling

## Data Flow Patterns

### Server Components (Primary)
- **Direct data access**: Server components query database directly
- **No client JavaScript**: Reduces bundle size and improves performance
- **Streaming**: Progressive loading of content

```typescript
// app/products/page.tsx
export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true }
  })

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Client Components (Selective)
- **Interactive elements**: Forms, buttons, animations
- **State management**: Local component state
- **Optimistic updates**: Immediate UI feedback

```typescript
'use client'

function AddToCartButton({ productId }) {
  const [isLoading, setIsLoading] = useState(false)

  const addToCart = async () => {
    setIsLoading(true)
    await addToCartAction(productId)
    setIsLoading(false)
  }

  return (
    <button onClick={addToCart} disabled={isLoading}>
      {isLoading ? 'Adding...' : 'Add to Cart'}
    </button>
  )
}
```

### Server Actions
- **Form handling**: Co-located with components **[See Nextjs.md Server Actions](./Nextjs.md#server-actions)**
- **Progressive enhancement**: Works without JavaScript
- **Security**: Server-side validation and execution

```typescript
// app/actions/cart.ts
'use server'

export async function addToCart(productId: string, quantity: number) {
  const cart = await getOrCreateCart()
  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity
    }
  })

  revalidatePath('/cart')
}
```

## State Management Patterns

### Global State (Zustand)
- **User session**: Authentication state **[See Nextjs.md Authentication](./Nextjs.md#authentication-better-auth)**
- **Shopping cart**: Cart contents and totals
- **UI state**: Modals, drawers, notifications

```typescript
// lib/stores/cart.ts
interface CartState {
  items: CartItem[]
  total: number
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  addItem: (item) => {
    const items = [...get().items, item]
    const total = calculateTotal(items)
    set({ items, total })
  },
  removeItem: (itemId) => {
    const items = get().items.filter(item => item.id !== itemId)
    const total = calculateTotal(items)
    set({ items, total })
  }
}))
```

### Server State (React Query/SWR)
- **Product data**: Cached product information
- **User preferences**: Saved settings and preferences
- **Search results**: Debounced search with caching

## Routing Patterns

### App Router Conventions
```
app/
├── layout.tsx           # Root layout
├── page.tsx            # Homepage (/)
├── [locale]/
│   ├── layout.tsx      # Internationalized layout
│   ├── page.tsx        # Localized homepage (/en, /fa)
│   ├── products/
│   │   ├── page.tsx    # Product list (/[locale]/products)
│   │   └── [slug]/
│   │       └── page.tsx # Product detail (/[locale]/products/[slug])
│   └── cart/
│       └── page.tsx    # Shopping cart (/[locale]/cart)
```

### Route Groups
- **(auth)**: Authentication-related pages
- **(shop)**: Shopping-related pages
- **(admin)**: Admin-only pages

## API Patterns

### RESTful API Routes
```
app/api/
├── products/
│   ├── route.ts         # GET /api/products, POST /api/products
│   └── [id]/
│       └── route.ts     # GET /api/products/[id], PUT /api/products/[id]
├── users/
│   └── [id]/
│       └── route.ts     # User management endpoints
└── orders/
    └── route.ts         # Order management endpoints
```

### API Response Patterns
```typescript
// Success response
{
  success: true,
  data: T,
  message?: string
}

// Error response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

## Error Handling Patterns

### Error Boundaries
- **UI-level errors**: React Error Boundaries
- **API errors**: Try-catch in Server Actions
- **Validation errors**: Zod schema validation

### Global Error Handling
```typescript
// app/global-error.tsx
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  )
}
```

## Performance Patterns

### Code Splitting
- **Route-based splitting**: Automatic with App Router
- **Component lazy loading**: `React.lazy()` for heavy components
- **Dynamic imports**: For rarely used features

### Caching Strategies
- **Static generation**: Product pages, categories
- **Server-side caching**: Database query results
- **Client-side caching**: Zustand persistence
- **HTTP caching**: Appropriate cache headers

### Image Optimization
```typescript
import Image from 'next/image'

<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  priority={isHeroImage}
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

## Security Patterns

### Authentication Guards
```typescript
// lib/auth.ts
export function requireAuth(user: User | null) {
  if (!user) {
    redirect('/auth/signin')
  }
  return user
}

// Usage in Server Component
export default async function ProtectedPage() {
  const session = await auth()
  const user = requireAuth(session?.user)

  return <div>Welcome {user.name}!</div>
}
```

### Input Validation
```typescript
// lib/validations/product.ts
import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
```

### Rate Limiting
- **API routes**: Request throttling
- **Authentication**: Failed login attempt limits
- **Search**: Query rate limiting

## Testing Patterns

### Unit Tests
```typescript
// lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatPrice } from './utils'

describe('formatPrice', () => {
  it('formats USD correctly', () => {
    expect(formatPrice(1234.56, 'USD')).toBe('$1,234.56')
  })

  it('formats IRR correctly', () => {
    expect(formatPrice(123456, 'IRR')).toBe('۱۲۳٬۴۵۶ تومان')
  })
})
```

### Integration Tests
- **API routes**: Full request/response cycles
- **Database operations**: Prisma queries with test database
- **Authentication flows**: Complete login/logout cycles

### E2E Tests (Playwright)
```typescript
// tests/e2e/checkout.spec.ts
test('complete purchase flow', async ({ page }) => {
  await page.goto('/products')
  await page.click('[data-testid="add-to-cart"]')
  await page.goto('/cart')
  await page.click('[data-testid="checkout"]')
  // ... complete checkout flow
})
```

## Internationalization Patterns

### Route-based Localization
```
app/[locale]/
├── page.tsx           # Localized homepage
├── products/page.tsx  # Localized product list
└── cart/page.tsx      # Localized cart
```

### Translation Keys
```json
// messages/en.json
{
  "nav.cart": "Cart",
  "product.addToCart": "Add to Cart",
  "cart.total": "Total: {amount}"
}

// messages/fa.json
{
  "nav.cart": "سبد خرید",
  "product.addToCart": "افزودن به سبد",
  "cart.total": "مجموع: {amount}"
}
```

### Usage in Components
```typescript
import { useTranslations } from 'next-intl'

function CartButton() {
  const t = useTranslations('cart')

  return (
    <button>
      {t('addToCart')}
    </button>
  )
}
```

## Database Patterns

### Prisma Schema Organization
```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(CUSTOMER)
  orders    Order[]
  addresses Address[]

  @@map("users")
}

model Product {
  id          String     @id @default(cuid())
  name        String
  description String?
  price       Decimal
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id])

  @@map("products")
}
```

### Migration Strategy
- **Development**: `prisma db push` for rapid iteration
- **Production**: Proper migrations with `prisma migrate`
- **Version control**: Migrations committed to repository

### Query Optimization
```typescript
// Selective field fetching
const products = await prisma.product.findMany({
  select: {
    id: true,
    name: true,
    price: true,
    category: {
      select: { name: true }
    }
  }
})

// Pagination
const products = await prisma.product.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: 'desc' }
})
```

## Deployment Patterns

### Environment Configuration
```typescript
// lib/config.ts
export const config = {
  database: {
    url: process.env.DATABASE_URL!,
  },
  auth: {
    secret: process.env.BETTER_AUTH_SECRET!,
    url: process.env.BETTER_AUTH_URL!,
  },
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL!,
    env: process.env.NODE_ENV!,
  },
}
```

### Build Optimization
- **Bundle analysis**: Regular bundle size monitoring
- **Code splitting**: Route-based and component-based splitting
- **Compression**: Gzip/Brotli compression
- **CDN**: Static asset delivery

### Health Checks
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return Response.json({ status: 'healthy', database: 'connected' })
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', database: 'disconnected' },
      { status: 500 }
    )
  }
}