import * as React from "react";
import { cn } from "@/lib/utils";

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6", className)} {...props} />;
}

export function Section({
  title,
  subtitle,
  id,
  children,
  className,
  action,
}: {
  title: string;
  subtitle?: string;
  id?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("py-12 sm:py-16", className)}>
      <Container>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
            {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
          </div>
          {action}
        </div>
        {children}
      </Container>
    </section>
  );
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="border-b border-line bg-surface">
      <Container className="py-10">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-muted">{description}</p>}
        {children}
      </Container>
    </div>
  );
}
