# Navigation Flowcharts & Visual Diagrams

## User Journey Maps

### 1. Guest User to Authenticated Customer

```
┌─────────────────────────────────────────────────────────────────┐
│                      HOME PAGE                                  │
│  [Logo] [Search] [Theme] [Cart] [Sign In]                       │
└─────────────────┬───────────────────────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
  ┌──────────┐ ┌──────────┐ ┌─────────────┐
  │ Browse   │ │ Search   │ │ Cart (empty)│
  │Products  │ │Results   │ │             │
  └────┬─────┘ └────┬─────┘ └─────────────┘
       │            │
       └────┬───────┘
            │
            ▼
    ┌──────────────────────┐
    │  PRODUCT DETAILS     │
    │ [Add to Cart]        │
    │ [Add to Wishlist]    │
    └────┬─────────────────┘
         │
         ▼
    ┌──────────────────────┐
    │  SHOPPING CART       │
    │ [Checkout]           │
    └────┬─────────────────┘
         │
         ▼
    ┌──────────────────────┐
    │  CHECKOUT            │
    │ [Sign In / Register] │◄─── User not authenticated
    └────┬─────────────────┘
         │
         ▼
    ┌──────────────────────┐
    │  SIGN UP / SIGN IN   │  ◄─── Authentication gate
    │ [Enter Credentials]  │
    │ [Create Account]     │
    └────┬─────────────────┘
         │
         ▼
    ┌──────────────────────┐
    │  AUTHENTICATED       │
    │ Session active       │
    │ User menu visible    │
    └────┬─────────────────┘
         │
         ▼
    ┌──────────────────────┐
    │  CHECKOUT (Cont.)    │
    │ [Payment]            │
    │ [Order Confirmation] │
    └────┬─────────────────┘
         │
         ▼
    ┌──────────────────────┐
    │  ORDER CONFIRMATION  │
    │ [View Orders] Link   │
    │ available            │
    └──────────────────────┘
```

---

### 2. Admin User Dashboard Navigation

```
┌──────────────────────────────────────────────────────────────┐
│                    ADMIN SIGN IN PAGE                        │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │ Email: [_______________]             │                   │
│  │ Password: [_______________]          │                   │
│  │ [Sign In]                            │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
│  Unauthenticated | No Admin Sidebar                          │
└───────────────────┬──────────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
    ┌─────────────┐      ┌─────────────┐
    │ Invalid Creds   │ Valid + Admin │
    │ → Error msg     │ Credentials   │
    │ → Retry         │               │
    └─────────────┘    └────┬──────────┘
                             │
                             ▼
        ┌────────────────────────────────────┐
        │      ADMIN DASHBOARD               │
        │                                    │
        │ ┌──────────────────────────────┐  │
        │ │ Sidebar Navigation:          │  │
        │ │ • Dashboard                  │  │
        │ │ • Products ▼                 │  │
        │ │   ├ All Products             │  │
        │ │   ├ Add New Product          │  │
        │ │   └ Categories               │  │
        │ │ • Orders ▼                   │  │
        │ │   ├ Pending (5)              │  │
        │ │   └ Completed                │  │
        │ │ • Customers                  │  │
        │ │ • Analytics                  │  │
        │ │ • Settings                   │  │
        │ │ • [Sign Out]                 │  │
        │ └──────────────────────────────┘  │
        │                                    │
        │ [Main Content Area]                │
        └────────────────┬───────────────────┘
                         │
            ┌────────────┼────────────┬────────────┐
            │            │            │            │
            ▼            ▼            ▼            ▼
      ┌─────────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐
      │ Dashboard   │ │ Products │ │ Orders  │ │Settings  │
      │ Stats       │ │ List     │ │ Manage  │ │ Config   │
      │ Charts      │ │ Add New  │ │ Status  │ │ Appear   │
      │             │ │ Edit     │ │ Refunds │ │ Users    │
      │             │ │ Delete   │ │         │ │          │
      └─────────────┘ └────┬─────┘ └─────────┘ └──────────┘
                           │
                           ▼
                    ┌──────────────────┐
                    │  ADD PRODUCT     │
                    │ FORM             │
                    │ [Form fields]    │
                    │ [Upload Image]   │
                    │ [Save] [Cancel]  │
                    └────┬─────────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
          ┌──────────────┐  ┌─────────────┐
          │ Save Success │  │ Validation  │
          │ → Redirect   │  │ Error       │
          │   to list    │  │ → Display   │
          └──────────────┘  │   errors    │
                            └─────────────┘
```

---

