import * as React from "react";

// Simple className merge utility
function cn(
  ...inputs: (string | undefined | null | false | Record<string, boolean>)[]
): string {
  return inputs
    .filter(Boolean)
    .map((input) => {
      if (typeof input === "string") return input;
      if (input && typeof input === "object") {
        return Object.entries(input)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(" ");
      }
      return "";
    })
    .join(" ");
}

// Simple Slot implementation for the asChild pattern
const Slot: React.FC<
  React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>
> = ({ children, ...props }) => {
  const child = React.Children.only(children) as React.ReactElement;
  return React.cloneElement(child, { ...props });
};

// Simple cva implementation
type VariantConfig = Record<string, Record<string, string>>;

function cva(
  base: string,
  config: {
    variants?: VariantConfig;
    defaultVariants?: Record<string, string>;
  }
) {
  return function (
    props?: { className?: string } & Record<string, string | undefined>
  ): string {
    const { className, ...variantProps } = props || {};
    const variants = config.variants || {};
    const defaultVariants = config.defaultVariants || {};

    const classes = [base];

    Object.keys(variants).forEach((variant) => {
      const value = variantProps?.[variant] || defaultVariants[variant];
      if (value && variants[variant][value]) {
        classes.push(variants[variant][value]);
      }
    });

    if (className) {
      classes.push(className);
    }

    return classes.filter(Boolean).join(" ");
  };
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          {...props}
          className={cn(buttonVariants({ variant, size, className }))}
        />
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
