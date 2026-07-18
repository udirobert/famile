"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type AccordionItemProps = {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  /** Controlled open state (optional). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

/** transitions.dev accordion — height via grid 0fr↔1fr, chevron flips with scaleY. */
export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className,
  open: controlledOpen,
  onOpenChange,
}: AccordionItemProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolled;
  const panelId = useId();

  function toggle() {
    const next = !open;
    onOpenChange?.(next);
    if (controlledOpen === undefined) setUncontrolled(next);
  }

  return (
    <div
      className={cn("t-acc border-b border-line last:border-b-0", className)}
      data-open={open ? "true" : "false"}
    >
      <button
        type="button"
        className="t-acc-head flex w-full items-center justify-between gap-3 py-3 text-left text-sm text-ink transition-colors hover:text-aurora-lavender"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className="font-medium tracking-tight">{title}</span>
        <span className="t-acc-chevron shrink-0 text-ink-dim" aria-hidden>
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
            <path
              d="M4 6.5L8 10.5L12 6.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div className="t-acc-panel" id={panelId}>
        <div className="t-acc-panel-inner pb-3 text-sm leading-relaxed text-ink-muted">
          {children}
        </div>
      </div>
    </div>
  );
}

type AccordionProps = {
  children: ReactNode;
  className?: string;
};

export function Accordion({ children, className }: AccordionProps) {
  return <div className={cn("t-acc-group", className)}>{children}</div>;
}
