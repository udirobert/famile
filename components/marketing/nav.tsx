"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/motion/magnetic-button";
import { cn } from "@/lib/utils";
import { EASE, DUR, stagger, fadeUp } from "@/lib/motion";

const links = [
  { href: "/#sukari", label: "Sukari" },
  { href: "/#orbura", label: "Orbura" },
  { href: "/#ardum", label: "Ardum" },
  { href: "/#principles", label: "Principles" },
  { href: "/ask", label: "Ask" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-b border-line bg-canvas/70 backdrop-blur-xl"
            : "border-b border-transparent",
        )}
        style={{ viewTransitionName: "site-header" }}
      >
        <Container className="flex h-16 items-center justify-between sm:h-20">
          <NextLink
            href="/"
            className="font-display text-2xl italic tracking-tight text-ink transition-opacity hover:opacity-80"
          >
            famile
          </NextLink>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NextLink
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {l.label}
              </NextLink>
            ))}
          </nav>

          <div className="hidden md:inline-flex">
            <Magnetic strength={0.35}>
              <Button href="/ask" size="sm" variant="secondary">
                Ask
              </Button>
            </Magnetic>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center md:hidden"
            aria-label="Open menu"
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-px w-6 bg-ink" />
              <span className="h-px w-6 bg-ink" />
              <span className="h-px w-4 bg-ink" />
            </span>
          </button>
        </Container>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE.soft }}
            className="fixed inset-0 z-[60] bg-canvas/95 backdrop-blur-2xl md:hidden"
          >
            <Container className="flex h-16 items-center justify-between">
              <span className="font-display text-2xl italic tracking-tight text-ink">
                famile
              </span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center"
                aria-label="Close menu"
              >
                <span className="relative h-6 w-6">
                  <span className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-ink" />
                  <span className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-ink" />
                </span>
              </button>
            </Container>

            <motion.nav
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="flex flex-col px-6 py-8"
            >
              {links.map((l) => (
                <motion.div key={l.href} variants={fadeUp}>
                  <NextLink
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block py-4 font-display text-4xl tracking-tight text-ink transition-colors hover:text-aurora-lavender"
                  >
                    {l.label}
                  </NextLink>
                </motion.div>
              ))}
              <motion.div variants={fadeUp} className="mt-6">
                <Button
                  href="/ask"
                  size="lg"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  Ask
                </Button>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
