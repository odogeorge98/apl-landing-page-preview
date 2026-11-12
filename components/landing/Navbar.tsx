"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { ButtonLink } from "./Section";
import { NAV_LINKS } from "./data";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const isActive = (href: string) => !href.includes("#") && (href === "/" ? path === "/" : path.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-[88px] md:px-10 lg:px-[72px]" aria-label="Main">
        <Logo />
        <ul className="hidden items-center gap-10 text-sm text-muted lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={cn("transition hover:text-brand", isActive(l.href) && "font-bold text-brand")}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3 md:gap-5">
          <ButtonLink href="/#demo" className="h-10 px-4 md:h-11 md:px-6">
            Book a demo
          </ButtonLink>
          <button
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="px-1 py-2 text-sm font-bold text-ink lg:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>
      {open && (
        <ul id="mobile-menu" className="border-t border-line bg-white px-5 py-3 lg:hidden">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)} className={cn("block py-3 text-sm font-medium text-ink", isActive(l.href) && "text-brand")}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
