# Admin Panel Testing Checklist

**Project:** eCommerce Application  
**Component:** Admin Panel - Authentication & Product Management  
**Date:** February 22, 2026

---

## Pre-Testing Setup

### Environment Configuration
- [ ] Node.js 18+ installed
- [ ] npm dependencies installed (`npm install`)
- [ ] PostgreSQL database running
- [ ] .env.local configured with:
  - [ ] `NEXT_PUBLIC_APP_URL=http://localhost:3000`
  - [ ] `BETTER_AUTH_BASE_URL=http://localhost:3000`
  - [ ] `DATABASE_URL` with correct credentials
  - [ ] `DATABASE_URL` includes `sslmode=verify-full`

### Database Setup
- [ ] Database created and migrated
- [ ] Admin user created: `admin@example.com` / `admin123456`
- [ ] Product categories exist (minimum 3-5)
- [ ] Site settings table populated
- [ ] Test images prepared (JPEG/PNG format, < 5MB)

### Server Launch
- [ ] Run `npm run dev`
- [ ] Server running on http://localhost:3000
- [ ] No console errors on startup
- [ ] No TypeScript compilation errors

---

## Phase 1: Authentication Testing (10 minutes)

### Admin Sign-In Page Load
- [ ] Navigate to http://localhost:3000/admin/signin
- [ ] Page loads without errors
- [ ] All UI elements visible
- [ ] Title "Admin Sign In" displayed
- [ ] Form fields properly labeled
- [ ] Sign In button visible and clickable

### Valid Credentials Sign-In
- [ ] Email: admin@example.com
- [ ] Password: admin123456
- [ ] Click "Sign In"
- [ ] Loading spinner shown during submission
- [ ] Redirected to /admin dashboard
- [ ] URL shows http://localhost:3000/admin
- [ ] Session cookie created (check DevTools)

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Invalid Password Handling
- [ ] Email: admin@example.com
- [ ] Password: wrongpassword123
- [ ] Click "Sign In"
- [ ] Error message displayed
- [ ] User remains on sign-in page
- [ ] Form data preserved (except password)

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Form Validation - Empty Fields
- [ ] Leave email and password empty
- [ ] Click "Sign In"
- [ ] Validation errors shown
- [ ] Email error: "Please enter a valid email address"
- [ ] Password error: "Password must be at least 8 characters"
- [ ] Form not submitted

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Form Validation - Invalid Email
- [ ] Email: notanemail
- [ ] Password: password123
- [ ] Click "Sign In"
- [ ] Error: "Please enter a valid email address"
- [ ] Form not submitted

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

---

## Phase 2: Dashboard Access (5 minutes)

### Dashboard Load
- [ ] After signing in, dashboard loads
- [ ] Sidebar navigation visible
- [ ] Main content area displayed
- [ ] No console errors
- [ ] Page title updated to include admin name

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Navigation Menu
- [ ] Dashboard link present and working
- [ ] Products link present and working
- [ ] Categories link present and working
- [ ] Orders link present and working
- [ ] Users link present and working
- [ ] Settings link present (if applicable)

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### User Profile Menu
- [ ] Avatar/profile icon visible in navbar
- [ ] Click opens dropdown menu
- [ ] User name displayed
- [ ] Sign Out option available
- [ ] Theme toggle working (if visible)

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Session Persistence
- [ ] Refresh page (F5)
- [ ] Session remains active
- [ ] Navigate between admin pages
- [ ] Dashboard still accessible
- [ ] No unexpected redirects to sign-in

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

---

## Phase 3: Product Addition (15 minutes)

### Products Page Load
- [ ] Navigate to Products from sidebar
- [ ] Products page loads
- [ ] Product table/grid displayed
- [ ] "Add Product" button visible
- [ ] Search/filter options present

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Add Product Form - Open
- [ ] Click "Add Product" button
- [ ] Modal/form dialog opens
- [ ] All input fields visible and accessible
- [ ] Form title shown
- [ ] Cancel and Submit buttons present

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Form Fields Present
- [ ] Product Name input field
- [ ] Description textarea field
- [ ] Category dropdown selector
- [ ] Price input field
- [ ] Discount Price input field
- [ ] Quantity input field
- [ ] Status toggle/selector
- [ ] Image upload area
- [ ] Submit button
- [ ] Cancel button

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Form Validation - Product Name
- [ ] Leave Product Name empty
- [ ] Try to submit
- [ ] Error: "Name is required"
- [ ] Form not submitted

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Form Validation - Description
- [ ] Fill Product Name
- [ ] Leave Description empty
- [ ] Try to submit
- [ ] Error: "Description is required"
- [ ] Form not submitted

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Form Validation - Category
- [ ] Fill Name and Description
- [ ] Leave Category as "Select..."
- [ ] Try to submit
- [ ] Error: "Category is required"
- [ ] Form not submitted

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Form Validation - Price
- [ ] Fill Name, Description, Category
- [ ] Enter Price: 0
- [ ] Try to submit
- [ ] Error: "Price must be greater than 0"
- [ ] Form not submitted

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Form Validation - Price Decimal
- [ ] Enter Price: 19.99
- [ ] Other fields valid
- [ ] Form should accept decimal
- [ ] No validation error

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Complete Product Submission
- [ ] Product Name: "Test Wireless Headphones"
- [ ] Description: "Premium noise-cancelling headphones with 30-hour battery"
- [ ] Category: Select "Electronics" (or available)
- [ ] Price: 199.99
- [ ] Discount Price: 149.99 (optional)
- [ ] Quantity: 50
- [ ] Status: Active
- [ ] Upload product image (JPEG/PNG, < 5MB)
- [ ] Click "Add Product"
- [ ] Loading spinner shown
- [ ] Success message displayed
- [ ] Form closes

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Product Appears in List
- [ ] New product visible in products table/grid
- [ ] Product name matches entered value
- [ ] Category correctly displayed
- [ ] Price shows correctly
- [ ] Product image thumbnail visible
- [ ] Edit button available
- [ ] Delete button available
- [ ] View button available

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

