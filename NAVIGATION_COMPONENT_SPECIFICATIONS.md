# Navigation Component Specifications

## Component Library Overview

This document provides detailed specifications for all navigation-related components aligned with the current architecture.

---

## 1. Navbar Components

### 1.1 UnifiedNavbar Component

**File:** `components/layout/unified-navbar.tsx`

**Current Status:** ✅ Fully Implemented

**Props:** None (uses hooks for state)

**Features:**
- Real-time session monitoring
- Cart and wishlist integration
- Search functionality with Persian support
- Theme switching
- Language switcher
- Responsive mobile menu
- Notification/message sidebars
- Dynamic site title fetching

**Key Hooks Used:**
- `useRouter()` - Navigation
- `useTheme()` - Theme management
- `useTranslations()` - i18n
- `useSimplifiedSessionSync()` - Session state
- `useSimplifiedCartSync()` - Cart state
- `useWishlistStore()` - Wishlist state

**Responsive Behavior:**
- Desktop: Full navbar with all elements
- Tablet: Condensed menu, search visible
- Mobile: Hamburger menu, essential elements only

**Accessibility:**
- Keyboard navigable
- ARIA labels on all buttons
- Screen reader announcements
- Focus indicators visible

---

### 1.2 ConditionalNavbar Component

**File:** `components/layout/conditional-navbar.tsx`

**Current Status:** ✅ Fully Implemented

**Purpose:** Intelligently shows/hides navbar based on route

**Excluded Routes:**
- `/admin/*` - Admin routes have sidebar
- `/auth/*` - Auth pages don't need navbar
- `/api/*` - API routes

**Implementation:**
```typescript
shouldExcludeNavbar(pathname: string): boolean
```

**Benefits:**
- Prevents navbar duplication
- Optimizes layout for specific sections
- Maintains consistent UX per section

---

### 1.3 AdminNavbar Component (Recommended Enhancement)

**File:** `components/admin/admin-navbar.tsx` (To be created)

**Proposed Features:**
- Store title/logo
- Quick admin actions
- Notification badge
- Admin profile menu
- Settings access
- Quick store preview link

**Specifications:**
```tsx
interface AdminNavbarProps {
  pendingOrderCount?: number;
  adminNotifications?: Notification[];
}
```

---

## 2. Menu Components

### 2.1 Mobile Menu

**File:** `components/layout/mobile-menu.tsx` (To be enhanced)

**Current Implementation:** Sheet-based drawer

**Proposed Enhancements:**
- Better category organization
- Search in mobile menu
- Quick links section
- Account quick access
- Language/Theme in menu

**Responsive Breakpoint:** Below 768px

**Touch Targets:**
- Minimum 44px height
- Minimum 44px width
- 8px spacing between targets

---

### 2.2 Desktop Menu / Mega Menu

**File:** `components/layout/desktop-menu.tsx` (To be created)

**Proposed Structure:**

```
Products ▼
├ Electronics
│  ├ Laptops
│  ├ Phones
│  └ Accessories
├ Fashion
└ Home & Garden
```

**Hover Behaviors:**
- Smooth dropdown appearance
- Submenu auto-shows on hover
- Click to toggle for accessibility

---

## 3. Breadcrumb Navigation

### 3.1 BreadcrumbNav Component

**File:** `components/ui/breadcrumb-nav.tsx`

**Status:** ✅ Recommended for implementation

**Props:**
```tsx
interface BreadcrumbNavProps {
  maxItems?: number; // Default: 5
  showHome?: boolean; // Default: true
  className?: string;
}
```

**Example Output:**
```
Home > Products > Electronics > Laptops > Dell XPS 13
```

**Mobile Behavior:**
- Shows abbreviated path (Home > Current)
- On tap: full breadcrumb dropdown

**Accessibility:**
- `nav[aria-label="Breadcrumb"]`
- Last item: `span[aria-current="page"]`
- Semantic `<ol>` and `<li>`

---

## 4. Admin Navigation Components

### 4.1 AdminSidebar Component

**File:** `components/admin/admin-sidebar.tsx` (Recommended enhancement)

