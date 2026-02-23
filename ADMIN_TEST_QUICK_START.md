# Admin Panel Test Execution - Quick Start Guide

## Pre-Test Checklist

- [ ] Development server running: `npm run dev`
- [ ] Database connected and seeded
- [ ] Admin user created: admin@example.com / admin123456
- [ ] Browser DevTools ready (F12)
- [ ] Test data prepared (categories, images)
- [ ] Environment variables configured in .env.local

## Quick Test Execution (30 minutes)

### Phase 1: Authentication (10 min)

**TC-004: Valid Admin Sign-In**
- [ ] Go to http://localhost:3000/admin/signin
- [ ] Enter: admin@example.com / admin123456
- [ ] Click "Sign In"
- [ ] Verify redirect to /admin dashboard
- **Status:** ✓ Pass | ✗ Fail | ⚠ Block

**TC-005: Invalid Credentials**
- [ ] Clear credentials
- [ ] Enter: admin@example.com / wrongpass
- [ ] Click "Sign In"
- [ ] Verify error message shown
- **Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Phase 2: Admin Dashboard (5 min)

**TC-011: Dashboard Access**
- [ ] Verify sidebar navigation loads
- [ ] Check all menu items present
- [ ] Click "Products" menu item
- [ ] Verify products page loads
- **Status:** ✓ Pass | ✗ Fail | ⚠ Block

### Phase 3: Product Addition (15 min)

**TC-014: Add Product Form**
- [ ] Click "+ Add Product" button
- [ ] Verify form modal opens
- [ ] Check all fields present
- **Status:** ✓ Pass | ✗ Fail | ⚠ Block

**TC-025: Submit Valid Product**
- [ ] Product Name: "Test Wireless Headphones"
- [ ] Description: "Premium noise-cancelling headphones"
- [ ] Category: Select "Electronics"
- [ ] Price: 199.99
- [ ] Quantity: 50
- [ ] Upload image: Select product image
- [ ] Click "Add Product"
- [ ] Verify success message
- [ ] Check product in list
- **Status:** ✓ Pass | ✗ Fail | ⚠ Block

## Critical Checks

### Before Deployment Checklist
- [ ] Admin sign-in working
- [ ] Role-based access control enforced
- [ ] Product addition successful
- [ ] Products persist in database
- [ ] No console errors (check DevTools)
- [ ] No security warnings
- [ ] Responsive on mobile (DevTools)
- [ ] Dark mode toggle working

### Security Verification
- [ ] Non-admin users redirected from /admin
- [ ] Session tokens valid
- [ ] CSRF protection enabled
- [ ] SQL injection prevention verified
- [ ] No sensitive data in logs

### Performance Baseline
- [ ] Sign-in form loads < 2s
- [ ] Dashboard loads < 3s
- [ ] Product submission < 5s
- [ ] Image upload smooth
- [ ] No memory leaks (DevTools)

## Issues Found During Testing

| Issue | Severity | Status | Resolution |
|-------|----------|--------|-----------|
| [Issue 1] | High/Medium/Low | New/Fixed | [Action] |
| [Issue 2] | High/Medium/Low | New/Fixed | [Action] |

## Test Results Summary

**Date:** ____________  
**Tester:** ____________  
**Environment:** Development  
**Browser:** ____________  

**Total Tests Run:** 8  
**Passed:** _____ (____%)  
**Failed:** _____ (____%)  
**Blocked:** _____ (____%)  

**Overall Status:** ✓ PASS | ⚠ CONDITIONAL | ✗ FAIL

## Sign-Off

- [ ] All critical tests passed
- [ ] Issues documented
- [ ] Recommendations noted
- [ ] Ready for deployment

**Approved By:** ________________  
**Date:** ________________
