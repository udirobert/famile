import NextLink from "next/link";
import { Container } from "@/components/ui/container";
import { products } from "@/lib/products";

export function Footer() {
  return (
    <footer
      className="relative z-10 border-t border-line bg-canvas/40"
      style={{ viewTransitionName: "site-footer" }}
    >
      <Container className="flex flex-col gap-10 py-16 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm">
          <NextLink
            href="/"
            className="font-display text-2xl italic tracking-tight text-ink"
          >
            famile
          </NextLink>
          <p className="mt-4 text-sm text-ink-muted">
            A warm place to peruse — or just be.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 sm:gap-16">
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-ink-dim">
              Also here
            </p>
            <ul className="space-y-3 text-sm">
              {products.map((p) => (
                <li key={p.slug}>
                  <NextLink
                    href={`/products/${p.slug}`}
                    className="text-ink-muted transition-colors hover:text-ink"
                  >
                    {p.name}
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-ink-dim">
              Space
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <NextLink
                  href="/ask"
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  Mira
                </NextLink>
              </li>
              <li>
                <NextLink
                  href="/about"
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  About
                </NextLink>
              </li>
              <li>
                <NextLink
                  href="/contact"
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  Contact
                </NextLink>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-ink-dim">
              Legal
            </p>
            <ul className="space-y-3 text-sm">
              <li>
                <NextLink
                  href="/privacy"
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  Privacy Policy
                </NextLink>
              </li>
              <li>
                <NextLink
                  href="/terms"
                  className="text-ink-muted transition-colors hover:text-ink"
                >
                  Terms of Use
                </NextLink>
              </li>
            </ul>
          </div>
        </div>
      </Container>
      <Container className="flex flex-col items-center justify-between gap-4 border-t border-line py-8 text-xs text-ink-dim sm:flex-row">
        <p>© {new Date().getFullYear()} famile.</p>
        <p>famile.xyz</p>
      </Container>
    </footer>
  );
}
