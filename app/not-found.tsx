import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Compass, Home } from "lucide-react";

export default function NotFound() {
  const year = new Date().getFullYear();

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#f6f8fc] text-[#17233f]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-48 size-[34rem] rounded-full border border-[#101d49]/[0.06]" />
        <div className="absolute -right-24 -top-32 size-[27rem] rounded-full border border-[#101d49]/[0.06]" />
        <div className="absolute -bottom-64 -left-48 size-[34rem] rounded-full bg-[#f5c542]/[0.12] blur-3xl" />
        <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(#101d49_0.7px,transparent_0.7px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
        <Link href="/" aria-label="Nugi Innovations home" className="inline-flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-[#f5c542] shadow-sm shadow-[#101d49]/10">
            <Image src="/ni-logo.svg" alt="" width={30} height={30} priority className="size-8 object-contain" />
          </span>
          <span>
            <span className="block text-sm font-extrabold tracking-tight text-[#101d49] sm:text-base">Nugi Innovations</span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71809a]">Learning portal</span>
          </span>
        </Link>
        <Link href="/support" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#64718a] transition hover:bg-white hover:text-[#101d49] sm:inline-flex">
          Help &amp; support <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 items-center px-5 pb-14 pt-8 sm:px-8 sm:pb-20 lg:px-10">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)] lg:gap-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e4e9f2] bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#64718a] shadow-sm shadow-[#101d49]/[0.03]">
              <Compass size={15} className="text-[#8c6500]" aria-hidden="true" />
              Page not found
            </div>
            <p className="mt-8 select-none text-[clamp(6rem,20vw,12rem)] font-black leading-[0.78] tracking-[-0.09em] text-[#101d49]" aria-hidden="true">
              404<span className="text-[#f5c542]">.</span>
            </p>
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-[#101d49] sm:text-4xl lg:text-5xl">
              This page is off the learning path.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#64718a] sm:text-lg">
              The address may be incorrect, or the page may have moved. Let&apos;s get you back to your Nugi Innovations workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#101d49] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(16,29,73,0.16)] transition hover:bg-[#172a60] focus:outline-none focus:ring-4 focus:ring-[#101d49]/15"
              >
                <Home size={17} aria-hidden="true" />Return to home
              </Link>
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dce3ef] bg-white px-5 py-3 text-sm font-semibold text-[#101d49] transition hover:border-[#c5cfdf] hover:bg-[#fbfcfe] focus:outline-none focus:ring-4 focus:ring-[#101d49]/10"
              >
                <ArrowLeft size={16} aria-hidden="true" />Go to sign in
              </Link>
            </div>
          </div>

          <aside className="relative mx-auto w-full max-w-md">
            <div aria-hidden="true" className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-[#f5c542]/25 via-transparent to-[#101d49]/10 blur-xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,29,73,0.12)] backdrop-blur sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#fff6d8] text-[#8c6500]">
                  <Compass size={23} aria-hidden="true" />
                </div>
                <span className="rounded-full bg-[#f1f4fc] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#64718a]">Nugi portal</span>
              </div>
              <h2 className="mt-7 text-xl font-bold tracking-tight text-[#101d49]">Your next step is still here.</h2>
              <p className="mt-2 text-sm leading-6 text-[#71809a]">
                Your courses, programmes, and learning workspace are just a click away.
              </p>
              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-[#f7f8fc] p-3.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#101d49] text-[#f5c542]"><Home size={17} aria-hidden="true" /></span>
                  <div>
                    <p className="text-xs font-semibold text-[#101d49]">Portal home</p>
                    <p className="mt-0.5 text-[11px] text-[#8490a6]">Return to the main landing page</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-[#f7f8fc] p-3.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-[#fff6d8] text-[#8c6500]"><Compass size={17} aria-hidden="true" /></span>
                  <div>
                    <p className="text-xs font-semibold text-[#101d49]">Learning workspace</p>
                    <p className="mt-0.5 text-[11px] text-[#8490a6]">Sign in to continue your journey</p>
                  </div>
                </div>
              </div>
              <div className="mt-7 border-t border-[#edf0f6] pt-5 text-xs leading-5 text-[#8490a6]">
                If you followed a saved link, check the address or contact support for help finding the right page.
              </div>
            </div>
          </aside>
        </div>
      </section>

      <footer className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-2 border-t border-[#dfe5ef] px-5 py-5 text-xs text-[#8490a6] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
        <p>© {year} Nugi Innovations. All rights reserved.</p>
        <p>Learn with purpose.</p>
      </footer>
    </main>
  );
}
