# UI Components Library

This directory contains a collection of reusable UI components following the shadcn/ui design system.

## Components

### Button (`button.jsx`)
A versatile button component with multiple variants and sizes.

**Variants:** default, secondary, destructive, outline, ghost, link  
**Sizes:** default, sm, lg, icon

```jsx
import { Button } from "@/components/ui/button"

<Button variant="default">Click me</Button>
<Button variant="outline" size="sm">Small Button</Button>
```

### Card (`card.jsx`)
Container component for grouping related content.

**Sub-components:** Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

```jsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

### Input (`input.jsx`)
Text input field with consistent styling.

```jsx
import { Input } from "@/components/ui/input"

<Input type="email" placeholder="Enter email" />
```

### Label (`label.jsx`)
Accessible form label component.

```jsx
import { Label } from "@/components/ui/label"

<Label htmlFor="email">Email</Label>
```

### Textarea (`textarea.jsx`)
Multi-line text input field.

```jsx
import { Textarea } from "@/components/ui/textarea"

<Textarea placeholder="Enter message" />
```

### Checkbox (`checkbox.jsx`)
Checkbox input with Radix UI primitives.

```jsx
import { Checkbox } from "@/components/ui/checkbox"

<Checkbox id="terms" />
```

### Select (`select.jsx`)
Dropdown select component with scrollable options.

**Sub-components:** Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel

```jsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Dialog (`dialog.jsx`)
Modal dialog component.

**Sub-components:** Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter

```jsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

### DropdownMenu (`dropdown-menu.jsx`)
Context menu component with checkable items.

**Sub-components:** DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator

```jsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>Item 1</DropdownMenuItem>
    <DropdownMenuItem>Item 2</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Badge (`badge.jsx`)
Small badge or tag component.

**Variants:** default, secondary, destructive, outline

```jsx
import { Badge } from "@/components/ui/badge"

<Badge>New</Badge>
<Badge variant="destructive">Error</Badge>
```

### Avatar (`avatar.jsx`)
User avatar component with fallback.

**Sub-components:** Avatar, AvatarImage, AvatarFallback

```jsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

<Avatar>
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>AB</AvatarFallback>
</Avatar>
```

### Separator (`separator.jsx`)
Horizontal or vertical divider line.

```jsx
import { Separator } from "@/components/ui/separator"

<Separator />
<Separator orientation="vertical" />
```

### Toast (`toast.jsx`, `toaster.jsx`, `use-toast.js`)
Toast notification system.

```jsx
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

function MyComponent() {
  const { toast } = useToast()
  
  return (
    <>
      <button onClick={() => toast({ title: "Success!", description: "Action completed" })}>
        Show Toast
      </button>
      <Toaster />
    </>
  )
}
```

## Utilities

### `cn()` function (`lib/utils.js`)
Utility for merging Tailwind CSS classes with proper precedence.

```jsx
import { cn } from "@/lib/utils"

<div className={cn("base-class", condition && "conditional-class", className)} />
```

## Theming

The components use CSS variables defined in `src/index.css`. The theme supports both light and dark modes.

### CSS Variables
- `--background` - Background color
- `--foreground` - Text color
- `--primary` - Primary brand color
- `--secondary` - Secondary color
- `--muted` - Muted/subtle color
- `--accent` - Accent color
- `--destructive` - Error/danger color
- `--border` - Border color
- `--input` - Input border color
- `--ring` - Focus ring color

## Path Alias

Import components using the `@` alias which points to `src/`:

```jsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

## Dependencies

All components are built using:
- **Radix UI** - Accessible primitives
- **class-variance-authority** - CVA for variant management
- **clsx** & **tailwind-merge** - Class name utilities
- **lucide-react** - Icon library
- **Tailwind CSS** - Styling

## Demo

See `src/pages/UIComponentsDemo.jsx` for a comprehensive showcase of all components.
