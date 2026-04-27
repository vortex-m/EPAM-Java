import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TypographyProps = HTMLAttributes<HTMLElement>;

export function PageTitle({ className, ...props }: TypographyProps) {
  return (
    <h1
      className={cn("text-2xl font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function SectionTitle({ className, ...props }: TypographyProps) {
  return (
    <h2
      className={cn("text-lg font-semibold tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

export function MutedText({ className, ...props }: TypographyProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}
