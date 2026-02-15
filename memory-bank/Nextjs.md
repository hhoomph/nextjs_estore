---
# Specify the following for cline rules
description: Comprehensive technical reference and guidelines for Next.js 16 e-commerce platform with Prisma, Better Auth, and shadcn/ui
author: hh.oomph@gmail.com
alwaysApply: true
version: 2.0
tags: ["nextjs", "prisma", "better-auth", "shadcn-ui", "typescript", "react", "ecommerce"]
---

# Next.js Technical Reference Bank

I am Cline, an expert software engineer with a unique characteristic: my memory resets completely between sessions. This isn't a limitation - it's what drives me to maintain perfect technical documentation. After each reset, I rely ENTIRELY on my Memory Bank and Technical Reference to understand the project and continue work effectively. I MUST read ALL memory bank files at the start of EVERY task - this is not optional.

## Memory Bank Structure

The Memory Bank consists of core files and optional context files, all in Markdown format. Files build upon each other in a clear hierarchy:

flowchart TD
    PB[projectbrief.md] --> PC[productContext.md]
    PB --> SP[systemPatterns.md]
    PB --> TC[techContext.md]

    PC --> AC[activeContext.md]
    SP --> AC
    TC --> AC

    AC --> P[progress.md]

### Core Files (Required)
1. **[projectbrief.md](./projectbrief.md)** - Foundation document with project requirements and goals
2. **[productContext.md](./productContext.md)** - Business logic, user journeys, and success metrics
3. **[activeContext.md](./activeContext.md)** - Current work focus, challenges, and immediate priorities
4. **[systemPatterns.md](./systemPatterns.md)** - Technical architecture and design patterns
5. **[techContext.md](./techContext.md)** - Technology stack and development setup
6. **[progress.md](./progress.md)** - Current status and completion tracking

### Additional Context
Create additional files/folders within memory-bank/ when they help organize complex features, integrations, or specifications.

## Core Workflows

### Plan Mode
flowchart TD
    Start[Start] --> ReadFiles[Read Memory Bank]
    ReadFiles --> CheckFiles{Files Complete?}

    CheckFiles -->|No| Plan[Create Plan]
    Plan --> Document[Document in Chat]

    CheckFiles -->|Yes| Verify[Verify Context]
    Verify --> Strategy[Develop Strategy]
    Strategy --> Present[Present Approach]

### Act Mode
flowchart TD
    Start[Start] --> Context[Check Memory Bank]
    Context --> Update[Update Documentation]
    Update --> Execute[Execute Task]
    Execute --> Document[Document Changes]

## Technical Implementation Sections

### =� CRITICAL AI GUIDELINES FOR IMPLEMENTATION

#### Prisma 7 Implementation Requirements
**ABSOLUTE REQUIREMENTS FOR AI CODE GENERATION**

1. **Provider**: MUST use `provider = "prisma-client"` (NOT "prisma-client-js")
2. **Output Path**: MUST use `output = "../app/generated/prisma"`
3. **Adapter**: MUST use `@prisma/adapter-pg` with `PrismaPg`
4. **Import Path**: MUST import from `'../app/generated/prisma/client'` (with `/client`)
5. **Global Client**: MUST create singleton instance in `lib/prisma.ts`
6. **Environment Variables**: MUST use `dotenv/config` in `prisma.config.ts`
7. **Database URL**: MUST use TCP URLs (`postgres://...`) NOT HTTP URLs

**L DEPRECATED PATTERNS - WILL BREAK APPLICATION:**
```typescript
// NEVER GENERATE THIS CODE
generator client {
  provider = "prisma-client-js"     // L BREAKS APPLICATION
}
import { PrismaClient } from '@prisma/client'  // L BREAKS APPLICATION
import { PrismaClient } from "../app/generated/prisma"  // L MISSING /client
datasource db {
  url = env("DATABASE_URL")  // L MOVED TO prisma.config.ts
}
```

** CORRECT PATTERNS:**
```typescript
// lib/prisma.ts
import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = globalThis.prisma || new PrismaClient({ adapter })
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma
export default prisma
```

