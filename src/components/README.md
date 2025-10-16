# Components Directory

This directory contains all reusable UI components for the People Profile Web App.

## Structure

- **`/ui`** - Atomic, reusable UI components (buttons, inputs, cards, etc.)
- **`/profile`** - Profile-specific components (trait selectors, chronotype pickers, etc.)

## Guidelines

1. **Theme Tokens Only**: All components MUST use CSS variables from `globals.css`
   - Use `bg-card`, `text-foreground`, `border-border`, etc.
   - NO hardcoded Tailwind colors (e.g., `bg-blue-500` is forbidden)

2. **Light/Dark Mode**: All components must work in both themes

3. **Mobile Responsive**: Every component should be mobile-first

4. **TypeScript**: All components must be strongly typed with proper interfaces

5. **Reusability**: Components should be atomic and composable

## Example Component

```tsx
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md transition-colors",
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" && "border border-border bg-background hover:bg-accent",
        className
      )}
      {...props}
    />
  );
}
```

## Next Steps

Ready for PersonaUIEngineer to start building components!
