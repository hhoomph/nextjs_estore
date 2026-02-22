# Visual Optimization & Design Enhancement Guide

**Document Version:** 1.0.0  
**Last Updated:** January 2025

---

## 1. Color System Reference

### Primary Brand Colors (Cyan Theme)
```css
/* Light Mode */
--primary: #0ea5e9 (Sky Cyan - Main CTA)
--secondary: #a8a29e (Warm Gray - Backgrounds)
--accent: #0d9488 (Teal - Highlights)

/* Dark Mode */
--primary-dark: #0284c7 (Darker Cyan)
--secondary-dark: #a8a29e (Same)
--accent-dark: #0d9488 (Same)
```

### Status Colors (Accessible)
```css
--success: #22c55e (Green - Good visibility)
--warning: #f59e0b (Amber - Clear alert)
--error: #ef4444 (Red - High contrast)
--info: #3b82f6 (Blue - Informational)
```

### Usage Guidelines
- **CTA Buttons:** Primary color (#0ea5e9)
- **Hover States:** +10% brightness
- **Disabled:** 50% opacity
- **Backgrounds:** Secondary color
- **Accents:** Teal (#0d9488)
- **Text:** Neutral-900 (light), Neutral-50 (dark)

---

## 2. Typography System

### Font Hierarchy
```typescript
// Heading 1 (Hero Title)
fontSize: "3.5rem" / "56px"
fontWeight: "bold" (700)
lineHeight: "1.2"
letterSpacing: "-0.02em"

// Heading 2
fontSize: "2.25rem" / "36px"
fontWeight: "bold" (700)
lineHeight: "1.3"

// Heading 3
fontSize: "1.875rem" / "30px"
fontWeight: "semibold" (600)
lineHeight: "1.4"

// Body Text
fontSize: "1rem" / "16px"
fontWeight: "normal" (400)
lineHeight: "1.6"
letterSpacing: "0"

// Small Text
fontSize: "0.875rem" / "14px"
fontWeight: "normal" (400)
lineHeight: "1.5"
```

### Persian Font Optimization
- **Primary:** Vazirmatn (excellent for body text)
- **Fallback:** Shabnam (acceptable alternative)
- **Line Height:** 1.8 for Persian text (higher than Latin)
- **Letter Spacing:** 0.02em for improved readability

---

## 3. Component Styling Reference

### Button Variants
```typescript
// Primary Button
<Button variant="default">
  // BG: #0ea5e9, Text: white
  // Hover: shadow-lg, 10% darker
  // Active: 20% darker
</Button>

// Secondary Button
<Button variant="secondary">
  // BG: #a8a29e, Text: dark
  // Hover: 10% darker
</Button>

// Outline Button
<Button variant="outline">
  // Border: 2px primary, Text: primary
  // Hover: bg-primary/10
</Button>

// Disabled State
<Button disabled>
  // Opacity: 50%
  // Cursor: not-allowed
</Button>
```

### Card Component
```typescript
// Standard Card
<Card>
  // Border: 1px neutral-200 (light), neutral-800 (dark)
  // BG: white (light), neutral-900 (dark)
  // Rounded: lg (12px)
  // Shadow: sm on hover
  // Transition: all 200ms
</Card>
```

### Badge Variants
```typescript
// Default Badge (Primary)
<Badge variant="default">
  // BG: primary/10 (#0ea5e9 with 10% opacity)
  // Text: #0284c7
  // Border: primary/30
</Badge>

// Success Badge
<Badge variant="success">
  // BG: green-50
  // Text: green-700
  // Border: green-300
</Badge>

// Warning Badge
<Badge variant="warning">
  // BG: amber-50
  // Text: amber-700
  // Border: amber-300
</Badge>

// Danger Badge
<Badge variant="info">
  // BG: blue-50
  // Text: blue-700
  // Border: blue-300
</Badge>
```

---

## 4. Animation & Transition Specs

### Standard Transitions
```css
/* Default transition for all interactive elements */
transition: all 200ms ease-in-out;

/* Hover animations */
&:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Focus states (accessibility) */
&:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Blob Animation
```css
@keyframes blob {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(20px, -50px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(50px, 50px) scale(1.05); }
}

.animate-blob {
  animation: blob 7s infinite;
}
```

### Loading Spinner
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

---

## 5. Responsive Design Breakpoints

### TailwindCSS Breakpoints
```css
Mobile:         0px (no prefix)
sm:             640px
md:             768px
lg:             1024px
xl:             1280px
2xl:            1536px
```

### Mobile-First Approach
```typescript
// Example: Image grid responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop, 4 on wide */}
</div>

// Example: Text sizing
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
  {/* Scales based on screen size */}
</h1>
```

---

## 6. Spacing Scale (TailwindCSS)

```css
0    = 0px        /* No space */
1    = 0.25rem    /* 4px */
2    = 0.5rem     /* 8px */
3    = 0.75rem    /* 12px */
4    = 1rem       /* 16px - Standard */
6    = 1.5rem     /* 24px */
8    = 2rem       /* 32px */
12   = 3rem       /* 48px */
16   = 4rem       /* 64px */
20   = 5rem       /* 80px */
24   = 6rem       /* 96px */
```

### Usage Pattern
```typescript
// Padding: p-{size}
<div className="p-4">  {/* 16px padding all sides */}

// Margin: m-{size}
<div className="mb-4"> {/* 16px margin-bottom */}

// Gap (flex/grid): gap-{size}
<div className="flex gap-4"> {/* 16px between items */}

// Height/Width: h-{size}, w-{size}
<div className="h-12 w-12"> {/* 48px x 48px */}
```

---

## 7. Dark Mode Styling

### Implementation
```typescript
// Automatic with system preference
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem={true}
/>

// CSS for dark mode
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #fafafa;
  }
}