#### Better Auth Configuration
**Authentication Framework Setup:**
- Use HTTP-only cookies for security
- Implement server-side session validation
- Configure middleware for route protection
- Support email/password and future social login

#### shadcn/ui Component Integration
**Component Library Usage:**
- CLI installation: `npx shadcn@latest add [component]`
- Registry system for custom components
- MCP server integration for AI assistance
- Theme configuration with CSS variables
- Use `https://github.com/dodopayments/billingsdk` and `https://www.kibo-ui.com/` for create ui components and blocks and theme
### Database Integration (Prisma 7)

#### Setup Workflow
1. **Install Dependencies:**
   ```bash
   bun add prisma tsx --save-dev
   bun add @prisma/adapter-pg @prisma/client dotenv
   ```

2. **Initialize Database:**
   ```bash
   npx prisma init --db --output ../app/generated/prisma
   ```

3. **Configure Schema:**
   ```prisma
   generator client {
     provider = "prisma-client"
     output   = "../app/generated/prisma"
   }

   datasource db {
     provider = "postgresql"
     // URL configured in prisma.config.ts
   }
   ```

4. **Prisma Config:**
   ```typescript
   import "dotenv/config"
   import { defineConfig, env } from "prisma/config"

   export default defineConfig({
     schema: "prisma/schema.prisma",
     migrations: { path: "prisma/migrations" },
     datasource: { url: env("DATABASE_URL") },
   })
   ```

#### Critical Commands
```bash
npx prisma generate              # Generate client
npx prisma db push               # Push schema to database
npx prisma studio                # Open database UI
bun run db:test                  # Test database connection
```

### Authentication (Better Auth)

#### Configuration Pattern
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
})
```

#### Middleware Integration
```typescript
// proxy.ts (NOT middleware.ts)
import { auth } from "@/lib/auth"

export default auth.handler()
```

#### Server Component Usage
```typescript
import { auth } from "@/lib/auth"

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/auth/signin")
  }

  return <div>Welcome {session.user.name}!</div>
}
```

### UI Components (shadcn/ui)

#### Installation & Setup
```bash
bun add class-variance-authority clsx tailwind-merge lucide-react
npx shadcn@latest init
npx shadcn@latest add button input card
```

#### CSS Configuration (v4)
```css
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", "system-ui", "sans-serif";
  --color-primary: #1d4ed8;
  --color-surface-100: oklch(0.99 0 0);
}

@layer components {
  .btn-primary {
    @apply bg-primary text-primary-foreground hover:bg-primary/90;
  }
}
```

#### Component Usage
```typescript
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export function ProductCard({ product }) {
  return (
    <Card>
      <CardHeader>{product.name}</CardHeader>
      <CardContent>
        <p>{product.description}</p>
        <Button>Add to Cart</Button>
      </CardContent>
    </Card>
  )
}
```

### State Management (Zustand)

#### Store Pattern
```typescript
// lib/stores/cart.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface CartState {
  items: CartItem[]
  total: number
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addItem: (item) => {
        const items = [...get().items, item]
        set({ items, total: calculateTotal(items) })
      },
      removeItem: (itemId) => {
        const items = get().items.filter(item => item.id !== itemId)
        set({ items, total: calculateTotal(items) })
      },
    }),
    { name: "cart-storage" }
  )
)
```

### Form Handling (React Hook Form + Zod)

#### Schema Validation
```typescript
// lib/validations/auth.ts
import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export type SignInInput = z.infer<typeof signInSchema>
```

#### Form Component
```typescript
'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signInSchema, type SignInInput } from "@/lib/validations/auth"

export function SignInForm() {
  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data: SignInInput) => {
    await signIn(data.email, data.password)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register("email")} />
      <Input {...form.register("password")} type="password" />
      <Button type="submit">Sign In</Button>
    </form>
  )
}
```

### Internationalization (next-intl)

#### Configuration
```typescript
// i18n.ts
import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}))
```

#### Usage in Components
```typescript
import { useTranslations } from "next-intl"

