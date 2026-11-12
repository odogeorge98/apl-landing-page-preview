import Link from "next/link";
import { cn } from "@/lib/utils";

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1440px] px-5 md:px-10 lg:px-20", className)}>{children}</div>;
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[11px] font-bold uppercase tracking-wide text-brand", className)}>{children}</p>;
}

export function H2({ lines, className }: { lines: string[]; className?: string }) {
  return (
    <h2 className={cn("text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-ink sm:text-5xl lg:text-[56px]", className)}>
      {lines.map((l, i) => (
        <span key={l} className="block">
          {l}
        </span>
      ))}
    </h2>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "light" | "glass";
  className?: string;
}) {
  const styles = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    light: "bg-white text-ink hover:bg-white/90",
    glass: "border border-white/30 bg-white/10 text-white backdrop-blur hover:bg-white/20",
  }[variant];
  return (
    <Link
      href={href}
      className={cn("inline-flex h-12 items-center justify-center rounded-md px-6 text-sm font-semibold transition", styles, className)}
    >
      {children}
    </Link>
  );
}