// Dark-specific utilities
<div className="bg-white dark:bg-neutral-900">
  {/* White in light mode, dark gray in dark mode */}
</div>
```

### Color Adjustments for Dark Mode
```css
/* Light Mode */
Background: #ffffff
Foreground: #171717
Card BG: #fafafa
Border: #e5e5e5

/* Dark Mode */
Background: #0a0a0a
Foreground: #fafafa
Card BG: #171717
Border: #404040
```

---

## 8. Form Styling & States

### Input Component
```typescript
<Input
  type="text"
  placeholder="Enter text"
  className={cn(
    "px-4 py-2 rounded-lg border",
    "border-neutral-200 dark:border-neutral-800",
    "bg-white dark:bg-neutral-900",
    "text-neutral-900 dark:text-neutral-50",
    "placeholder:text-neutral-400",
    "focus:outline-none focus:ring-2 focus:ring-primary"
  )}
/>
```

### Form States
```typescript
// Normal state
border: 1px solid #e5e5e5

// Focus state
outline: none
ring: 2px solid #0ea5e9
ring-offset: 1px

// Error state
border: 1px solid #ef4444
ring: 2px solid #ef4444

// Disabled state
opacity: 50%
background: #f5f5f5
cursor: not-allowed
```

---

## 9. Shadow & Depth System

```css
/* Elevation levels */
shadow-none     = no shadow
shadow-sm       = 0 1px 2px 0 rgba(0, 0, 0, 0.05)
shadow-md       = 0 4px 6px -1px rgba(0, 0, 0, 0.1)
shadow-lg       = 0 10px 15px -3px rgba(0, 0, 0, 0.1)
shadow-xl       = 0 20px 25px -5px rgba(0, 0, 0, 0.1)
shadow-2xl      = 0 25px 50px -12px rgba(0, 0, 0, 0.25)
```

### Usage
```typescript
// Card with subtle shadow
<Card className="shadow-md hover:shadow-lg transition-shadow">

// Button with strong shadow on hover
<Button className="shadow-lg hover:shadow-xl">

// Modal overlay
<div className="shadow-2xl">
```

---

## 10. Loading States & Skeletons

### Loading Component Pattern
```typescript
export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
      <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded" />
      <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4" />
    </div>
  );
}
```

### Spinner Component
```typescript
<div className="animate-spin">
  <Loader2 className="h-6 w-6 text-primary" />
</div>
```

---

## 11. Error States & Validation

### Error Message Styling
```typescript
<div className="text-sm text-error-600 dark:text-error-400">
  {error.message}