**Current Status:** ✅ Implemented in admin/layout.tsx

**Proposed Standalone Component:**

**Features:**
- Collapsible sections
- Icon-labeled items
- Badge support (for counts)
- Active state highlighting
- Keyboard navigation

**Structure:**
```
Dashboard
├ Products
│  ├ All Products
│  ├ Add Product
│  └ Categories
├ Orders
│  ├ Pending (badge: count)
│  └ Completed
└ Settings
```

**Responsive:**
- Desktop: Always visible sidebar
- Tablet: Toggle-able sidebar
- Mobile: Collapsible drawer (optional)

---

### 4.2 CollapsibleNavItem Component

**File:** `components/admin/collapsible-nav-item.tsx` (To be created)

**Purpose:** Handle expandable nav items in admin sidebar

**Props:**
```tsx
interface CollapsibleNavItemProps {
  label: string;
  icon: React.ReactNode;
  submenu: NavItem[];
  isActive: boolean;
  badge?: number;
}
```

**Behaviors:**
- Click to expand/collapse
- Arrow icon rotation animation
- Active submenu item highlighted
- Keyboard accessible

---

## 5. Search Components

### 5.1 NavbarSearch Component

**File:** `components/layout/navbar-search.tsx` (Recommended)

**Features:**
- Persian text support
- Auto-complete suggestions
- Recent searches
- Filter options
- Mobile expansion

**Props:**
```tsx
interface NavbarSearchProps {
  onSearch: (query: string) => void;
  suggestions?: string[];
  recentSearches?: string[];
}
```

---

## 6. User Menu Components

### 6.1 UserMenuDropdown

**File:** Part of `unified-navbar.tsx`

**Current Implementation:** ✅ Using shadcn DropdownMenu

**Menu Items (Authenticated):**
- View Profile
- My Orders
- Wishlist
- Settings
- Sign Out

**Menu Items (Unauthenticated):**
- Sign In
- Sign Up

**Accessibility:**
- Keyboard navigation (Arrow keys)
- Enter to select
- Escape to close

---

## 7. Notification & Message Components

### 7.1 NotificationSidebar

**File:** `components/features/notifications/notification-sidebar.tsx`

**Current Status:** ✅ Implemented

**Features:**
- Bell icon with badge count
- Sidebar drawer
- Notification list
- Mark as read
- Delete notification

---

### 7.2 MessageSidebar

**File:** `components/features/messages/message-sidebar.tsx`

**Current Status:** ✅ Implemented

**Features:**
- Message icon with badge
- Message list
- Quick reply
- Archive functionality

---

## 8. Footer Components

### 8.1 Footer Component

**File:** `components/layout/footer.tsx`

**Current Status:** ✅ Implemented

**Sections:**
- About & Contact
- Products
- Services
- Legal Links

**Features:**
- Dynamic site title
- Responsive grid layout
- Social media links
- Newsletter signup (optional)

**Mobile Behavior:**
- Single column layout
- Collapsible sections
- Touch-friendly spacing

---

## 9. Additional Navigation Components

### 9.1 LanguageSwitcher

**File:** `components/ui/language-switcher.tsx`

**Current Status:** ✅ Implemented

**Supported Languages:**
- English (en)
- Persian (fa)

**Implementation:**
- Dropdown menu
- Persist to cookie
- RTL/LTR swap

---

### 9.2 ThemeToggle

**File:** Part of navbar

**Current Status:** ✅ Implemented

**Features:**
- Light/Dark mode toggle
- System preference detection
- Persistent state
- Smooth transitions

---

## 10. Component Integration Map

```
RootLayout
├── SkipToContent (accessibility)
├── ConditionalNavbar
│   └── UnifiedNavbar
│       ├── Logo/Title (link to home)
│       ├── DesktopMenu (responsive hide <768px)
│       ├── NavbarSearch
│       ├── LanguageSwitcher
│       ├── ThemeToggle
│       ├── NotificationBell
│       │   └── NotificationSidebar
│       ├── MessageIcon
│       │   └── MessageSidebar
│       ├── WishlistIcon (count badge)
│       ├── CartIcon (count badge)
│       │   └── CartSidebar
│       ├── UserMenuDropdown
│       └── MobileMenu (responsive show <768px)
├── CartSidebar (overlay)
├── NotificationSidebar (overlay)
├── MessageSidebar (overlay)
├── MainContent (id="main-content")
└── Footer
```