### 3. Navigation State Machine

```
                    ┌──────────────────────┐
                    │   NOT AUTHENTICATED  │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
            ┌──────────────┐     ┌─────────────────┐
            │ Sign In Page │     │ Regular Pages   │
            │ [Logo]       │     │ [Public Nav]    │
            │ [Form]       │     │ • Products      │
            │ [Sign Up]    │     │ • Categories    │
            └────┬─────────┘     │ • Blog          │
                 │               │ • [Sign In]     │
                 │               │ • [Sign Up]     │
                 │               └────────┬────────┘
                 │                        │
                 │ ┌──────────────────────┘
                 │ │ Click [Sign In]
                 │ │ or [Sign Up]
                 ▼ ▼
        ┌─────────────────────┐
        │ Authentication Gate │
        │ Verify credentials  │
        └──────┬──────────────┘
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
  ┌─────────────┐  ┌──────────────────┐
  │   Admin     │  │   Regular User   │
  │   User      │  │   (role: USER)   │
  └─────┬───────┘  └────────┬─────────┘
        │                   │
        ▼                   ▼
  ┌──────────────┐   ┌─────────────────┐
  │ Admin Layout │   │ Customer Layout │
  │ • Sidebar    │   │ • Navbar        │
  │ • Dashboard  │   │ • My Orders     │
  │ • Products   │   │ • Wishlist      │
  │ • Orders     │   │ • Account       │
  │ • Settings   │   │ • Cart          │
  └──────┬───────┘   └────────┬────────┘
         │                    │
         │                    │
    ┌────┴──────────────┬─────┴─────┐
    │                   │           │
    ▼                   ▼           ▼
[Sidebar Nav]    [Topbar Nav]   [Cart Icon]
                                │
                                ▼
                            [Sign Out]
                                │
                                ▼
                    ┌────────────────────────┐
                    │  NOT AUTHENTICATED    │
                    │ (Back to start)       │
                    └────────────────────────┘
```

---

### 4. Component Rendering Tree

```
RootLayout
│
├─ SkipToContent (Accessibility)
│
├─ ConditionalNavbar
│   └─ IF pathname != "/admin" AND != "/auth"
│       └─ UnifiedNavbar
│           ├─ Logo (Link to home)
│           ├─ DesktopMenu (>1024px)
│           ├─ NavbarSearch
│           ├─ LanguageSwitcher
│           ├─ ThemeToggle
│           ├─ NotificationBell
│           │   └─ NotificationSidebar (overlay)
│           ├─ MessageIcon
│           │   └─ MessageSidebar (overlay)
│           ├─ WishlistIcon
│           ├─ CartIcon
│           │   └─ CartSidebar (overlay)
│           ├─ UserMenuDropdown
│           │   └─ DropdownMenu
│           │       ├─ Profile (auth only)
│           │       ├─ Orders (auth only)
│           │       ├─ Settings (auth only)
│           │       └─ Sign Out (auth only)
│           │       OR
│           │       ├─ Sign In (guest)
│           │       └─ Sign Up (guest)
│           │
│           └─ MobileMenu (<768px)
│               └─ Sheet
│                   └─ MobileMenuContent
│
├─ AdminLayout
│   ├─ IF pathname starts "/admin"
│   │   ├─ AdminNavbar (future)
│   │   ├─ AdminSidebar
│   │   └─ MainContent
│   │
│   └─ IF not authenticated OR not admin
│       └─ AdminRedirect
│
├─ BreadcrumbNav (if applicable)
│
├─ MainContent
│   ├─ Page component
│   └─ Nested layouts
│
└─ Footer
    ├─ About section
    ├─ Products section
    ├─ Services section
    └─ Legal section
```

---

### 5. Mobile vs Desktop Navigation