</div>

// With icon
<div className="flex items-center gap-2 text-sm text-error-600">
  <AlertTriangle className="h-4 w-4" />
  <span>{error.message}</span>
</div>
```

### Success State
```typescript
<div className="flex items-center gap-2 text-sm text-success-600">
  <Check className="h-4 w-4" />
  <span>Successfully saved</span>
</div>
```

---

## 12. Image Gallery & Media

### Product Image Gallery
```typescript
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Main image */}
  <Image
    src={mainImage}
    alt={product.name}
    width={600}
    height={600}
    className="w-full h-auto rounded-lg"
    priority
  />
  
  {/* Thumbnails */}
  <div className="grid grid-cols-4 gap-2">
    {images.map((img) => (
      <Image
        key={img.id}
        src={img.url}
        alt="Thumbnail"
        width={150}
        height={150}
        className="rounded-lg cursor-pointer hover:opacity-80"
      />
    ))}
  </div>
</div>
```

---

## 13. Best Practices Summary

### Do's ✅
- Use semantic HTML elements
- Maintain consistent spacing (4px grid)
- Apply proper color contrast (WCAG AAA)
- Include focus states for keyboard users
- Use CSS for animations (GPU-accelerated)
- Test on real devices, not just desktop
- Optimize images for different screen sizes
- Provide alt text for all images
- Use loading states for async operations
- Implement error boundaries

### Don'ts ❌
- Don't use arbitrary color values (stay on palette)
- Don't ignore accessibility requirements
- Don't use images as text
- Don't create layout shifts with async content
- Don't overuse animations (performance)
- Don't forget mobile-first design
- Don't use auto on margins (layout issues)
- Don't mix margin and gap on same element
- Don't hardcode font sizes (use scale)
- Don't ignore dark mode compatibility

---

## 14. Component Customization Examples

### Custom Button Style
```typescript
<Button
  className={cn(
    "bg-gradient-to-r from-primary to-accent",
    "hover:shadow-lg transform hover:-translate-y-0.5",
    "transition-all duration-200 ease-out",
    "text-white font-semibold px-6 py-3",
    "rounded-lg inline-flex items-center gap-2"
  )}
>
  <ShoppingBag className="h-5 w-5" />
  Shop Now
</Button>
```

### Custom Card Layout
```typescript
<Card className="relative overflow-hidden group">
  {/* Gradient overlay on hover */}
  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 transition-all" />
  
  <CardHeader className="relative z-10">
    <CardTitle>{title}</CardTitle>
  </CardHeader>
  <CardContent className="relative z-10">
    {content}
  </CardContent>
</Card>
```

---

## 15. Performance Optimization Tips

### CSS
- Use Tailwind utility classes (they're tree-shaken)
- Avoid custom CSS when utilities exist
- Use CSS Grid for complex layouts
- Prefer transforms over position changes
- Minimize specific selectors

### JavaScript
- Code-split heavy components
- Use React.memo for pure components
- Implement proper key prop in lists
- Lazy load images with Next.js Image
- Use SWR for data fetching

### Bundle
- Monitor CSS bundle size
- Remove unused font weights
- Optimize images to WebP/AVIF
- Use dynamic imports for routes

---

## Testing Checklist

- ✅ All colors visible in light AND dark mode
- ✅ Text color contrast ≥ 7:1 (AAA standard)
- ✅ All buttons clickable and feedback visible
- ✅ Forms show validation states clearly
- ✅ Loading states prevent user confusion
- ✅ Error messages are helpful and visible
- ✅ All animations smooth (60fps)
- ✅ Responsive design works on all sizes
- ✅ Accessibility compliance verified
- ✅ Performance metrics within targets

---

## Resources

- **Color:** https://tailwindcss.com/docs/customizing-colors
- **Typography:** https://tailwindcss.com/docs/font-family
- **Spacing:** https://tailwindcss.com/docs/padding
- **Animations:** https://tailwindcss.com/docs/animation
- **WCAG:** https://www.w3.org/WAI/WCAG21/quickref/
- **Design System:** https://www.designsystems.com/

---

**Last Updated:** 2025-01-22  
**Next Review:** When design changes are planned
