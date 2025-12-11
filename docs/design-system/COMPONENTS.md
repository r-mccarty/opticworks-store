# Component Usage Guide

Reference for using OpticWorks UI components.

## Button

Primary action component with multiple variants.

```tsx
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="success">Confirm</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon">Icon Only</Button>

// Loading state
<Button isLoading loadingText="Saving...">Save</Button>

// As link
<Button asChild>
  <Link href="/path">Navigate</Link>
</Button>
```

### Button Variants

| Variant | Usage |
|---------|-------|
| `default` | Primary actions, CTAs |
| `secondary` | Secondary actions |
| `outline` | Tertiary actions |
| `ghost` | Subtle actions, icon buttons |
| `destructive` | Delete, remove actions |
| `success` | Confirm, payment buttons |
| `link` | Text links |

## Card

Container component with elevated background.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    Main content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

## Input

Dark-styled form input.

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
  />
</div>
```

## Textarea

Multi-line text input.

```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea
  placeholder="Enter your message..."
  className="min-h-[150px]"
/>
```

## Select

Dropdown selection component.

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

## Dialog

Modal dialog with backdrop.

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description text
      </DialogDescription>
    </DialogHeader>
    <div className="py-4">
      Dialog content here
    </div>
    <DialogFooter>
      <Button variant="secondary">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Badge

Status indicator component.

```tsx
import { Badge } from '@/components/ui/badge';

// Variants
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>
```

## Switch

Toggle switch component.

```tsx
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

<div className="flex items-center space-x-2">
  <Switch id="notifications" />
  <Label htmlFor="notifications">Enable notifications</Label>
</div>
```

## Skeleton

Loading placeholder component.

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Loading card
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-48" />
    <Skeleton className="h-4 w-32 mt-2" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-20 w-full" />
  </CardContent>
</Card>
```

## Toast (Sonner)

Toast notifications via Sonner.

```tsx
import { toast } from 'sonner';

// Types
toast('Default message');
toast.success('Success message');
toast.error('Error message');
toast.warning('Warning message');
toast.info('Info message');

// With description
toast.success('Saved', {
  description: 'Your changes have been saved.',
});
```

## Form Components

Form wrapper with React Hook Form integration.

```tsx
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';

const form = useForm();

<Form {...form}>
  <FormField
    control={form.control}
    name="email"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormDescription>Your email address</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

## Alert Pattern

For status messages, use the semantic color tokens:

```tsx
// Success alert
<div className="rounded-xl bg-success-muted border border-success/30 p-4 text-success">
  <p className="font-medium">Success!</p>
  <p className="text-sm text-success/80">Your action completed successfully.</p>
</div>

// Error alert
<div className="rounded-xl bg-error-muted border border-error/30 p-4 text-error">
  <p className="font-medium">Error</p>
  <p className="text-sm text-error/80">Something went wrong.</p>
</div>

// Warning alert
<div className="rounded-xl bg-warning-muted border border-warning/30 p-4 text-warning">
  <p className="font-medium">Warning</p>
  <p className="text-sm text-warning/80">Please review this.</p>
</div>

// Info alert
<div className="rounded-xl bg-info-muted border border-info/30 p-4 text-info">
  <p className="font-medium">Info</p>
  <p className="text-sm text-info/80">Here's some information.</p>
</div>
```
