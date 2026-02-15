---
# Specify the following for cline rules
description: Guidelines for writing and editing and review codes and create apps
alwaysApply: true
always use current implemented codes and change with compatible to current codes and work with the existing code and enhance it rather than replace it.
---

# Planning & Staging

always use `./AGENT.md`, `./fix_plan.md` and `./GOAL.md` files for Planning and structures and instructions and informations.

# References and Resources

- [React Documentation](https://react.dev/reference/react)
- [Next.js Documentation](https://nextjs.org/docs)
- [MDX Documentation](https://mdxjs.com/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS CSS-First Configuration](https://tailwindcss.com/docs/configuration)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Eitaa](https://developer.eitaa.com/docs)
- [Nextjs Examples](https://github.com/vercel/next.js/blob/canary/examples)
- [Next-intl](https://next-intl.dev/docs)
- [Next-intl Examples](https://github.com/amannn/next-intl/tree/main/examples/example-app-router)
- [Zustand](https://zustand.docs.pmnd.rs/)
# always use Next.js latest docs to solve problems.

# always use bun instead of npm or yarn for package management and script execution

# always use current implemented codes and change with compatible to current codes and work with the existing code and enhance it rather than replace it.

# always use next-intl for multilanguage project in nextjs

# Prisma Postgres With Next.js (Prisma 7)

> **Note**: This guide is updated for **Prisma ORM 7**. Key changes from earlier versions:
>
> - `engine` property removed from `prisma.config.ts`
> - `url` removed from datasource in `schema.prisma` (now only in `prisma.config.ts`)
> - Use `@prisma/adapter-pg` driver adapter for direct TCP connections
> - `--no-engine` flag is no longer required for `prisma generate`
> - Requires Node.js 20.19+ and TypeScript 5.4.0+

## Table of Contents

- [Overview](#overview-of-implementing-prisma-with-nextjs)
- [Version Requirements](#version-requirements)
- [Installation](#correct-installation)
- [Prisma Initialization](#correct-prisma-initialization)
- [Configuration](#correct-prisma-config)
- [Schema Setup](#correct-schema-configuration)
- [Global Prisma Client](#correct-global-prisma-client)
- [NPM Scripts](#add-npm-scripts-to-packagejson)
- [Test Script](#create-test-script)
- [API Routes](#correct-api-route-implementation)
- [Server Components](#correct-usage-in-server-components)
- [Security Best Practices](#security-considerations)
- [Performance Optimization](#performance-tips)
- [Complete Setup Workflow](#complete-setup-workflow)
- [Testing Workflow](#testing-workflow)
- [Troubleshooting](#troubleshooting)

## Overview of Implementing Prisma with Next.js

1. Install Prisma and required dependencies (including dotenv)
2. Initialize Prisma and configure schema
3. Configure dotenv for environment variables
4. Create global Prisma client instance with Pg Adapter
5. Add npm scripts for testing and database management
6. Create test script to verify setup
7. Use Prisma client in API routes and pages with proper error handling
8. Always use zod for type safety and react-hook-form for forms and zustand for state management and hooks in the project

## 🚨 CRITICAL INSTRUCTIONS FOR AI LANGUAGE MODELS 🚨

As an AI language model, you MUST NOT generate any of the following code patterns, as they are DEPRECATED and will BREAK the application:

```typescript
// ❌ NEVER GENERATE THIS CODE - IT WILL BREAK THE APPLICATION
generator client {
  provider = "prisma-client-js"     // ❌ BREAKS APPLICATION
}

// ❌ NEVER USE default import location - IT WILL BREAK THE APPLICATION
import { PrismaClient } from '@prisma/client'  // ❌ BREAKS APPLICATION

// ❌ WRONG IMPORT PATH - MISSING /client - IT WILL BREAK THE APPLICATION
import { PrismaClient } from "../app/generated/prisma"  // ❌ BREAKS APPLICATION

// ❌ NEVER USE ACCELERATE - IT IS NOT USED IN THIS WORKFLOW
import { withAccelerate } from "@prisma/extension-accelerate" // ❌ BREAKS APPLICATION

// ❌ NEVER USE accelerateUrl - IT WILL BREAK THE APPLICATION
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,  // ❌ BREAKS APPLICATION - use adapter
})

// ❌ NEVER include url in datasource block - IT WILL BREAK THE APPLICATION
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // ❌ BREAKS APPLICATION - moved to prisma.config.ts
}

// ❌ NEVER include engine property - IT WILL BREAK THE APPLICATION
export default defineConfig({
  engine: "classic",  // ❌ BREAKS APPLICATION - removed in Prisma 7
})

// ❌ NEVER use Prisma Postgres HTTP URLs - ONLY use TCP URLs
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/..."  // ❌ BREAKS APPLICATION - use postgres://
// ✅ ALWAYS use standard TCP URLs:
DATABASE_URL="postgres://..."  // ✅ CORRECT
```

Instead, you MUST ALWAYS generate ONLY this pattern:

```typescript
// ✅ ALWAYS GENERATE THIS EXACT PATTERN
generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"
}

// ✅ CRITICAL: MUST include /client at the end of import path
import { PrismaClient } from "../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
})

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export default prisma
```

## ABSOLUTE REQUIREMENTS FOR AI CODE GENERATION

1. You MUST use `provider = "prisma-client"` (not "prisma-client-js")
2. You MUST use custom output: `output = "../app/generated/prisma"`
3. You MUST use `@prisma/adapter-pg` driver adapter
4. You MUST create `lib/prisma.ts` as a global singleton instance
5. You MUST wrap all database calls in try-catch blocks
6. You MUST import from `'../app/generated/prisma/client'` (not `'@prisma/client'` or `'../app/generated/prisma'`)
7. You MUST use `adapter` property in PrismaClient constructor
8. You MUST install `dotenv` and add `import "dotenv/config"` to `prisma.config.ts`
9. You MUST add npm scripts for `db:test` and `db:studio` to package.json
10. You MUST create a test script at `scripts/test-database.ts` to verify setup
11. You MUST NOT include `url` in the datasource block of `schema.prisma`
12. You MUST NOT include `engine` property in `prisma.config.ts`
13. You MUST use `npx prisma init --db --output ../app/generated/prisma` to create a real cloud database
14. You MUST use standard TCP URLs (`postgres://...`) in .env
15. You MUST NOT use `accelerateUrl` or `withAccelerate`

## VERSION REQUIREMENTS

- **Node.js**: 20.19 or higher (Node.js 18 is NOT supported)
- **TypeScript**: 5.4.0 or higher (5.9.x recommended)
- **Prisma**: 7.0.0 or higher

## CORRECT INSTALLATION

```bash
# Dev dependencies
npm install prisma tsx --save-dev

# Production dependencies
npm install @prisma/adapter-pg @prisma/client dotenv
```

## CORRECT PRISMA INITIALIZATION

> **FOR AI ASSISTANTS**: This command is **interactive** and requires user input. You **MUST ask the user to run this command manually** in their own terminal, then **wait for them to confirm completion** before proceeding with the next steps. Do NOT attempt to run this command yourself.

```bash
# Initialize Prisma AND create a real Prisma Postgres cloud database
npx prisma init --db --output ../app/generated/prisma
```

This command:

- Authenticates you with Prisma Console (if needed)
- Prompts for **region** and **project name**
- **Creates a cloud Prisma Postgres database**
- Generates:
  - `prisma/schema.prisma` (with correct output path)
  - `prisma.config.ts` (with dotenv import)
  - **`.env` with a `DATABASE_URL`**

**IMPORTANT**: Ensure the generated `.env` uses a `postgres://` URL scheme. If it generates `prisma+postgres://`, replace it with the standard TCP connection string available in the Prisma Console.

```env
DATABASE_URL="postgres://..."
```

**IMPORTANT**: Do NOT use `npx prisma init` without `--db` as this only creates local files without a database.

## CORRECT PRISMA CONFIG (prisma.config.ts)

When using `npx prisma init --db`, the `prisma.config.ts` is **auto-generated** with the correct configuration:

```typescript
import "dotenv/config"; // ✅ Auto-included by prisma init --db
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // ✅ NO engine property - removed in Prisma 7
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

**Note**: If you need to manually create this file, ensure `import "dotenv/config"` is at the top.

## CORRECT SCHEMA CONFIGURATION (prisma/schema.prisma)

Update the generated `prisma/schema.prisma` file:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "postgresql"
  // ✅ NO url here - now configured in prisma.config.ts
}

// Example User model for testing
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## CORRECT GLOBAL PRISMA CLIENT

Create `lib/prisma.ts` file:

```typescript
import { PrismaClient } from "../app/generated/prisma/client"; // ✅ CRITICAL: Include /client
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

## ADD NPM SCRIPTS TO PACKAGE.JSON

Update your `package.json` to include these scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "db:test": "tsx scripts/test-database.ts",
    "db:studio": "prisma studio"
  }
}
```

## CREATE TEST SCRIPT

Create `scripts/test-database.ts` to verify your setup:

```typescript
import "dotenv/config"; // ✅ CRITICAL: Load environment variables
import prisma from "../lib/prisma";

async function testDatabase() {
  console.log("🔍 Testing Prisma Postgres connection...\n");

  try {
    // Test 1: Check connection
    console.log("✅ Connected to database!");

    // Test 2: Create a test user
    console.log("\n📝 Creating a test user...");
    const newUser = await prisma.user.create({
      data: {
        email: "demo@example.com",
        name: "Demo User",
      },
    });
    console.log("✅ Created user:", newUser);

    // Test 3: Fetch all users
    console.log("\n📋 Fetching all users...");
    const allUsers = await prisma.user.findMany();
    console.log(`✅ Found ${allUsers.length} user(s):`);
    allUsers.forEach((user) => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    console.log("\n🎉 All tests passed! Your database is working perfectly.\n");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

testDatabase();
```

## CORRECT API ROUTE IMPLEMENTATION (App Router)

Create `app/api/users/route.ts` with GET and POST handlers:

```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
```

## CORRECT USAGE IN SERVER COMPONENTS

Update `app/page.tsx` to display users from the database:

```typescript
import prisma from "../lib/prisma"

export default async function Home() {
  let users: Array<{
    id: number
    email: string
    name: string | null
    createdAt: Date
    updatedAt: Date
  }> = []
  let error = null

  try {
    users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (e) {
    console.error("Error fetching users:", e)
    error = "Failed to load users. Make sure your DATABASE_URL is configured."
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Users from Database</h1>
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : users.length === 0 ? (
        <p>No users yet. Create one using the API at /api/users</p>
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="border p-4 rounded">
              <p className="font-semibold">{user.name || "No name"}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
```

## COMPLETE SETUP WORKFLOW

User should follow these steps (AI should provide these instructions):

1. **Install dependencies**:

   ```bash
   npm install prisma tsx --save-dev
   npm install @prisma/adapter-pg @prisma/client dotenv
   ```

2. **Initialize Prisma AND create Prisma Postgres database** (⚠️ USER MUST RUN MANUALLY):

   > **AI ASSISTANT**: Ask the user to run this command in their own terminal. This is interactive and requires user input. Wait for the user to confirm completion before continuing.

   ```bash
   npx prisma init --db --output ../app/generated/prisma
   ```

   The user should follow the terminal prompts to:
   - Authenticate with Prisma Console (if needed)
   - Choose a region (e.g., us-east-1)
   - Name your project

   Once complete, this creates `prisma/schema.prisma`, `prisma.config.ts`, AND `.env` with the `DATABASE_URL`.

   **User should confirm when done** so the AI can proceed with the next steps.

3. **Verify `.env` was created** - Ensure `DATABASE_URL` uses `postgres://`. If it uses `prisma+postgres://`, change it to the TCP connection string.

   ```env
   DATABASE_URL="postgres://..."
   ```

   **Do NOT invent or manually change this URL. Use the one from Prisma Console.**

4. **Update `prisma/schema.prisma`** - Add the User model (generator and datasource are already configured):

   ```prisma
   model User {
     id        Int      @id @default(autoincrement())
     email     String   @unique
     name      String?
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt
   }
   ```

5. **Create `lib/prisma.ts`** with correct import path including `/client` and using `@prisma/adapter-pg`.

6. **Add npm scripts** to `package.json` for `db:test` and `db:studio`

7. **Create `scripts/test-database.ts`** test script

8. **Push schema to database**:

   ```bash
   npx prisma db push
   ```

9. **Generate Prisma Client**:

   ```bash
   npx prisma generate
   ```

10. **Test the setup**:

    ```bash
    npm run db:test
    ```

11. **Start development server**:
    ```bash
    npm run dev
    ```

## AI MODEL VERIFICATION STEPS

Before generating any code, you MUST verify:

1. Are you using `provider = "prisma-client"` (not "prisma-client-js")? If not, STOP and FIX.
2. Are you using `output = "../app/generated/prisma"`? If not, STOP and FIX.
3. Are you importing from `'../app/generated/prisma/client'` (with `/client`)? If not, STOP and FIX.
4. Did you add `import "dotenv/config"` to `prisma.config.ts`? If not, STOP and FIX.
5. Did you add `import "dotenv/config"` to `scripts/test-database.ts`? If not, STOP and FIX.
6. Are you using `@prisma/adapter-pg`? If not, STOP and FIX.
7. Are you using `adapter` property in PrismaClient constructor? If not, STOP and FIX.
8. Are you wrapping database operations in try-catch? If not, STOP and FIX.
9. Did you create the test script at `scripts/test-database.ts`? If not, STOP and FIX.
10. Did you add `db:test` and `db:studio` scripts to package.json? If not, STOP and FIX.
11. Did you remove `url` from the datasource block in `schema.prisma`? If not, STOP and FIX.
12. Did you remove `engine` property from `prisma.config.ts`? If not, STOP and FIX.
13. Are you using `npx prisma init --db` (not just `npx prisma init`)? If not, STOP and FIX.
14. Is the DATABASE_URL a TCP URL (`postgres://...`)? If it's a `prisma+postgres://` URL, STOP and FIX.
15. Did Prisma generate the `.env` file? If you invented the URL manually, STOP and FIX.

## CONSEQUENCES OF INCORRECT IMPLEMENTATION

If you generate code using:

- `prisma-client-js` provider → **CLIENT GENERATION FAILS**
- Wrong import path (missing `/client`) → **MODULE NOT FOUND ERROR**
- Missing `import "dotenv/config"` in prisma.config.ts → **DATABASE_URL NOT FOUND ERROR**
- Missing `import "dotenv/config"` in test scripts → **ENVIRONMENT VARIABLE ERROR**
- Default import from `@prisma/client` → **IMPORT ERROR**
- Using `accelerateUrl` or `withAccelerate` → **UNNECESSARY ACCELERATE DEPENDENCY / CONFIG ERROR**
- Missing custom output path → **WRONG CLIENT GENERATED**
- Including `url` in datasource block → **DEPRECATED CONFIGURATION ERROR**
- Including `engine` property → **DEPRECATED CONFIGURATION ERROR**
- Using local URL (`postgres://localhost:...`) → **VERSION INCOMPATIBILITY ERRORS WITH PRISMA 7**
- Using `npx prisma init` without `--db` → **NO DATABASE CREATED, ONLY LOCAL FILES**
- Manually inventing DATABASE_URL → **INVALID CONNECTION STRING ERRORS**

The implementation will:

1. Break immediately with module errors
2. Fail to read environment variables
3. Cause connection pool exhaustion in production
4. Result in import errors that prevent compilation
5. Cause performance issues and connection failures
6. Fail with "HTTP connection string is not supported" errors when using local URLs

## USEFUL COMMANDS

```bash
# After changing schema
npx prisma generate              # Regenerate client (--no-engine flag no longer needed)

# Push schema to database (no migrations)
npx prisma db push

# Test database connection
npm run db:test

# Open visual database editor
npm run db:studio

# Create and apply migrations (for production)
npx prisma migrate dev --name your_migration_name
```

## TESTING WORKFLOW

After setup, test with these steps:

1. **Test database connection**:

   ```bash
   npm run db:test
   ```

   Should create a demo user and display it.

2. **Open Prisma Studio**:

   ```bash
   npm run db:studio
   ```

   Visual interface at `localhost:5555` to view/edit data.

3. **Test API routes**:

   ```bash
   # Create a user via API
   curl -X POST http://localhost:3000/api/users \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","name":"Test User"}'

   # Get all users
   curl http://localhost:3000/api/users
   ```

4. **View in browser**:
   Open `localhost:3000` to see users displayed on the homepage.

## AI MODEL RESPONSE TEMPLATE

When asked about Prisma + Next.js implementation, you MUST:

1. ONLY use code patterns from this guide
2. NEVER suggest deprecated approaches
3. ALWAYS use the exact patterns shown above
4. ALWAYS include `/client` in import paths
5. ALWAYS add `import "dotenv/config"` to prisma.config.ts
6. ALWAYS add `import "dotenv/config"` to test scripts
7. ALWAYS create the test script at `scripts/test-database.ts`
8. ALWAYS add npm scripts for `db:test` and `db:studio`
9. ALWAYS include error handling in API routes and server components
10. ALWAYS use the global prisma instance from `lib/prisma.ts`
11. ALWAYS use `@prisma/adapter-pg` and `adapter` property
12. NEVER include `url` in the datasource block of schema.prisma
13. NEVER include `engine` property in prisma.config.ts
14. ALWAYS ask the user to run `npx prisma init --db --output ../app/generated/prisma` **manually in their own terminal** (this command is interactive and requires user input for region and project name)
15. ALWAYS wait for user confirmation after they run the interactive `prisma init --db` command before proceeding
16. NEVER attempt to run interactive commands yourself - ask the user to do it
17. NEVER use `prisma+postgres://` URLs - ONLY `postgres://` TCP URLs
18. NEVER manually invent or fabricate DATABASE_URL values
19. ALWAYS let Prisma generate the `.env` file with the real DATABASE_URL (and ensure it's correct type)
20. VERIFY your response against ALL the patterns shown here before responding

Remember: There are NO EXCEPTIONS to these rules. Every requirement is MANDATORY for the setup to work.

## Security Best Practices

### Database Security

- **Never expose DATABASE_URL** in client-side code or logs
- Use environment variables for all sensitive configuration
- Implement proper input validation and sanitization
- Use parameterized queries (automatically handled by Prisma)
- Implement rate limiting for API endpoints
- Use HTTPS in production

### Authentication & Authorization

- Implement proper user authentication (consider using libraries like Better Auth mentioned in the project rules)
- Validate user permissions on sensitive operations
- Use role-based access control (RBAC) for complex applications
- Implement proper session management
- Never store passwords in plain text

### Data Protection

- Encrypt sensitive data at rest and in transit
- Implement proper data backup strategies
- Use database constraints to maintain data integrity
- Log security events for monitoring

## Performance Optimization

### Query Optimization

- Use `select` to fetch only required fields:
  ```typescript
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });
  ```
- Implement pagination for large datasets
- Use `include` strategically to avoid N+1 queries
- Leverage database indexes on frequently queried fields

### Connection Management

- Reuse the global Prisma instance to avoid connection overhead
- Implement connection pooling appropriately
- Monitor connection usage and implement proper cleanup

### Caching Strategies

- Implement application-level caching for frequently accessed data
- Use Next.js caching mechanisms for server components
- Consider database query result caching

### Monitoring & Profiling

- Monitor query performance with Prisma's logging
- Use database monitoring tools
- Profile slow queries and optimize accordingly

## Troubleshooting

### Common Issues

**Connection Errors**

- Verify DATABASE_URL is correct and accessible
- Check network connectivity to database
- Ensure database server is running and accepting connections

**Client Generation Errors**

- Run `npx prisma generate` after schema changes
- Verify the output path matches your import statements
- Check for TypeScript compilation errors

**Migration Issues**

- Ensure schema changes are properly migrated
- Use `npx prisma db push` for development
- Use proper migration workflows for production

**Performance Problems**

- Profile slow queries using Prisma's query logging
- Check for N+1 query issues
- Optimize database indexes

### Debug Mode

Enable Prisma's debug logging:

```typescript
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
```

### Getting Help

- Check Prisma documentation: https://www.prisma.io/docs
- Review Next.js App Router documentation
- Consult Prisma Discord or GitHub issues for specific problems
  Avoid abbreviations unless they are widely understood.
  Use pronounceable names and maintain consistent naming conventions.

Small Functions

    Ensure functions are small and perform a single task.
    Avoid flag arguments and side effects.
    Each function should operate at a single level of abstraction.

Single Responsibility Principle

    Each class or function should have only one reason to change.
    Separate concerns and encapsulate responsibilities appropriately.

Clean Formatting

    Use consistent indentation and spacing.
    Separate code blocks with new lines where needed for readability.

Avoid Comments

    Write self-explanatory code that doesn’t require comments.
    Use comments only to explain complex logic or public APIs.

Error Handling

    Use exceptions rather than return codes.
    Avoid catching generic exceptions.
    Fail fast and handle exceptions at a high level.

Avoid Duplication

    Extract common logic into functions or classes.
    DRY – Don’t Repeat Yourself.

Code Smells to Flag

    Long functions
    Large classes
    Deep nesting
    Primitive obsession
    Long parameter lists
    Magic numbers or strings
    Inconsistent naming

Review Style

    Maintain a strict but constructive tone.
    Use bullet points to list issues.
    Provide alternatives and improved code suggestions.

**General Principles:**

- Always use WordPress-specific functions (e.g., `wp_*()`) and classes.
- Follow the WordPress Coding Standards.
- Prioritize performance optimization (e.g., caching, database queries).
- Ensure code compatibility with the latest WordPress version and popular plugins.
- Include clear and concise comments to explain code functionality.
- Optimize code for readability and performance. Utilize SOLID principles.
- Always prioritize readability and clarity.
- For algorithm-related code, include explanations of the approach used.
- Write code with good maintainability practices, including comments on why certain design - decisions were made.
- Handle edge cases and write clear exception handling.
- For libraries or external dependencies, mention their usage and purpose in comments.
- Use consistent naming conventions and follow language-specific best practices.
- Write concise, efficient, and idiomatic code that is also easily understandable.

**Plugin Development:**

- Focus on plugin-specific code: actions, filters, shortcodes, etc.
- Use the `WP_PLUGIN_DIR` constant for plugin directory paths.
- Consider using `WP_DEBUG` for debugging purposes.

**Theme Development:**

- Integrate with WordPress's theme system: template tags, hooks, customizer settings.
- Use `wp_enqueue_style()` and `wp_enqueue_script()` for assets.
- Consider using `get_template_directory()` and `get_stylesheet_directory()` for theme paths.

**General Coding:**

- Use type hints where appropriate.
- Use inline documentation for functions and classes.
- When amending a piece of code, write only the part that you amended.

# Custom instructions for WordPress projects

Clean Code Code Review Guidelines

When reviewing code, adhere to the following principles derived from Uncle Bob's Clean Code:
Meaningful Names

    Use descriptive and unambiguous names.
    Avoid abbreviations unless they are widely understood.
    Use pronounceable names and maintain consistent naming conventions.

Small Functions

    Ensure functions are small and perform a single task.
    Avoid flag arguments and side effects.
    Each function should operate at a single level of abstraction.

Single Responsibility Principle

    Each class or function should have only one reason to change.
    Separate concerns and encapsulate responsibilities appropriately.

Clean Formatting

    Use consistent indentation and spacing.
    Separate code blocks with new lines where needed for readability.

Avoid Comments

    Write self-explanatory code that doesn’t require comments.
    Use comments only to explain complex logic or public APIs.

Error Handling

    Use exceptions rather than return codes.
    Avoid catching generic exceptions.
    Fail fast and handle exceptions at a high level.

Avoid Duplication

    Extract common logic into functions or classes.
    DRY – Don’t Repeat Yourself.

Code Smells to Flag

    Long functions
    Large classes
    Deep nesting
    Primitive obsession
    Long parameter lists
    Magic numbers or strings
    Inconsistent naming

Review Style

    Maintain a strict but constructive tone.
    Use bullet points to list issues.
    Provide alternatives and improved code suggestions.

**General Principles:**

- Always use WordPress-specific functions (e.g., `wp_*()`) and classes.
- Follow the WordPress Coding Standards.
- Prioritize performance optimization (e.g., caching, database queries).
- Ensure code compatibility with the latest WordPress version and popular plugins.
- Include clear and concise comments to explain code functionality.
- Optimize code for readability and performance. Utilize SOLID principles.
- Always prioritize readability and clarity.
- For algorithm-related code, include explanations of the approach used.
- Write code with good maintainability practices, including comments on why certain design - decisions were made.
- Handle edge cases and write clear exception handling.
- For libraries or external dependencies, mention their usage and purpose in comments.
- Use consistent naming conventions and follow language-specific best practices.
- Write concise, efficient, and idiomatic code that is also easily understandable.

**Plugin Development:**

- Focus on plugin-specific code: actions, filters, shortcodes, etc.
- Use the `WP_PLUGIN_DIR` constant for plugin directory paths.
- Consider using `WP_DEBUG` for debugging purposes.

**Theme Development:**

- Integrate with WordPress's theme system: template tags, hooks, customizer settings.
- Use `wp_enqueue_style()` and `wp_enqueue_script()` for assets.
- Consider using `get_template_directory()` and `get_stylesheet_directory()` for theme paths.

**General Coding:**

- Use type hints where appropriate.
- Use inline documentation for functions and classes.
- When amending a piece of code, write only the part that you amended.

# Terraform Coding Guidelines

## Code Style & Structure

- Always use [Terraform v1.9+] features where possible.
- Use consistent indentation (2 spaces) for readability.
- Group related resources logically (e.g., networking, compute, storage).
- Keep resource blocks short and well-organised—avoid large, complex blocks.
- Follow the PEP 8 style guide for Python.

## Module Usage

- Prefer reusable modules over repeating code.
- Use standard module structure: `main.tf`, `variables.tf`, `outputs.tf`, `README.md`.
- For shared modules, source them from the approved GitHub org or Terraform Registry.

## Variables & Outputs

- All variables must have descriptions and types defined.
- Avoid hardcoding values—use variables or locals.
- Outputs should be meaningful and named consistently for reuse in parent modules.

## Security & Secrets

- Never hardcode secrets or credentials.
- Use environment variables or secure backends like Azure Key Vault, AWS Secrets Manager, or Vault.
- Sensitive outputs should be marked with `sensitive = true`.

## Validation & Testing

- Include `terraform validate` and `terraform fmt -check` in CI.
- Use `pre-commit` hooks to enforce formatting and checks before merge.
- Run `terraform plan` with a named workspace in all pipelines.

## Naming & Tags

- Use consistent resource naming with project, environment, and region prefixes (e.g., `app-dev-uks-vm1`).
- All resources must have tags for `Name`, `Environment`, and `Owner`.

## Comments & Docs

- Add comments for complex resources or unusual patterns.
- Include a README in each module with usage examples and input/output documentation.

### Performance Optimization

- Use Next.js's Image component and lazy loading for off-screen content
- Leverage automatic code splitting and keep bundle sizes small
- Utilize Server Components where appropriate for improved performance
- Properly distinguish between client and server components with 'use client' directive
- Implement proper caching strategies with Next.js cache mechanisms
- Monitor and optimize Core Web Vitals (LCP, INP, CLS)
- Ensure fast loading times across all devices and regions

## Content Management with MDX or a Headless CMS

### Content Structure and Authoring

- Organize blog posts and event announcements with consistent frontmatter (tags, date, title, description, author)
- Structure content by categories (software topics, event types, skill levels)
- Support multiple authors and contributors with proper attribution
- Use proper directory structure and naming conventions for content organization
- Write in Markdown/MDX with proper formatting for headings, lists, and code blocks
- Follow a consistent date format (YYYY-MM-DD) and use tags consistently
- Add relevant images with proper alt text and create meaningful descriptions for SEO
- Include code snippets with proper syntax highlighting
- Maintain contributor guidelines for consistent content quality

### Content Querying and Display

- Use efficient data fetching patterns with Next.js data fetching mechanisms
- Implement tag-based and category-based filtering for content discovery
- Create content recommendation features for related posts
- Build author profile pages and author-specific content collections
- Create reusable components for displaying blog posts and events responsively
- Style code blocks for readability and format dates consistently
- Display tags with proper styling and filtering functionality
- Implement search functionality for content discovery

## Community Engagement Features

### Event Management

- Create dedicated pages for upcoming community events and sessions
- Implement calendar integration for event scheduling
- Build registration/RSVP functionality for community events
- Display event details (date, time, location, speakers, topics)
- Create archives of past events with resources and recordings
- Implement notification systems for upcoming events

### User Interaction

- Build comment systems for blog posts (native or using third-party solutions)
- Implement social sharing features for content amplification
- Create member profiles and contribution tracking
- Build newsletter signup functionality for community updates
- Implement feedback mechanisms for content and events
- Design community contribution guidelines and submission forms

## SEO Optimization

### Meta Tags, Structured Data, and Content Strategy

- Implement proper title and description meta tags for each page using Next.js Metadata API
- Use OpenGraph and Twitter card meta tags for social sharing
- Create structured data for blog posts and events (schema.org) and ensure canonical URLs
- Implement proper robots.txt and sitemap.xml files
- Create unique, valuable content with natural keyword usage and internal linking
- Use descriptive, SEO-friendly URLs and focus on readability and engagement
- Optimize for topic-specific keywords relevant to the software engineering community

### Performance for SEO

- Optimize Core Web Vitals for better search ranking
- Implement proper heading structure (H1, H2, H3, etc.)
- Ensure responsive design for mobile-first indexing
- Optimize images with proper size, format, and alt text using Next/Image
- Implement proper lazy loading of images and content
- Ensure fast page loads for improved user retention and engagement

## UI/UX Design for Community Websites

### Visual Design and User Experience

- Maintain consistent branding, color schemes, and typography across the platform
- Design with community identity and purpose in mind
- Implement responsive design for all devices with effective use of white space
- Optimize images for quality and performance
- Create intuitive navigation with clear categorization of content types
- Ensure fast loading times with smooth transitions and animations
- Implement proper form validation with clear user feedback
- Design clear content hierarchy for easy scanning and discovery
- Create visual distinctions between different content types (blog posts, events, resources)

### Accessibility

- Design for WCAG 2.1 AA compliance with semantic HTML elements
- Provide proper alt text for images and ensure sufficient color contrast
- Make all interactive elements keyboard accessible
- Test with screen readers for comprehensive accessibility
- Ensure content is accessible to users with various disabilities
- Implement proper ARIA attributes where necessary
- Create inclusive design for diverse community members

## CSS Framework Implementation: Tailwind CSS

### Implementation Strategy

- Plan complete implementation of Tailwind CSS 4.x.x
- Create consistent styling system with Tailwind aligned with community branding
- Build components using Tailwind utility classes
- Create responsive utility classes with Tailwind
- Use Tailwind configuration for theme variables
- Establish consistent UI/UX patterns across all content types
- Design flexible layouts for various content presentation needs

### Tailwind CSS Implementation

- Set up Tailwind CSS with appropriate configuration for Next.js
- Customize Tailwind theme to match the community's brand identity
- Utilize Tailwind's JIT (Just-In-Time) mode for optimized production builds
- Create custom utility classes when needed for special components
- Use Tailwind's plugin system for extending functionality
- Maintain accessibility during the transition
- Design cohesive components that function well across different content types

### Tailwind CSS v4.0 CSS-First Configuration

- Use CSS-first configuration approach introduced in Tailwind CSS
- Configure customizations directly in the CSS file where Tailwind is imported
- Eliminate the need for a separate `tailwind.config.js` file
- Use the `@theme` directive to customize colors, spacing, fonts, and other theme values
- Define custom utilities with the `@layer` directive
- Implement responsive variants using `@media` queries in combination with `@layer`
- Take advantage of CSS variables for dynamic theming
- Example:

```css
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", "sans-serif";
  --breakpoint-3xl: 1920px;
  --color-primary: #1d4ed8;
  --color-secondary: #4f46e5;
  --color-accent: #06b6d4;
  --color-surface-100: oklch(0.99 0 0);
  --color-surface-200: oklch(0.98 0.04 113.22);
  --color-surface-300: oklch(0.94 0.11 115.03);
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
  /* ... */
}

@layer components {
  .card-event {
    /* custom event card styles */
  }

  .card-post {
    /* custom blog post card styles */
  }
}
```

- Maintain a single source of truth for styling configuration
- Benefit from better CSS variable integration and reduced build complexity

### Component Development

- Develop components using Tailwind utility classes
- Create specialized components for different content types (posts, events, profiles)
- Build layouts using Tailwind's flex and grid utilities for content organization
- Design navigation components with Tailwind's utilities
- Implement responsive breakpoints using Tailwind's default or custom breakpoints
- Create React custom hooks for interactive functionality
- Build components that can be easily maintained by multiple contributors

### Testing and Validation

- Create visual regression tests to ensure UI consistency
- Test across multiple devices and browsers
- Validate responsive behavior at all breakpoints
- Ensure accessibility is maintained or improved
- Optimize performance with reduced CSS bundle size
- Test user journeys for different community member scenarios

## Analytics and Performance Monitoring

### Analytics and Performance

- Configure Google Analytics or Tag Manager with GDPR-compliant cookie consent
- Track user interactions, content engagement, and event participation
- Monitor page load times, Core Web Vitals, and JavaScript errors
- Implement error tracking and use Lighthouse for regular performance audits
- Set up conversion tracking for community sign-ups and event registrations
- Create custom dashboards for community growth metrics
- Analyze content performance to inform future content strategy

## Deployment and Hosting

### Build and Hosting Optimization

- Configure Next.js build with proper asset compression, caching, and bundling
- Leverage modern image formats (WebP, AVIF) and environment variables
- Choose appropriate hosting with CDN for global delivery
- Implement proper SSL certificates, caching headers, and CI/CD pipelines
- Set up staging environments for content previews before publishing
- Create automated backup systems for content and database
- Implement monitoring and alerts for system health
- always use the latest stable versions of Next.js, React, and Tailwind CSS
- alwayse use bun instead of npm or yarn for package management and script execution
- always use bun instead of npm or yarn for package management and script execution

## Community Content Development

### Content Planning

- Create an editorial calendar for regular posting
- Plan content around community focus areas and interests
- Balance content between different software engineering topics
- Focus on evergreen content when possible
- Address common questions in the software engineering field
- Create series for complex topics
- Coordinate with community contributors for diverse perspectives

### Writing Style and Guidelines

- Develop a consistent voice and tone for the community
- Write clear and concise introductions to complex topics
- Use subheadings to organize content for readability
- Include relevant examples and code snippets
- Create compelling calls-to-action for community engagement
- Edit thoroughly for clarity and technical accuracy
- Establish peer review processes for technical content

### Technical Content

- Include working code examples with proper syntax highlighting
- Explain complex concepts with simple analogies
- Use visuals (diagrams, screenshots) to illustrate points
- Reference official documentation where appropriate
- Include practical use cases and real-world applications
- Provide downloadable resources when applicable
- Create content at various technical levels for different audience segments

## References and Resources

- [React Documentation](https://react.dev/reference/react)
- [Next.js Documentation](https://nextjs.org/docs)
- [MDX Documentation](https://mdxjs.com/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS CSS-First Configuration](https://tailwindcss.com/docs/configuration)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Eitaa](https://developer.eitaa.com/docs)
- [Nextjs Examples](https://github.com/vercel/next.js/blob/canary/examples)

# always use zod for type safety and react-hook-form for forms and zustand for state management and hooks in the project

# Better Auth

> The most comprehensive authentication framework for TypeScript

## Table of Contents

### Adapters

- [Community Adapters](/llms.txt/docs/adapters/community-adapters.md): Integrate Better Auth with community made database adapters.
- [Drizzle ORM Adapter](/llms.txt/docs/adapters/drizzle.md): Integrate Better Auth with Drizzle ORM.
- [MongoDB Adapter](/llms.txt/docs/adapters/mongo.md): Integrate Better Auth with MongoDB.
- [MS SQL](/llms.txt/docs/adapters/mssql.md): Integrate Better Auth with MS SQL.
- [MySQL](/llms.txt/docs/adapters/mysql.md): Integrate Better Auth with MySQL.
- [Other Relational Databases](/llms.txt/docs/adapters/other-relational-databases.md): Integrate Better Auth with other relational databases.
- [PostgreSQL](/llms.txt/docs/adapters/postgresql.md): Integrate Better Auth with PostgreSQL.
- [Prisma](/llms.txt/docs/adapters/prisma.md): Integrate Better Auth with Prisma.
- [SQLite](/llms.txt/docs/adapters/sqlite.md): Integrate Better Auth with SQLite.

### Authentication

- [Apple](/llms.txt/docs/authentication/apple.md): Apple provider setup and usage.
- [Atlassian](/llms.txt/docs/authentication/atlassian.md): Atlassian provider setup and usage.
- [Cognito](/llms.txt/docs/authentication/cognito.md): Amazon Cognito provider setup and usage.
- [Discord](/llms.txt/docs/authentication/discord.md): Discord provider setup and usage.
- [Dropbox](/llms.txt/docs/authentication/dropbox.md): Dropbox provider setup and usage.
- [Email & Password](/llms.txt/docs/authentication/email-password.md): Implementing email and password authentication with Better Auth.
- [Facebook](/llms.txt/docs/authentication/facebook.md): Facebook provider setup and usage.
- [Figma](/llms.txt/docs/authentication/figma.md): Figma provider setup and usage.
- [GitHub](/llms.txt/docs/authentication/github.md): GitHub provider setup and usage.
- [GitLab](/llms.txt/docs/authentication/gitlab.md): GitLab provider setup and usage.
- [Google](/llms.txt/docs/authentication/google.md): Google provider setup and usage.
- [Hugging Face](/llms.txt/docs/authentication/huggingface.md): Hugging Face provider setup and usage.
- [Kakao](/llms.txt/docs/authentication/kakao.md): Kakao provider setup and usage.
- [Kick](/llms.txt/docs/authentication/kick.md): Kick provider setup and usage.
- [LINE](/llms.txt/docs/authentication/line.md): LINE provider setup and usage.
- [Linear](/llms.txt/docs/authentication/linear.md): Linear provider setup and usage.
- [LinkedIn](/llms.txt/docs/authentication/linkedin.md): LinkedIn Provider
- [Microsoft](/llms.txt/docs/authentication/microsoft.md): Microsoft provider setup and usage.
- [Naver](/llms.txt/docs/authentication/naver.md): Naver provider setup and usage.
- [Notion](/llms.txt/docs/authentication/notion.md): Notion provider setup and usage.
- [Other Social Providers](/llms.txt/docs/authentication/other-social-providers.md): Other social providers setup and usage.
- [Paybin](/llms.txt/docs/authentication/paybin.md): Paybin provider setup and usage.
- [PayPal](/llms.txt/docs/authentication/paypal.md): Paypal provider setup and usage.
- [Polar](/llms.txt/docs/authentication/polar.md): Polar provider setup and usage.
- [Reddit](/llms.txt/docs/authentication/reddit.md): Reddit provider setup and usage.
- [Roblox](/llms.txt/docs/authentication/roblox.md): Roblox provider setup and usage.
- [Salesforce](/llms.txt/docs/authentication/salesforce.md): Salesforce provider setup and usage.
- [Slack](/llms.txt/docs/authentication/slack.md): Slack provider setup and usage.
- [Spotify](/llms.txt/docs/authentication/spotify.md): Spotify provider setup and usage.
- [TikTok](/llms.txt/docs/authentication/tiktok.md): TikTok provider setup and usage.
- [Twitch](/llms.txt/docs/authentication/twitch.md): Twitch provider setup and usage.
- [Twitter (X)](/llms.txt/docs/authentication/twitter.md): Twitter provider setup and usage.
- [Vercel](/llms.txt/docs/authentication/vercel.md): Vercel provider setup and usage.
- [VK](/llms.txt/docs/authentication/vk.md): VK ID Provider
- [Zoom](/llms.txt/docs/authentication/zoom.md): Zoom provider setup and usage.

### Basic Usage

- [Basic Usage](/llms.txt/docs/basic-usage.md): Getting started with Better Auth

### Comparison

- [Comparison](/llms.txt/docs/comparison.md): Comparison of Better Auth versus over other auth libraries and services.

### Concepts

- [API](/llms.txt/docs/concepts/api.md): Better Auth API.
- [CLI](/llms.txt/docs/concepts/cli.md): Built-in CLI for managing your project.
- [Client](/llms.txt/docs/concepts/client.md): Better Auth client library for authentication.
- [Cookies](/llms.txt/docs/concepts/cookies.md): Learn how cookies are used in Better Auth.
- [Database](/llms.txt/docs/concepts/database.md): Learn how to use a database with Better Auth.
- [Email](/llms.txt/docs/concepts/email.md): Learn how to use email with Better Auth.
- [Hooks](/llms.txt/docs/concepts/hooks.md): Better Auth Hooks let you customize BetterAuth's behavior
- [OAuth](/llms.txt/docs/concepts/oauth.md): How Better Auth handles OAuth
- [Plugins](/llms.txt/docs/concepts/plugins.md): Learn how to use plugins with Better Auth.
- [Rate Limit](/llms.txt/docs/concepts/rate-limit.md): How to limit the number of requests a user can make to the server in a given time period.
- [Session Management](/llms.txt/docs/concepts/session-management.md): Better Auth session management.
- [TypeScript](/llms.txt/docs/concepts/typescript.md): Better Auth TypeScript integration.
- [User & Accounts](/llms.txt/docs/concepts/users-accounts.md): User and account management.

### Errors

- [Account already linked to different user](/llms.txt/docs/errors/account_already_linked_to_different_user.md): The account is already linked to a different user.
- [Email doesn't match](/llms.txt/docs/errors/email_doesn't_match.md): The email doesn't match the email of the account.
- [Email not found](/llms.txt/docs/errors/email_not_found.md): The provider did not return an email address.
- [Errors](/llms.txt/docs/errors.md): Errors that can occur in Better Auth.
- [Invalid callback request](/llms.txt/docs/errors/invalid_callback_request.md): The callback request is invalid.
- [No callback URL](/llms.txt/docs/errors/no_callback_url.md): The callback URL was not found in the request.
- [No code](/llms.txt/docs/errors/no_code.md): The code was not found in the request.
- [OAuth provider not found](/llms.txt/docs/errors/oauth_provider_not_found.md): The OAuth provider was not found.
- [Signup disabled](/llms.txt/docs/errors/signup_disabled.md): Signup disabled error
- [State mismatch](/llms.txt/docs/errors/state_mismatch.md): The state parameter in the request doesn't match the state parameter in the cookie.
- [State not found](/llms.txt/docs/errors/state_not_found.md): The state parameter was not found in the request.
- [Unable to get user info](/llms.txt/docs/errors/unable_to_get_user_info.md): The user info was not found in the request.
- [Unable to link account](/llms.txt/docs/errors/unable_to_link_account.md): The account could not be linked.
- [Unknown error](/llms.txt/docs/errors/unknown.md): An unknown error occurred.

### Examples

- [Astro Example](/llms.txt/docs/examples/astro.md): Better Auth Astro example.
- [Next.js Example](/llms.txt/docs/examples/next-js.md): Better Auth Next.js example.
- [Nuxt Example](/llms.txt/docs/examples/nuxt.md): Better Auth Nuxt example.
- [Remix Example](/llms.txt/docs/examples/remix.md): Better Auth Remix example.
- [SvelteKit Example](/llms.txt/docs/examples/svelte-kit.md): Better Auth SvelteKit example.

### Guides

- [Migrating from Auth0 to Better Auth](/llms.txt/docs/guides/auth0-migration-guide.md): A step-by-step guide to transitioning from Auth0 to Better Auth.
- [Browser Extension Guide](/llms.txt/docs/guides/browser-extension-guide.md): A step-by-step guide to creating a browser extension with Better Auth.
- [Migrating from Clerk to Better Auth](/llms.txt/docs/guides/clerk-migration-guide.md): A step-by-step guide to transitioning from Clerk to Better Auth.
- [Create a Database Adapter](/llms.txt/docs/guides/create-a-db-adapter.md): Learn how to create a custom database adapter for Better-Auth
- [Migrating from Auth.js to Better Auth](/llms.txt/docs/guides/next-auth-migration-guide.md): A step-by-step guide to transitioning from Auth.js to Better Auth.
- [Optimizing for Performance](/llms.txt/docs/guides/optimizing-for-performance.md): A guide to optimizing your Better Auth application for performance.
- [SAML SSO with Okta](/llms.txt/docs/guides/saml-sso-with-okta.md): A guide to integrating SAML Single Sign-On (SSO) with Better Auth, featuring Okta
- [Migrating from Supabase Auth to Better Auth](/llms.txt/docs/guides/supabase-migration-guide.md): A step-by-step guide to transitioning from Supabase Auth to Better Auth.
- [Create your first plugin](/llms.txt/docs/guides/your-first-plugin.md): A step-by-step guide to creating your first Better Auth plugin.

### Installation

- [Installation](/llms.txt/docs/installation.md): Learn how to configure Better Auth in your project.

### Integrations

- [Astro Integration](/llms.txt/docs/integrations/astro.md): Integrate Better Auth with Astro.
- [Convex Integration](/llms.txt/docs/integrations/convex.md): Integrate Better Auth with Convex.
- [Elysia Integration](/llms.txt/docs/integrations/elysia.md): Integrate Better Auth with Elysia.
- [Expo Integration](/llms.txt/docs/integrations/expo.md): Integrate Better Auth with Expo.
- [Express Integration](/llms.txt/docs/integrations/express.md): Integrate Better Auth with Express.
- [Better Auth Fastify Integration Guide](/llms.txt/docs/integrations/fastify.md): Learn how to seamlessly integrate Better Auth with your Fastify application.
- [Hono Integration](/llms.txt/docs/integrations/hono.md): Integrate Better Auth with Hono.
- [Lynx Integration](/llms.txt/docs/integrations/lynx.md): Integrate Better Auth with Lynx cross-platform framework.
- [NestJS Integration](/llms.txt/docs/integrations/nestjs.md): Integrate Better Auth with NestJS.
- [Next.js integration](/llms.txt/docs/integrations/next.md): Integrate Better Auth with Next.js.
- [Nitro Integration](/llms.txt/docs/integrations/nitro.md): Integrate Better Auth with Nitro.
- [Nuxt Integration](/llms.txt/docs/integrations/nuxt.md): Integrate Better Auth with Nuxt.
- [Remix Integration](/llms.txt/docs/integrations/remix.md): Integrate Better Auth with Remix.
- [SolidStart Integration](/llms.txt/docs/integrations/solid-start.md): Integrate Better Auth with SolidStart.
- [SvelteKit Integration](/llms.txt/docs/integrations/svelte-kit.md): Integrate Better Auth with SvelteKit.
- [TanStack Start Integration](/llms.txt/docs/integrations/tanstack.md): Integrate Better Auth with TanStack Start.
- [Waku Integration](/llms.txt/docs/integrations/waku.md): Integrate Better Auth with Waku.

### Introduction

- [Introduction](/llms.txt/docs/introduction.md): Introduction to Better Auth.

### Plugins

- [Two-Factor Authentication (2FA)](/llms.txt/docs/plugins/2fa.md): Enhance your app's security with two-factor authentication.
- [Admin](/llms.txt/docs/plugins/admin.md): Admin plugin for Better Auth
- [Anonymous](/llms.txt/docs/plugins/anonymous.md): Anonymous plugin for Better Auth.
- [API Key](/llms.txt/docs/plugins/api-key.md): API Key plugin for Better Auth.
- [Autumn Billing](/llms.txt/docs/plugins/autumn.md): Better Auth Plugin for Autumn Billing
- [Bearer Token Authentication](/llms.txt/docs/plugins/bearer.md): Authenticate API requests using Bearer tokens instead of browser cookies
- [Captcha](/llms.txt/docs/plugins/captcha.md): Captcha plugin
- [Community Plugins](/llms.txt/docs/plugins/community-plugins.md): A list of recommended community plugins.
- [Creem](/llms.txt/docs/plugins/creem.md): Better Auth Plugin for Payment and Subscriptions using Creem
- [Device Authorization](/llms.txt/docs/plugins/device-authorization.md): OAuth 2.0 Device Authorization Grant for limited-input devices
- [Dodo Payments](/llms.txt/docs/plugins/dodopayments.md): Better Auth Plugin for Dodo Payments
- [Dub](/llms.txt/docs/plugins/dub.md): Better Auth Plugin for Lead Tracking using Dub links and OAuth Linking
- [Email OTP](/llms.txt/docs/plugins/email-otp.md): Email OTP plugin for Better Auth.
- [Generic OAuth](/llms.txt/docs/plugins/generic-oauth.md): Authenticate users with any OAuth provider
- [Have I Been Pwned](/llms.txt/docs/plugins/have-i-been-pwned.md): A plugin to check if a password has been compromised
- [JWT](/llms.txt/docs/plugins/jwt.md): Authenticate users with JWT tokens in services that can't use the session
- [Last Login Method](/llms.txt/docs/plugins/last-login-method.md): Track and display the last authentication method used by users
- [Magic link](/llms.txt/docs/plugins/magic-link.md): Magic link plugin
- [MCP](/llms.txt/docs/plugins/mcp.md): MCP provider plugin for Better Auth
- [Multi Session](/llms.txt/docs/plugins/multi-session.md): Learn how to use multi-session plugin in Better Auth.
- [OAuth Proxy](/llms.txt/docs/plugins/oauth-proxy.md): OAuth Proxy plugin for Better Auth
- [OIDC Provider](/llms.txt/docs/plugins/oidc-provider.md): Open ID Connect plugin for Better Auth that allows you to have your own OIDC provider.
- [One Tap](/llms.txt/docs/plugins/one-tap.md): One Tap plugin for Better Auth
- [One-Time Token Plugin](/llms.txt/docs/plugins/one-time-token.md): Generate and verify single-use token
- [Open API](/llms.txt/docs/plugins/open-api.md): Open API reference for Better Auth.
- [Organization](/llms.txt/docs/plugins/organization.md): The organization plugin allows you to manage your organization's members and teams.
- [Passkey](/llms.txt/docs/plugins/passkey.md): Passkey
- [Phone Number](/llms.txt/docs/plugins/phone-number.md): Phone number plugin
- [Polar](/llms.txt/docs/plugins/polar.md): Better Auth Plugin for Payment and Checkouts using Polar
- [System for Cross-domain Identity Management (SCIM)](/llms.txt/docs/plugins/scim.md): Integrate SCIM with your application.
- [Sign In With Ethereum (SIWE)](/llms.txt/docs/plugins/siwe.md): Sign in with Ethereum plugin for Better Auth
- [Single Sign-On (SSO)](/llms.txt/docs/plugins/sso.md): Integrate Single Sign-On (SSO) with your application.
- [Stripe](/llms.txt/docs/plugins/stripe.md): Stripe plugin for Better Auth to manage subscriptions and payments.
- [Username](/llms.txt/docs/plugins/username.md): Username plugin

### Reference

- [Contributing to BetterAuth](/llms.txt/docs/reference/contributing.md): A concise guide to contributing to BetterAuth
- [FAQ](/llms.txt/docs/reference/faq.md): Frequently asked questions about Better Auth.
- [Options](/llms.txt/docs/reference/options.md): Better Auth configuration options reference.
- [Resources](/llms.txt/docs/reference/resources.md): A curated collection of resources to help you learn and master Better Auth.
- [Security](/llms.txt/docs/reference/security.md): Better Auth security features.
- [Telemetry](/llms.txt/docs/reference/telemetry.md): Better Auth now collects anonymous telemetry data about general usage.

# shadcn/ui

> shadcn/ui is a collection of beautifully-designed, accessible components and a code distribution platform. It is built with TypeScript, Tailwind CSS, and Radix UI primitives. It supports multiple frameworks including Next.js, Vite, Remix, Astro, and more. Open Source. Open Code. AI-Ready. It also comes with a command-line tool to install and manage components and a registry system to publish and distribute code.

## Overview

- [Introduction](https://ui.shadcn.com/docs): Core principles—Open Code, Composition, Distribution, Beautiful Defaults, and AI-Ready design.
- [CLI](https://ui.shadcn.com/docs/cli): Command-line tool for installing and managing components.
- [components.json](https://ui.shadcn.com/docs/components-json): Configuration file for customizing the CLI and component installation.
- [Theming](https://ui.shadcn.com/docs/theming): Guide to customizing colors, typography, and design tokens.
- [Changelog](https://ui.shadcn.com/docs/changelog): Release notes and version history.
- [About](https://ui.shadcn.com/docs/about): Credits and project information.

## Installation

- [Next.js](https://ui.shadcn.com/docs/installation/next): Install shadcn/ui in a Next.js project.
- [Vite](https://ui.shadcn.com/docs/installation/vite): Install shadcn/ui in a Vite project.
- [Remix](https://ui.shadcn.com/docs/installation/remix): Install shadcn/ui in a Remix project.
- [Astro](https://ui.shadcn.com/docs/installation/astro): Install shadcn/ui in an Astro project.
- [Laravel](https://ui.shadcn.com/docs/installation/laravel): Install shadcn/ui in a Laravel project.
- [Gatsby](https://ui.shadcn.com/docs/installation/gatsby): Install shadcn/ui in a Gatsby project.
- [React Router](https://ui.shadcn.com/docs/installation/react-router): Install shadcn/ui in a React Router project.
- [TanStack Router](https://ui.shadcn.com/docs/installation/tanstack-router): Install shadcn/ui in a TanStack Router project.
- [TanStack Start](https://ui.shadcn.com/docs/installation/tanstack): Install shadcn/ui in a TanStack Start project.
- [Manual Installation](https://ui.shadcn.com/docs/installation/manual): Manually install shadcn/ui without the CLI.

## Components

### Form & Input

- [Form](https://ui.shadcn.com/docs/components/form): Building forms with React Hook Form and Zod validation.
- [Field](https://ui.shadcn.com/docs/components/field): Field component for form inputs with labels and error messages.
- [Button](https://ui.shadcn.com/docs/components/button): Button component with multiple variants.
- [Button Group](https://ui.shadcn.com/docs/components/button-group): Group multiple buttons together.
- [Input](https://ui.shadcn.com/docs/components/input): Text input component.
- [Input Group](https://ui.shadcn.com/docs/components/input-group): Input component with prefix and suffix addons.
- [Input OTP](https://ui.shadcn.com/docs/components/input-otp): One-time password input component.
- [Textarea](https://ui.shadcn.com/docs/components/textarea): Multi-line text input component.
- [Checkbox](https://ui.shadcn.com/docs/components/checkbox): Checkbox input component.
- [Radio Group](https://ui.shadcn.com/docs/components/radio-group): Radio button group component.
- [Select](https://ui.shadcn.com/docs/components/select): Select dropdown component.
- [Switch](https://ui.shadcn.com/docs/components/switch): Toggle switch component.
- [Slider](https://ui.shadcn.com/docs/components/slider): Slider input component.
- [Calendar](https://ui.shadcn.com/docs/components/calendar): Calendar component for date selection.
- [Date Picker](https://ui.shadcn.com/docs/components/date-picker): Date picker component combining input and calendar.
- [Combobox](https://ui.shadcn.com/docs/components/combobox): Searchable select component with autocomplete.
- [Label](https://ui.shadcn.com/docs/components/label): Form label component.

### Layout & Navigation

- [Accordion](https://ui.shadcn.com/docs/components/accordion): Collapsible accordion component.
- [Breadcrumb](https://ui.shadcn.com/docs/components/breadcrumb): Breadcrumb navigation component.
- [Navigation Menu](https://ui.shadcn.com/docs/components/navigation-menu): Accessible navigation menu with dropdowns.
- [Sidebar](https://ui.shadcn.com/docs/components/sidebar): Collapsible sidebar component for app layouts.
- [Tabs](https://ui.shadcn.com/docs/components/tabs): Tabbed interface component.
- [Separator](https://ui.shadcn.com/docs/components/separator): Visual divider between content sections.
- [Scroll Area](https://ui.shadcn.com/docs/components/scroll-area): Custom scrollable area with styled scrollbars.
- [Resizable](https://ui.shadcn.com/docs/components/resizable): Resizable panel layout component.

### Overlays & Dialogs

- [Dialog](https://ui.shadcn.com/docs/components/dialog): Modal dialog component.
- [Alert Dialog](https://ui.shadcn.com/docs/components/alert-dialog): Alert dialog for confirmation prompts.
- [Sheet](https://ui.shadcn.com/docs/components/sheet): Slide-out panel component (drawer).
- [Drawer](https://ui.shadcn.com/docs/components/drawer): Mobile-friendly drawer component using Vaul.
- [Popover](https://ui.shadcn.com/docs/components/popover): Floating popover component.
- [Tooltip](https://ui.shadcn.com/docs/components/tooltip): Tooltip component for additional context.
- [Hover Card](https://ui.shadcn.com/docs/components/hover-card): Card that appears on hover.
- [Context Menu](https://ui.shadcn.com/docs/components/context-menu): Right-click context menu.
- [Dropdown Menu](https://ui.shadcn.com/docs/components/dropdown-menu): Dropdown menu component.
- [Menubar](https://ui.shadcn.com/docs/components/menubar): Horizontal menubar component.
- [Command](https://ui.shadcn.com/docs/components/command): Command palette component (cmdk).

### Feedback & Status

- [Alert](https://ui.shadcn.com/docs/components/alert): Alert component for messages and notifications.
- [Toast](https://ui.shadcn.com/docs/components/toast): Toast notification component using Sonner.
- [Progress](https://ui.shadcn.com/docs/components/progress): Progress bar component.
- [Spinner](https://ui.shadcn.com/docs/components/spinner): Loading spinner component.
- [Skeleton](https://ui.shadcn.com/docs/components/skeleton): Skeleton loading placeholder.
- [Badge](https://ui.shadcn.com/docs/components/badge): Badge component for labels and status indicators.
- [Empty](https://ui.shadcn.com/docs/components/empty): Empty state component for no data scenarios.

### Display & Media

- [Avatar](https://ui.shadcn.com/docs/components/avatar): Avatar component for user profiles.
- [Card](https://ui.shadcn.com/docs/components/card): Card container component.
- [Table](https://ui.shadcn.com/docs/components/table): Table component for displaying data.
- [Data Table](https://ui.shadcn.com/docs/components/data-table): Advanced data table with sorting, filtering, and pagination.
- [Chart](https://ui.shadcn.com/docs/components/chart): Chart components using Recharts.
- [Carousel](https://ui.shadcn.com/docs/components/carousel): Carousel component using Embla Carousel.
- [Aspect Ratio](https://ui.shadcn.com/docs/components/aspect-ratio): Container that maintains aspect ratio.
- [Typography](https://ui.shadcn.com/docs/components/typography): Typography styles and components.
- [Item](https://ui.shadcn.com/docs/components/item): Generic item component for lists and menus.
- [Kbd](https://ui.shadcn.com/docs/components/kbd): Keyboard shortcut display component.

### Misc

- [Collapsible](https://ui.shadcn.com/docs/components/collapsible): Collapsible container component.
- [Toggle](https://ui.shadcn.com/docs/components/toggle): Toggle button component.
- [Toggle Group](https://ui.shadcn.com/docs/components/toggle-group): Group of toggle buttons.
- [Pagination](https://ui.shadcn.com/docs/components/pagination): Pagination component for lists and tables.

## Dark Mode

- [Dark Mode](https://ui.shadcn.com/docs/dark-mode): Overview of dark mode implementation.
- [Dark Mode - Next.js](https://ui.shadcn.com/docs/dark-mode/next): Dark mode setup for Next.js.
- [Dark Mode - Vite](https://ui.shadcn.com/docs/dark-mode/vite): Dark mode setup for Vite.
- [Dark Mode - Astro](https://ui.shadcn.com/docs/dark-mode/astro): Dark mode setup for Astro.
- [Dark Mode - Remix](https://ui.shadcn.com/docs/dark-mode/remix): Dark mode setup for Remix.

## Forms

- [Forms Overview](https://ui.shadcn.com/docs/forms): Guide to building forms with shadcn/ui.
- [React Hook Form](https://ui.shadcn.com/docs/forms/react-hook-form): Using shadcn/ui with React Hook Form.
- [TanStack Form](https://ui.shadcn.com/docs/forms/tanstack-form): Using shadcn/ui with TanStack Form.
- [Forms - Next.js](https://ui.shadcn.com/docs/forms/next): Building forms in Next.js with Server Actions.

## Advanced

- [Monorepo](https://ui.shadcn.com/docs/monorepo): Using shadcn/ui in a monorepo setup.
- [React 19](https://ui.shadcn.com/docs/react-19): React 19 support and migration guide.
- [Tailwind CSS v4](https://ui.shadcn.com/docs/tailwind-v4): Tailwind CSS v4 support and setup.
- [JavaScript](https://ui.shadcn.com/docs/javascript): Using shadcn/ui with JavaScript (no TypeScript).
- [Figma](https://ui.shadcn.com/docs/figma): Figma design resources.
- [v0](https://ui.shadcn.com/docs/v0): Generating UI with v0 by Vercel.

## MCP Server

- [MCP Server](https://ui.shadcn.com/docs/mcp): Model Context Protocol server for AI integrations. Allows AI assistants to browse, search, and install components from registries using natural language. Works with Claude Code, Cursor, VS Code (GitHub Copilot), Codex and more.

## Registry

- [Registry Overview](https://ui.shadcn.com/docs/registry): Creating and publishing your own component registry.
- [Getting Started](https://ui.shadcn.com/docs/registry/getting-started): Set up your own registry.
- [Examples](https://ui.shadcn.com/docs/registry/examples): Example registries.
- [FAQ](https://ui.shadcn.com/docs/registry/faq): Common questions about registries.
- [Authentication](https://ui.shadcn.com/docs/registry/authentication): Adding authentication to your registry.
- [Registry MCP](https://ui.shadcn.com/docs/registry/mcp): MCP integration for registries.

### Registry Schemas

- [Registry Schema](https://ui.shadcn.com/schema/registry.json): JSON Schema for registry index files. Defines the structure for a collection of components, hooks, pages, etc. Requires name, homepage, and items array.
- [Registry Item Schema](https://ui.shadcn.com/schema/registry-item.json): JSON Schema for individual registry items. Defines components, hooks, themes, and other distributable code with properties for dependencies, files, Tailwind config, CSS variables, and more.

# References and Resources

- [React Documentation](https://react.dev/reference/react)
- [Next.js Documentation](https://nextjs.org/docs)
- [MDX Documentation](https://mdxjs.com/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS CSS-First Configuration](https://tailwindcss.com/docs/configuration)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)
- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Eitaa](https://developer.eitaa.com/docs)
- [Nextjs Examples](https://github.com/vercel/next.js/blob/canary/examples)
- [Next-intl](https://next-intl.dev/docs)
- [Next-intl Examples](https://github.com/amannn/next-intl/tree/main/examples/example-app-router)
- [Zustand](https://zustand.docs.pmnd.rs/getting-started/introduction)
# always use Next latest docs and best practices to solve problems.

# always use bun instead of npm or yarn for package management and script execution

# always use current impelemented codes and change with compatible to current codes and work with the existing code and enhanance it rather than replace it.

# always use proxy instead of middleware in nextjs project

# always use next-intl for multilanguage project in nextjs

# use `https://github.com/dodopayments/billingsdk` and `https://www.kibo-ui.com/patterns/accordion/form/accordion-form-1` for create ui components and blocks and theme