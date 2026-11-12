import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function SiteShell({ children, footer = "inner" }: { children: React.ReactNode; footer?: "home" | "inner" }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer variant={footer} />
    </>
  );
}