```
DESKTOP (≥1024px)
┌─────────────────────────────────────┐
│ Logo │ Menu ▼ │ Search │ Theme │ Cart │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ Submenu on hover:             │   │
│ │ • Electronics                 │   │
│ │   - Laptops                   │   │
│ │   - Phones                    │   │
│ │   - Accessories               │   │
│ │ • Fashion                     │   │
│ │ • Home                        │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘

TABLET (640px-1023px)
┌────────────────────────────────┐
│ ☰ │ Logo │ Search │ Theme │ Cart │
│                               │
│ ┌─────────────────────────────┤
│ │ Drawer Menu:                │
│ │ • Products                  │
│ │ • Categories                │
│ │ • Blog                      │
│ │ ═════════════════════════   │
│ │ • Account (if auth)         │
│ │ • Orders (if auth)          │
│ │ ═════════════════════════   │
│ │ [Sign In / Sign Out]        │
│ └─────────────────────────────┘
└────────────────────────────────┘

MOBILE (<640px)
┌──────────────────────────┐
│ ☰ │ Logo │ Theme │ Cart  │
│                          │
│ ┌──────────────────────┐ │
│ │ ☰ Opened:           │ │
│ │ • Home              │ │
│ │ • Products          │ │
│ │ • Categories ▼      │ │
│ │   - Electronics     │ │
│ │   - Fashion         │ │
│ │   - Home            │ │
│ │ • Blog              │ │
│ │ • Contact           │ │
│ │ ─────────────────── │ │
│ │ • Orders (if auth)  │ │
│ │ • Account (if auth) │ │
│ │ ─────────────────── │ │
│ │ [Sign In / Out]     │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

---

### 6. Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│           NEW VISITOR / GUEST USER                          │
└──────┬──────────────────────────────────────────────────────┘
       │
       │ Browse freely with:
       │ • Guest cart (localStorage)
       │ • Session-only wishlist
       │ • Public navigation only
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│        CHECKOUT → SIGN IN PROMPT                            │
│  ┌─────────────────────────────────────────────┐            │
│  │ "Please sign in to continue"                │            │
│  │ [Sign In] [Create New Account]              │            │
│  └─────────────────────────────────────────────┘            │
└──────┬──────────────────────────────────────────────────────┘
       │
       ├─ Path 1: Existing User          ┌─ Path 2: New User
       │                                 │
       ▼                                 ▼
    ┌────────────────┐            ┌────────────────┐
    │ Sign In Form   │            │ Registration   │
    │ Email [___]    │            │ Form           │
    │ Password [__]  │            │ Email [___]    │
    │ [Sign In]      │            │ Password [__]  │
    └────┬───────────┘            │ Confirm [__]   │
         │                         │ [Sign Up]      │
         │                         └────┬───────────┘
         │                              │
         └──────────┬────────────────────┘
                    │
                    ▼
         ┌──────────────────────────┐
         │ AUTHENTICATION SUCCESSFUL│
         │ Session created         │
         │ Session cookie set      │
         └──────────┬───────────────┘
                    │
                    ▼
         ┌──────────────────────────┐
         │ AUTHENTICATED USER       │
         │ • Session: active        │
         │ • Role: determined       │
         │ • Cart synced            │
         │ • Full nav available     │
         └──────────┬───────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
    ┌──────────────┐    ┌────────────────┐
    │ Regular User │    │ Admin User     │
    │ • Dashboard  │    │ • Admin Panel  │
    │ • Orders     │    │ • Products     │
    │ • Wishlist   │    │ • Orders Mgmt  │
    │ • Settings   │    │ • Analytics    │
    └──────┬───────┘    └────┬───────────┘
           │                 │
           │ [Sign Out]      │ [Sign Out]
           │                 │
           └────────┬────────┘
                    │
                    ▼
         ┌──────────────────────────┐
         │ SIGNED OUT               │
         │ • Session cleared        │
         │ • Back to guest state    │
         │ • Redirect to home       │
         └──────────────────────────┘
```

---

### 7. Search & Discovery Path

```
ENTRY POINTS:
┌────────────┬────────────┬──────────────┬────────────┐
│ Search Bar │ Categories │ Recent Searches  │ Trending │
└────┬───────┴──────┬─────┴────────┬────────┴────┬─────┘
     │              │              │             │
     │              │              │             │
┌────┴──────┬───────┴────┬────────┴────┬────────┴───┐
│            │            │             │             │
▼            ▼            ▼             ▼             ▼
┌──────┐ ┌────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐
│Search│ │Category│ │ Recent   │ │Trending  │ │Suggested  │
│Sug-  │ │Browse  │ │Products  │ │Products  │ │Products   │
│gest- │ │Expand  │ │Display   │ │Display   │ │Display    │
│ions  │ │by      │ │List      │ │List      │ │List       │
│      │ │Sub-cat │ │          │ │          │ │          │
│      │ │        │ │          │ │          │ │          │
└──┬───┘ └───┬────┘ └────┬─────┘ └────┬─────┘ └─────┬────┘
   │         │            │            │            │
   │         │            └────┬───────┴────┬───────┘
   │         │                 │            │
   └─────┬───┴─────────────────┴────────────┘
         │
         ▼
  ┌──────────────────┐
  │ PRODUCT LISTING  │
  │ [Filters]        │
  │ [Sort options]   │
  │ [Pagination]     │
  │                  │
  │ Product Cards:   │
  │ • Image          │
  │ • Price          │
  │ • Rating         │
  │ • [Add to Cart]  │
  │ • [Wishlist]     │
  │ • [View Details] │
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ PRODUCT DETAILS  │
  │                  │
  │ • Gallery        │
  │ • Price/Stock    │
  │ • Description    │
  │ • Reviews        │
  │ • [Add to Cart]  │
  │ • [Add Wishlist] │
  │ • Related Items  │
  │ • Breadcrumb:    │
  │   Home > Cat >   │
  │   SubCat > Item  │
  └────────┬─────────┘
           │
      ┌────┴────┐
      │          │
      ▼          ▼
  [Cart]    [Wishlist]
```

