import NextLink from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const base =
  "relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-lavender/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-aurora-lavender via-aurora-iris to-aurora-mint text-canvas shadow-[0_8px_40px_-8px_rgba(196,176,255,0.5)] hover:shadow-[0_12px_60px_-8px_rgba(196,176,255,0.7)] hover:-translate-y-0.5",
  secondary:
    "border border-line-strong bg-canvas-elevated/40 text-ink backdrop-blur-xl hover:bg-canvas-elevated/70 hover:border-aurora-lavender/40",
  ghost: "text-ink-muted hover:text-ink hover:bg-aurora-lavender/5",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof CommonProps>;

type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof NextLink>, keyof CommonProps | "href"> & {
    href: string;
  };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children, ...rest } =
    props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href !== undefined) {
    return (
      <NextLink
        className={classes}
        {...(rest as ComponentProps<typeof NextLink>)}
      >
        {children}
      </NextLink>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