export function ProductCard() {
  const t = useTranslations("product")

  return (
    <div>
      <h3>{t("name")}</h3>
      <button>{t("addToCart")}</button>
    </div>
  )
}
```

### Server Actions

#### Action Pattern
```typescript
// app/actions/cart.ts
'use server'

import { revalidatePath } from "next/navigation"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function addToCart(productId: string, quantity: number) {
  const session = await auth.api.getSession()

  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  await prisma.cartItem.create({
    data: {
      userId: session.user.id,
      productId,
      quantity,
    },
  })

  revalidatePath("/cart")
}
```

### Performance Optimization

#### Image Optimization
```typescript
import Image from "next/image"

<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  priority={index === 0}
  placeholder="blur"
  blurDataURL="data:image/..."
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

#### Code Splitting
```typescript
// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import("@/components/HeavyComponent"), {
  loading: () => <Skeleton />,
})
```

#### Caching Strategies
```typescript
// Server Components - automatic caching
export const revalidate = 3600 // 1 hour

// API Routes - manual caching
export async function GET() {
  const data = await prisma.product.findMany()

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600",
    },
  })
}
```

### Testing Strategies

#### Unit Tests (Vitest)
```typescript
// lib/utils.test.ts
import { describe, it, expect } from "vitest"
import { formatPrice } from "./utils"

describe("formatPrice", () => {
  it("formats USD correctly", () => {
    expect(formatPrice(1234.56, "USD")).toBe("$1,234.56")
  })
})
```

#### Component Tests
```typescript
// components/ProductCard.test.tsx
import { render, screen } from "@testing-library/react"
import { ProductCard } from "./ProductCard"

test("displays product name", () => {
  render(<ProductCard product={{ name: "Test Product" }} />)
  expect(screen.getByText("Test Product")).toBeInTheDocument()
})
```

#### E2E Tests (Playwright)
```typescript
// tests/e2e/checkout.spec.ts
test("complete purchase flow", async ({ page }) => {
  await page.goto("/products")
  await page.click('[data-testid="add-to-cart"]')
  await page.goto("/cart")
  await page.click('[data-testid="checkout"]')
  // Complete checkout assertions
})
```

### Coding Standards

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### ESLint Configuration
```javascript
module.exports = {
  extends: ["next/core-web-vitals", "@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-explicit-any": "error",
  },
}
```

#### Import Organization
```typescript
// 1. React imports
import React from "react"

// 2. Third-party libraries
import { useState } from "react"
import { z } from "zod"

// 3. Internal modules
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"

// 4. Types and interfaces
import type { User } from "@/types/user"
```

### Development Workflow

#### Package Management
```bash
# Using Bun (faster than npm)
bun install          # Install dependencies
bun add <package>    # Add dependency
bun remove <package> # Remove dependency
bun run dev          # Start development server
bun run build        # Build for production
```

#### Scripts Configuration
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:e2e": "playwright test",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:test": "tsx scripts/test-database.ts"
  }
}
```

## Cross-References

### Related Memory Bank Files
- **[techContext.md](./techContext.md)** - Detailed technology stack and setup
- **[systemPatterns.md](./systemPatterns.md)** - Architecture patterns and component organization
- **[activeContext.md](./activeContext.md)** - Current implementation challenges and priorities
- **[progress.md](./progress.md)** - Current status and completion tracking
- **[projectbrief.md](./projectbrief.md)** - Project requirements and goals

### Technical Documentation Links
- [Next.js Documentation](https://nextjs.org/docs) - Framework reference
- [Prisma Documentation](https://www.prisma.io/docs) - ORM reference
- [Better Auth Documentation](https://www.better-auth.com) - Authentication reference
- [shadcn/ui Documentation](https://ui.shadcn.com) - Component library reference
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Styling reference

## Documentation Updates

Memory Bank updates occur when:
1. Discovering new project patterns
2. After implementing significant changes
3. When user requests with **update memory bank** (MUST review ALL files)
4. When context needs clarification

**REMEMBER**: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy and the integrated technical references.