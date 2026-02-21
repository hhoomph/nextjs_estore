# Import Guidelines - Database Access

## ✅ CORRECT IMPORT PATTERN

Always use this import pattern for Prisma database access:

```typescript
import { prisma } from "@/lib/database";
```

## ❌ INCORRECT PATTERN

Do NOT use this import pattern:

```typescript
// ❌ WRONG - This path doesn't exist
import prisma from "@/lib/prisma";

// ❌ WRONG - Default export doesn't exist
import { default as prisma } from "@/lib/prisma";
```

---

## Where to Use Prisma

### ✅ Server-Side Code

Use Prisma in:
- Server components (`.tsx` files without "use client")
- Server actions (files with `"use server"` directive)
- API routes (`app/api/**/*.ts`)
- Middleware and utilities

### Examples

**1. Server Component (Correct)**
```typescript
import { prisma } from "@/lib/database";

export async function ProductList() {
  const products = await prisma.product.findMany();
  return <div>...</div>;
}
```

**2. Server Action (Correct)**
```typescript
"use server";

import { prisma } from "@/lib/database";

export async function getProducts() {
  return await prisma.product.findMany();
}
```

**3. API Route (Correct)**
```typescript
import { prisma } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}
```

---

## Client-Side Data Fetching

### ❌ DO NOT Import Prisma in Client Components

Never do this:
```typescript
"use client";
import { prisma } from "@/lib/database"; // ❌ WRONG!
```

### ✅ CORRECT: Use Server Actions or API Routes

Option 1: Call a server action
```typescript
"use client";

import { getProducts } from "@/lib/actions/products";

export function ProductBrowser() {
  const products = await getProducts();
  return <div>{/* render products */}</div>;
}
```

Option 2: Fetch from API route
```typescript
"use client";

export async function ProductBrowser() {
  const response = await fetch("/api/products");
  const products = await response.json();
  return <div>{/* render products */}</div>;
}
```

---

## Complete File Import Reference

### Database Module Export
**File:** `lib/database/index.ts`

```typescript
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
```

**Export Type:** Named export (`export const prisma`)

---

## All Fixed Import Locations

These files now use the correct import:

1. ✅ `app/products/[slug]/page.tsx`
2. ✅ `app/blog/page.tsx`
3. ✅ `app/blog/[slug]/page.tsx`
4. ✅ `lib/actions/products.ts`
5. ✅ `lib/actions/categories.ts`
6. ✅ `lib/actions/cart.ts`
7. ✅ `lib/auth/config.ts`
8. ✅ `app/api/products/route.ts`
9. ✅ `app/api/cart/sync/route.ts`
10. ✅ `app/api/cart/clear/route.ts`
11. ✅ `app/api/blog/comments/route.ts`
12. ✅ `app/api/blog/comments/[id]/replies/route.ts`
13. ✅ `app/api/auth/resend-verification/route.ts`
14. ✅ `app/api/admin/orders/[id]/route.ts`

---

## Troubleshooting

### Error: "Cannot find module '@/lib/prisma'"

**Solution:** Use the correct import
```typescript
// Change from:
import prisma from "@/lib/prisma";

// Change to:
import { prisma } from "@/lib/database";
```

### Error: "prisma is not defined"

**Solution:** Make sure you're importing at the top of the file
```typescript
// Add this to the top:
import { prisma } from "@/lib/database";
```

### Error: "Cannot use prisma in client component"

**Solution:** Move the code to a server action or API route
```typescript
// Create a server action:
// lib/actions/my-action.ts
"use server";
import { prisma } from "@/lib/database";
export async function myServerAction() {
  return await prisma.product.findMany();
}

// Use in client component:
"use client";
import { myServerAction } from "@/lib/actions/my-action";
const data = await myServerAction();
```

---

## Environment Variables Required

Make sure `.env.local` contains:

```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

---

## Best Practices

1. ✅ Always use `import { prisma } from "@/lib/database"`
2. ✅ Only use prisma in server-side code
3. ✅ Use server actions for client → server communication
4. ✅ Use API routes for complex operations
5. ✅ Cache database queries when possible
6. ✅ Handle errors with try-catch blocks
7. ✅ Validate user input before database queries
8. ✅ Use parameterized queries (Prisma handles this)

---

**Last Updated:** 2025-02-21
**Version:** 1.0.0
