import Image from "next/image";
import Link from "next/link";

/**
 * PEPP Cruise admin — page not found. Matches auth shell visuals; not wrapped as a login form.
 */
export default function NotFound() {
  const year = new Date().getFullYear();

  return (
    <section className="login-page-landing flex min-h-[100dvh] w-full flex-col font-sans text-white lg:flex-row">
      <div
        className="relative flex w-full flex-col lg:w-[44%] lg:max-w-[540px] lg:shrink-0 lg:min-h-[100dvh] min-h-0
          [background:radial-gradient(ellipse_90%_60%_at_0%_0%,rgba(255,255,255,0.045)_0%,transparent_55%),#0e0b16]"
      >
        <div className="flex flex-1 flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-12 xl:pl-16 xl:pr-10">
          <Link
            href="/"
            className="mb-8 block w-max lg:mb-10"
            aria-label="PEPP Cruise Admin Home"
          >
            <Image
              src="/assets/peppcruise_logo.png"
              alt="PEPP Cruise"
              width={150}
              height={50}
              priority
              className="h-8 w-auto sm:h-11"
            />
          </Link>

          <div className="w-full max-w-md space-y-6">
            <p className="text-sm font-medium tracking-wide text-white/45">
              Error 404
            </p>
            <h1 className="text-[28px] font-semibold tracking-tight md:text-[32px]">
              This page isn&apos;t available
            </h1>
            <p className="text-[15px] leading-relaxed text-white/55 md:text-base">
              The link may be broken or the page was removed. Head back to the
              admin home to continue.
            </p>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-[#e4e4e8] px-5 py-3.5 text-center text-sm font-semibold text-[#141216] shadow-sm transition hover:bg-[#f0f0f3] sm:w-auto sm:min-w-[200px]"
            >
              Back to admin home
            </Link>
          </div>
        </div>

        <div className="relative mx-0 min-h-[220px] w-full shrink-0 lg:hidden">
          <Image
            src="/assets/login-page-landing.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>

        <footer className="mt-auto px-6 pb-8 pt-6 sm:px-10 lg:px-12 xl:px-16 lg:pt-8">
          <Image
            src="/assets/peppcruise_logo_faded.png"
            alt=""
            width={180}
            height={40}
            className="h-8 w-auto opacity-80"
          />
          <p className="mt-3 text-left text-xs text-white/40">© {year} All rights reserved</p>
        </footer>
      </div>

      <div className="relative hidden min-h-[100dvh] w-full flex-1 overflow-hidden lg:block">
        <Image
          src="/assets/login-page-landing.png"
          alt=""
          fill
          priority
          sizes="60vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  );
}