---

## 11. Styling Guidelines

### 11.1 Navigation Styling

**Light Mode:**
- Background: `bg-background` (#ffffff)
- Borders: `border-border` (#e5e7eb)
- Text: `text-foreground` (#171717)
- Hover: `hover:bg-accent` (#f3f4f6)
- Active: `text-primary` (#0ea5e9)

**Dark Mode:**
- Background: `bg-background` (#0a0a0a)
- Borders: `border-border` (#1f2937)
- Text: `text-foreground` (#fafafa)
- Hover: `hover:bg-accent` (#1f2937)
- Active: `text-primary` (#0284c7)

### 11.2 Component Spacing

```css
/* Navigation items */
--nav-item-height: 44px; /* Mobile touch target */
--nav-item-padding: 12px 16px; /* Vertical/Horizontal */
--nav-item-gap: 8px; /* Between items */

/* Navbar */
--navbar-height: 80px;
--navbar-padding: 16px;

/* Sidebar (admin) */
--sidebar-width: 256px; /* 64 * 4 */
```

---

## 12. Responsive Design Specifications

### 12.1 Breakpoints

```
Mobile:  0px   - 639px  (< sm)
Tablet:  640px - 1023px (sm - md)
Desktop: 1024px+        (lg+)
```

### 12.2 Navigation Visibility

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Logo | ✅ | ✅ | ✅ |
| Search | Icon | ✅ | ✅ |
| Menu | Hamburger | Hamburger | Mega menu |
| Theme | ✅ | ✅ | ✅ |
| Cart | Badge | Badge | Badge |
| User | ✅ | ✅ | ✅ |

---

## 13. Performance Specifications

### 13.1 Loading Performance

- Navbar: < 100ms initial load
- Mobile menu: Render on open (lazy)
- Mega menu: Render on hover
- Breadcrumbs: Instant (derived from URL)

### 13.2 Bundle Size

- Navigation components: < 50KB
- With dependencies: < 120KB

---

## 14. Testing Specifications

### 14.1 Unit Tests Required

- [x] Route exclusion logic in ConditionalNavbar
- [ ] BreadcrumbNav generation
- [ ] Admin sidebar filtering
- [ ] Mobile menu toggle
- [ ] RBAC navigation filtering

### 14.2 Integration Tests Required

- [ ] Navigation between main sections
- [ ] Auth state navigation changes
- [ ] Admin access control
- [ ] Theme persistence across nav
- [ ] Search functionality

### 14.3 E2E Tests Required

- [ ] Complete user journey (guest → authenticated)
- [ ] Admin panel access
- [ ] Mobile navigation flow
- [ ] Breadcrumb tracking

---

## 15. Implementation Priority

### Phase 1: Foundation (Current) ✅
- UnifiedNavbar
- ConditionalNavbar
- Footer
- Mobile menu (basic)

### Phase 2: Enhancement (Recommended)
- [ ] BreadcrumbNav
- [ ] AdminSidebar (standalone)
- [ ] Enhanced mobile menu
- [ ] NavbarSearch
- [ ] Keyboard accessibility audit

### Phase 3: Advanced
- [ ] Mega menu
- [ ] Analytics tracking
- [ ] Personalized navigation
- [ ] Progressive disclosure

---

## 16. Accessibility Compliance

### WCAG 2.1 AA Checkpoints

- [x] Semantic HTML
- [x] ARIA labels on icons
- [x] Keyboard navigation
- [x] Focus indicators
- [x] Color contrast (4.5:1)
- [ ] Skip-to-content link
- [ ] Breadcrumb landmarks
- [ ] Focus management on state change

---

This specification document ensures all navigation components are built consistently and meet the UX-centric requirements outlined in the navigation plan.
