import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { PageTitle } from "@/components/ui/typography";

type PageWrapperProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
};

export function PageWrapper({
  children,
  title,
  description,
  className,
}: PageWrapperProps) {
  return (
    <section className={cn("flex flex-col gap-6 px-6 py-6", className)}>
      {title ? (
        <div className="space-y-1.5">
          <PageTitle>{title}</PageTitle>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
