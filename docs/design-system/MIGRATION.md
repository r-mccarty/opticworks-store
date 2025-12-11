# Migration Guide

Guide for updating existing components to use the OpticWorks design system.

## Overview

The design system is dark-mode only. When migrating components:

1. Replace hardcoded colors with semantic tokens
2. Remove all `dark:` prefixes
3. Use design system components where possible

## Color Migration

### Text Colors

```diff
- className="text-gray-900"
+ className="text-foreground"

- className="text-gray-600"
+ className="text-foreground-muted"

- className="text-gray-400"
+ className="text-foreground-subtle"

- className="text-green-600"
+ className="text-success"

- className="text-red-600"
+ className="text-error"

- className="text-yellow-600"
+ className="text-warning"

- className="text-blue-600"
+ className="text-info"
```

### Background Colors

```diff
- className="bg-white"
+ className="bg-background-elevated"

- className="bg-gray-50"
+ className="bg-background-subtle"

- className="bg-gray-100"
+ className="bg-background-muted"

- className="bg-green-50"
+ className="bg-success-muted"

- className="bg-red-50"
+ className="bg-error-muted"

- className="bg-yellow-50"
+ className="bg-warning-muted"

- className="bg-blue-50"
+ className="bg-info-muted"
```

### Border Colors

```diff
- className="border-gray-200"
+ className="border-border"

- className="border-gray-300"
+ className="border-border-hover"

- className="border-green-200"
+ className="border-success/30"

- className="border-red-200"
+ className="border-error/30"
```

### Orange Accent

```diff
- className="bg-orange-500"
+ className="bg-primary"

- className="hover:bg-orange-600"
+ className="hover:bg-primary-hover"

- className="text-orange-500"
+ className="text-primary"
```

## Removing Dark Mode Prefixes

Since we're dark-mode only, remove all `dark:` prefixes:

```diff
- className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
+ className="bg-background-elevated text-foreground"

- className="border-gray-200 dark:border-gray-700"
+ className="border-border"
```

## Alert/Banner Pattern

Replace light-mode alert patterns:

```diff
- <div className="bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400">
+ <div className="bg-success-muted text-success border border-success/30">

- <div className="bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400">
+ <div className="bg-error-muted text-error border border-error/30">
```

## Button Migration

Replace custom button styles with the Button component:

```diff
- <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
+ <Button variant="success">

- <button className="bg-gray-500 text-white px-4 py-2 rounded">
+ <Button variant="secondary">

- <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">
+ <Button variant="outline">
```

## Card Migration

Replace custom card containers:

```diff
- <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
+ <Card>
+   <CardContent>
      ...
+   </CardContent>
+ </Card>
```

## Input Migration

Replace custom input styles:

```diff
- <input className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500">
+ <Input />
```

## Common Patterns

### Status Messages

```tsx
// Before (light mode)
<div className={`p-4 rounded-md ${
  success ? 'bg-green-50 text-green-800 border-green-200'
          : 'bg-red-50 text-red-800 border-red-200'
}`}>

// After (design system)
<div className={`p-4 rounded-xl border ${
  success ? 'bg-success-muted text-success border-success/30'
          : 'bg-error-muted text-error border-error/30'
}`}>
```

### Loading States

```tsx
// Before
<Loader2 className="h-6 w-6 animate-spin text-gray-400" />
<span className="text-gray-500">Loading...</span>

// After
<Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
<span className="text-foreground-muted">Loading...</span>
```

### Selection States

```tsx
// Before (multiple visual signals)
className={isSelected
  ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
  : 'border-gray-200'}

// After (single clear signal)
className={isSelected
  ? 'border-primary bg-primary-muted shadow-glow-primary'
  : 'border-border hover:border-border-hover'}
```

## Files Still Needing Migration

These page-level components still use hardcoded colors:

- `src/components/store/CartPage.tsx`
- `src/components/store/ProductGrid.tsx`
- `src/components/ui/Hero.tsx`
- `src/components/ui/Features.tsx`
- `src/components/ui/XaiLanding.tsx`
- `src/components/products/*.tsx`
- `src/components/support/*.tsx`
- `src/app/auth/*.tsx`

Apply the patterns above to migrate these files.

## Testing After Migration

1. Run lint: `pnpm run lint`
2. Run E2E tests: `pnpm exec playwright test --project=chromium`
3. Visual inspection in browser
