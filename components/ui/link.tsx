import NextLink from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type LinkProps = ComponentProps<typeof NextLink>;

export function Link({ className, children, ...props }: LinkProps) {
  return (
    <NextLink
      className={cn(
        "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-lavender/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas rounded-full",
        className,
      )}
      {...props}
    >
      {children}
    </NextLink>
  );
}
