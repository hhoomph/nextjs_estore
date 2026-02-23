# Navigation Implementation Guide

## Overview

This guide provides code examples and implementation details for the UX-centric navigation plan, aligned with the current Next.js App Router architecture.

---

## 1. Navigation Components Architecture

### 1.1 Component Hierarchy

```
RootLayout
├── ConditionalNavbar
│   └── UnifiedNavbar (Customer-facing)
│       ├── Logo/Title
│       ├── Search
│       ├── MainMenu (Desktop)
│       ├── MobileMenu (Mobile)
│       ├── UserMenu
│       ├── Cart
│       └── Wishlist
└── AdminLayout (Admin-only)
    ├── AdminNavbar
    └── AdminSidebar
        ├── Navigation Items
        └── User Profile
```

---

## 2. Implementing Breadcrumb Navigation

### 2.1 Breadcrumb Component

```tsx
// components/ui/breadcrumb-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export function BreadcrumbNav() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = decodeURIComponent(segment)
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    return { label, href };
  });

  if (breadcrumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="py-2 px-4">
      <ol className="flex items-center gap-2 text-sm">
        <li>
          <Link href="/" className="text-primary hover:underline">
            Home
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.href} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            {index === breadcrumbs.length - 1 ? (
              <span aria-current="page" className="font-semibold">
                {breadcrumb.label}
              </span>
            ) : (
              <Link href={breadcrumb.href} className="text-primary hover:underline">
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

---

## 3. Enhanced Mobile Navigation

### 3.1 Mobile Menu Implementation

```tsx
// components/layout/mobile-menu.tsx
'use client';

import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MobileMenuContent } from './mobile-menu-content';

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <button
          aria-label="Open menu"
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] p-0">
        <MobileMenuContent onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
```

### 3.2 Mobile Menu Content

```tsx
// components/layout/mobile-menu-content.tsx
'use client';

import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';

interface MobileMenuContentProps {
  onClose: () => void;
}

