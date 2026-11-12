import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`} aria-label="Academic Pavilion home">
      <span className="grid size-9 place-items-center rounded-lg bg-brand text-lg font-bold text-white">A</span>
      <span className="text-sm font-bold leading-snug text-ink">
        Academic
        <br />
        Pavilion
      </span>
    </Link>
  );
}
