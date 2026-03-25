import type { ReactNode } from "react";

export function smoothLinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
  let d = `M ${points[0]!.x} ${points[0]!.y}`;
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1]!;
    const p1 = points[i]!;
    const midX = (p0.x + p1.x) / 2;
    d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  return d;
}

export function smoothAreaPath(points: { x: number; y: number }[], baseY: number): string {
  if (points.length === 0) return "";
  return `${smoothLinePath(points)} L ${points[points.length - 1]!.x} ${baseY} L ${points[0]!.x} ${baseY} Z`;
}

/** SVG that stretches to fill a flex card (parent should be `relative flex-1 min-h-[...]`) */
export function ChartFillSvg({
  children,
  viewBox,
  className,
}: {
  children: ReactNode;
  viewBox: string;
  className?: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      className={["absolute inset-0 h-full w-full", className].filter(Boolean).join(" ")}
      preserveAspectRatio="none"
      role="img"
      aria-hidden
    >
      {children}
    </svg>
  );
}