export function MobileMenuContent({ onClose }: MobileMenuContentProps) {
  const { data: session } = useSession();

  const menuItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Categories', href: '/categories' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ];

  const authenticatedItems = [
    { label: 'My Orders', href: '/orders' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Account', href: '/account' },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-4 py-2 hover:bg-accent rounded-lg transition-colors"
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {session?.user && (
        <div className="border-t pt-4 space-y-2">
          {authenticatedItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 hover:bg-accent rounded-lg transition-colors"
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <div className="border-t pt-4">
        {session?.user ? (
          <Button onClick={onClose} variant="outline" className="w-full">
            Sign Out
          </Button>
        ) : (
          <Button onClick={onClose} className="w-full">
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
}
```

---

## 4. Admin Navigation Implementation

### 4.1 Admin Sidebar Structure

```tsx
// components/admin/admin-sidebar.tsx
'use client';

import {
  BarChart3,
  Cog,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CollapsibleNavItem } from './collapsible-nav-item';

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navigation = [
    {
      section: 'Main',
      items: [
        {
          label: 'Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
          badge: null,
        },
      ],
    },
    {
      section: 'Management',
      items: [
        {
          label: 'Products',
          href: '/admin/products',
          icon: Package,
          submenu: [
            { label: 'All Products', href: '/admin/products' },
            { label: 'Add Product', href: '/admin/products/new' },
            { label: 'Categories', href: '/admin/categories' },
          ],
        },
        {
          label: 'Orders',
          href: '/admin/orders',
          icon: ShoppingCart,
          badge: 5, // Dynamic badge count
        },
        {
          label: 'Customers',
          href: '/admin/customers',
          icon: Users,
        },
      ],
    },
    {
      section: 'Analytics',
      items: [
        {
          label: 'Reports',
          href: '/admin/analytics',
          icon: BarChart3,
        },
      ],
    },
    {
      section: 'Settings',
      items: [
        {
          label: 'Store Settings',
          href: '/admin/settings',
          icon: Cog,
        },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border fixed h-[calc(100vh-80px)] top-20 overflow-y-auto">
      <nav className="p-4 space-y-8">
        {navigation.map((section) => (
          <div key={section.section}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 mb-2">
              {section.section}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                item.submenu ? (
                  <CollapsibleNavItem
                    key={item.href}
                    item={item}
                    isActive={isActive(item.href)}
                  />
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="bg-destructive text-white text-xs px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
```

---

## 5. Accessibility Implementations

### 5.1 Skip to Content Link

```tsx
// components/layout/skip-to-content.tsx
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2"
    >
      Skip to main content
    </a>
  );
}
```

### 5.2 Enhanced Keyboard Navigation

```tsx
// hooks/use-keyboard-navigation.ts
'use client';

import { useEffect } from 'react';

export function useKeyboardNavigation(itemRefs: React.RefObject<HTMLElement>[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const focused = document.activeElement as HTMLElement;
      const focusedIndex = itemRefs.findIndex(ref => ref.current === focused);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (focusedIndex < itemRefs.length - 1) {
            itemRefs[focusedIndex + 1].current?.focus();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (focusedIndex > 0) {
            itemRefs[focusedIndex - 1].current?.focus();
          }
          break;
        case 'Home':
          e.preventDefault();
          itemRefs[0].current?.focus();
          break;
        case 'End':
          e.preventDefault();
          itemRefs[itemRefs.length - 1].current?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [itemRefs]);
}
```

---

## 6. RBAC Navigation Filtering

### 6.1 Role-Based Navigation Hooks

```tsx
// hooks/use-rbac-navigation.ts
'use client';

import { useSession } from '@/lib/auth-client';

interface NavItem {
  label: string;
  href: string;
  roles?: string[]; // undefined = public
}

export function useRBACNavigation(items: NavItem[]) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  return items.filter((item) => {
    if (!item.roles) return true; // Public item
    if (!session?.user) return false; // Not authenticated
    return item.roles.includes(userRole);
  });
}
```

### 6.2 Usage Example

```tsx
const navigationItems = [
  { label: 'Products', href: '/products' }, // Public
  { label: 'My Orders', href: '/orders', roles: ['USER', 'ADMIN'] },
  { label: 'Admin Panel', href: '/admin', roles: ['ADMIN'] },
];

const visibleItems = useRBACNavigation(navigationItems);
```

---

## 7. State Management for Navigation

### 7.1 Navigation Context

```tsx
// context/navigation-context.tsx
'use client';

import { createContext, useContext, ReactNode, useState } from 'react';

interface NavigationContextType {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <NavigationContext.Provider
      value={{
        mobileMenuOpen,
        setMobileMenuOpen,
        activeCategory,
        setActiveCategory,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
```

---

## 8. Testing Navigation Components

### 8.1 Navigation Testing Examples

```tsx
// __tests__/navigation.test.tsx
import { render, screen } from '@testing-library/react';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';

describe('BreadcrumbNav', () => {
  it('should display current page breadcrumb', () => {
    render(<BreadcrumbNav />);
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeInTheDocument();
  });

  it('should have proper ARIA attributes', () => {
    render(<BreadcrumbNav />);
    const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(breadcrumb).toHaveAttribute('aria-label', 'Breadcrumb');
  });
});
```

---

## 9. Performance Optimization

### 9.1 Navigation Code Splitting

```tsx
// app/layout.tsx
import dynamic from 'next/dynamic';

const UnifiedNavbar = dynamic(
  () => import('@/components/layout/unified-navbar').then(mod => ({ default: mod.UnifiedNavbar })),
  { ssr: true, loading: () => <NavbarSkeleton /> }
);

const Footer = dynamic(
  () => import('@/components/layout/footer').then(mod => ({ default: mod.Footer })),
  { ssr: true, loading: () => <FooterSkeleton /> }
);
```

---

## 10. Accessibility Verification Checklist

- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader announces navigation structure
- [ ] ARIA labels present on all icons
- [ ] Breadcrumbs have proper semantics
- [ ] Mobile menu has focus trap
- [ ] Skip-to-content link functional
- [ ] Admin sidebar navigation logical
- [ ] Active page is indicated

---

This guide provides a foundation for implementing the UX-centric navigation plan. Refer to specific component examples when building new navigation features.
