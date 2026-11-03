/**
 * Gold bar that grows along the left edge of a table row on hover.
 * Place it as the first child of the row's first cell and give that cell
 * `relative`; the row needs the `group/row` class (see `rowHoverClass`).
 */
export function RowAccent() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 w-[3px] origin-center scale-y-0 rounded-r-full bg-[#f5c542] transition-transform duration-200 ease-out group-hover/row:scale-y-100 motion-reduce:transition-none"
    />
  );
}