---

## Critical Security Checks

### Role-Based Access Control
- [ ] Try to access /admin with non-admin user
- [ ] User is redirected away from admin panel
- [ ] Friendly error/redirect message shown

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Session Security
- [ ] Clear cookies manually
- [ ] Navigate to /admin
- [ ] Redirected to /admin/signin
- [ ] Cannot access admin pages without auth

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Password Security
- [ ] Admin password at least 8 characters
- [ ] Password never shown in plain text
- [ ] Password not logged to console
- [ ] No password in URL parameters

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

---

## Console & Error Checks

### No Critical Errors
- [ ] Open DevTools (F12)
- [ ] Check Console tab
- [ ] No red error messages
- [ ] No unhandled promise rejections
- [ ] No security warnings (except expected)

### Expected Warnings (OK to ignore)
- [ ] Font preloading warning (CDN unavailable)
- [ ] SSL mode deprecation notice
- [ ] Social provider config warnings (dev environment)

### No Breaking Errors
- [ ] Prisma schema sync errors - NONE
- [ ] Database connection errors - NONE
- [ ] Auth initialization errors - NONE
- [ ] React rendering errors - NONE

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

---

## Responsive Design Verification

### Mobile View (375px - 640px)
- [ ] DevTools mobile view: iPhone SE (375px)
- [ ] Sign-in form loads correctly
- [ ] Input fields full width with padding
- [ ] Buttons touch-target size (44px+)
- [ ] No horizontal scrollbar
- [ ] Text readable at default zoom

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Tablet View (768px)
- [ ] DevTools: iPad size
- [ ] Admin layout adjusts appropriately
- [ ] Sidebar may collapse to hamburger menu
- [ ] Product table scrollable horizontally
- [ ] All buttons accessible

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Desktop View (1920px+)
- [ ] Full admin interface visible
- [ ] Sidebar always visible
- [ ] Product table fully displayed
- [ ] All features accessible

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

---

## Dark Mode Testing

### Theme Toggle
- [ ] Locate theme toggle button (moon/sun icon)
- [ ] Click to switch to dark mode
- [ ] Page switches to dark theme
- [ ] All text remains readable
- [ ] Color contrast maintained (4.5:1)

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Dark Mode Accessibility
- [ ] Sign-in form readable in dark mode
- [ ] Form inputs clearly visible
- [ ] Buttons have sufficient contrast
- [ ] No image or text disappears
- [ ] Theme preference persists on refresh

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

---

## Accessibility Checks

### Keyboard Navigation
- [ ] Sign-in page: Tab through inputs
- [ ] Tab order: Email → Password → Sign In
- [ ] Shift+Tab works backward
- [ ] Enter key submits form
- [ ] No keyboard traps

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Focus Indicators
- [ ] Focus outline visible on all inputs
- [ ] Focus outline on buttons
- [ ] Sufficient contrast (WCAG AA)
- [ ] Focus indicators not obscured

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Color Contrast
- [ ] Text on background: 4.5:1 minimum
- [ ] UI components: 3:1 minimum
- [ ] Check admin panel colors
- [ ] Check form field labels

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

---

## Performance Checks

### Page Load Times
- [ ] Sign-in page: < 2 seconds
- [ ] Dashboard: < 3 seconds
- [ ] Products page: < 3 seconds
- [ ] Form submission: < 5 seconds

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Image Upload Performance
- [ ] Image preview loads quickly
- [ ] Upload progress shown
- [ ] No browser hang during upload
- [ ] Multiple images can be selected

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### No Memory Leaks
- [ ] Open DevTools Memory tab
- [ ] Take initial heap snapshot
- [ ] Perform 5 add product operations
- [ ] Take final heap snapshot
- [ ] No significant memory increase

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

---

## Final Verification

### Data Persistence
- [ ] Close browser window
- [ ] Reopen and navigate to admin
- [ ] Products from previous session still visible
- [ ] Changes persisted to database

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Sign-Out Functionality
- [ ] Click Sign Out from user menu
- [ ] Redirected to home page
- [ ] Session destroyed
- [ ] Cannot access /admin anymore

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

### No Data Loss
- [ ] All entered data saved correctly
- [ ] No validation errors after save
- [ ] Product quantities accurate
- [ ] Prices stored with correct decimals

**Status:** ✓ Pass | ✗ Fail | ⚠ Block

---

## Test Summary

**Total Critical Tests:** 40+  
**Tests Passed:** ___ / ___  
**Tests Failed:** ___ / ___  
**Tests Blocked:** ___ / ___  

**Overall Status:** ✓ PASS | ⚠ CONDITIONAL | ✗ FAIL

---

## Issues Found

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | [Issue Name] | High/Med/Low | New/Fixed/WontFix |
| 2 | [Issue Name] | High/Med/Low | New/Fixed/WontFix |

---

## Sign-Off

**Tester Name:** ___________________  
**Date:** ___________________  
**Time Spent:** ___ hours  
**Environment:** Development  
**Browser:** ___________________  

**Notes:**
```
[Add any additional notes or observations]
```

**Approved For Deployment:** ✓ Yes | ⚠ Conditional | ✗ No

---

**Document Completed:** [Date/Time]