---

### 8. Admin Sidebar Navigation Hierarchy

```
SIDEBAR (w-64)
┌──────────────────────────────────┐
│ MAIN                             │
│ ├─ Dashboard                     │
│                                  │
│ MANAGEMENT                       │
│ ├─ Products  ▼                   │
│ │  ├─ All Products    [active]   │
│ │  ├─ Add New Product            │
│ │  ├─ Categories                 │
│ │  └─ Inventory                  │
│ │                                │
│ ├─ Orders     ▼    [5]           │
│ │  ├─ All Orders                 │
│ │  ├─ Pending        [5 badge]   │
│ │  └─ Completed                  │
│ │                                │
│ ├─ Customers                     │
│ │  ├─ All Customers              │
│ │  ├─ New Customers              │
│ │  └─ Inactive                   │
│                                  │
│ ANALYTICS                        │
│ ├─ Reports                       │
│ │  ├─ Sales Report               │
│ │  ├─ Traffic Report             │
│ │  └─ Product Report             │
│                                  │
│ SETTINGS                         │
│ ├─ Store Settings                │
│ ├─ Appearance                    │
│ ├─ Integrations                  │
│ └─ Users & Roles                 │
│                                  │
│ ══════════════════════════════   │
│ [Avatar] Admin Name              │
│ Admin Dashboard                  │
│ [Logout]                         │
└──────────────────────────────────┘
```

---

## Navigation Decision Trees

### Should Navbar Show?

```
START: Check pathname
│
├─ Contains "/admin"? → YES → Hidden ✓
│
├─ Contains "/auth"? → YES → Hidden ✓
│
├─ Contains "/api"? → YES → Hidden ✓
│
├─ Matches files (ico, jpg, etc)? → YES → Hidden ✓
│
└─ None above → SHOW Navbar ✓
```

### User Can Access Admin?

```
START: Route is "/admin/*"
│
├─ User authenticated? → NO → Redirect to /admin/signin
│
├─ User role == "ADMIN"? → YES → Allow access ✓
│
└─ User role != "ADMIN" → Redirect to home or 403
```

### Which Cart to Use?

```
START: User state check
│
├─ User authenticated? → YES → Use: useCartStore (synced)
│
└─ User not authenticated → Use: useGuestCartStore (local)
    (Cart persists in localStorage)
```

---

## Keyboard Navigation Flow

```
START: Focus in document
│
├─ TAB → Focus moves right through:
│   1. Logo
│   2. Search input
│   3. Language switcher
│   4. Theme toggle
│   5. Notifications
│   6. Messages
│   7. Cart
│   8. User menu
│   9. Mobile menu (on mobile)
│
├─ ENTER/SPACE on menu → Opens dropdown
│
├─ ARROW DOWN → Move to next menu item
│
├─ ARROW UP → Move to previous menu item
│
├─ HOME → First item in menu
│
├─ END → Last item in menu
│
└─ ESCAPE → Close menu, refocus trigger
```

---

## Responsive Design Breakpoints

```
┌────────────────────────────────────────────────────────┐
│ MOBILE (< 640px)                                       │
│ ☰ Logo Search 🎨 Cart                                  │
│ └─ Hamburger opens full-screen drawer                  │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ TABLET (640px - 1023px)                                │
│ ☰ Logo Search 🌐 🎨 Cart User                          │
│ └─ Hamburger collapses some items                      │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ DESKTOP (≥ 1024px)                                     │
│ Logo Products▼ Search 🌐 🎨 🔔 ✉️ 💝 Cart User▼       │
│              └─ Mega menu on hover                     │
└────────────────────────────────────────────────────────┘
```

---

These flowcharts and diagrams provide a visual understanding of the navigation flows, component hierarchy, and user journeys throughout the application.
