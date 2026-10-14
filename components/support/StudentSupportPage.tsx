import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CircleHelp,
  ClipboardCheck,
  GraduationCap,
  LifeBuoy,
  UserRound,
} from "lucide-react";

const cardClass =
  "rounded-2xl border border-[#e4e9f2] bg-white shadow-[0_2px_10px_rgba(16,29,73,0.025)]";

const faqs = [
  {
    question: "Where can I find my programmes and courses?",
    answer:
      "Open your student dashboard to see the programmes assigned to your account. Select a programme to continue to its learning materials when they are available.",
  },
  {
    question: "How do I check my learning progress?",
    answer:
      "Your student dashboard includes your available progress and assignment summaries. Progress information may be limited while lessons are being added to the portal.",
  },
  {
    question: "What should I do if an assignment is missing or will not submit?",
    answer:
      "Check that you are signed in to the right account and reopen the assignment from your course. If the issue continues, note the course name, assignment title, and what happened so your programme team can investigate.",
  },
  {
    question: "How can I update my contact details?",
    answer:
      "Review the details on your profile page. If a field cannot be changed from the portal, contact your programme administrator and include the email address associated with your account.",
  },
];

export default function StudentSupportPage() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-7 pb-10 sm:space-y-9">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#64718a]">
          Student resources
        </p>
        <h1 className="mt-2 flex items-center gap-3 text-2xl font-bold tracking-tight text-[#101d49] sm:text-3xl">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#fff6d8] text-[#765800]">
            <LifeBuoy size={22} strokeWidth={1.8} aria-hidden="true" />
          </span>
          Help &amp; Support
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64718a] sm:text-base">
          Find guidance for your learning experience, account, and the Nugi Innovations portal.
        </p>
      </header>

      <section className="overflow-hidden rounded-3xl bg-[#101d49] text-white shadow-[0_16px_40px_rgba(16,29,73,0.14)]">
        <div className="grid gap-8 px-6 py-7 sm:px-9 sm:py-9 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-[#ffdf78]">
              <CircleHelp size={15} aria-hidden="true" />
              Learning support
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
              Let’s help you keep learning.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
              Start with the answers below or return to your dashboard to review your programmes and current learning activity.
            </p>
          </div>
          <Link
            href="/student/dashboard"
            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#f5c542] px-5 py-2.5 text-sm font-semibold text-[#101d49] transition hover:bg-[#edb92e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d49] lg:self-center"
          >
            Go to dashboard
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section aria-labelledby="support-topics-title">
        <div className="mb-4">
          <h2 id="support-topics-title" className="text-lg font-semibold text-[#101d49]">
            Quick links
          </h2>
          <p className="mt-1 text-sm text-[#64718a]">Go directly to the part of your portal you need.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/student/dashboard"
            className={`${cardClass} group flex min-h-32 items-start gap-4 p-5 transition hover:border-[#cbd5e5] hover:shadow-[0_8px_24px_rgba(16,29,73,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101d49]`}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
              <BookOpen size={21} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-[#101d49]">Programmes &amp; learning</span>
              <span className="mt-1 block text-sm leading-5 text-[#64718a]">
                Return to your dashboard to find your current programmes and learning activity.
              </span>
            </span>
            <ArrowRight size={17} className="mt-1 shrink-0 text-[#8490a6] transition group-hover:translate-x-0.5 group-hover:text-[#101d49]" aria-hidden="true" />
          </Link>

          <Link
            href="/student/profile"
            className={`${cardClass} group flex min-h-32 items-start gap-4 p-5 transition hover:border-[#cbd5e5] hover:shadow-[0_8px_24px_rgba(16,29,73,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101d49]`}
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fff6d8] text-[#765800]">
              <UserRound size={21} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-[#101d49]">Account &amp; profile</span>
              <span className="mt-1 block text-sm leading-5 text-[#64718a]">
                Check the contact details associated with your student account.
              </span>
            </span>
            <ArrowRight size={17} className="mt-1 shrink-0 text-[#8490a6] transition group-hover:translate-x-0.5 group-hover:text-[#101d49]" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className={`${cardClass} overflow-hidden`} aria-labelledby="faq-title">
        <div className="flex items-center gap-3 border-b border-[#edf0f6] px-5 py-5 sm:px-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#eaf0ff] text-[#101d49]">
            <GraduationCap size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 id="faq-title" className="font-semibold text-[#101d49]">Common questions</h2>
            <p className="mt-0.5 text-xs text-[#64718a]">Practical answers for your student portal</p>
          </div>
        </div>
        <div className="divide-y divide-[#edf0f6] px-5 sm:px-6">
          {faqs.map((faq) => (
            <details key={faq.question} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center gap-3 text-sm font-semibold text-[#17233f] marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101d49]">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#f4f6fa] text-[#64718a] group-open:bg-[#fff6d8] group-open:text-[#765800]">
                  <ClipboardCheck size={15} aria-hidden="true" />
                </span>
                <span className="flex-1">{faq.question}</span>
                <span className="text-lg leading-none text-[#8490a6] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="ml-10 mt-3 max-w-3xl text-sm leading-6 text-[#64718a]">{faq.answer}</p>
            </details>
          ))}
        </div>
        <div className="border-t border-[#edf0f6] bg-[#f9fafd] px-5 py-4 text-sm leading-6 text-[#64718a] sm:px-6">
          Still need help? Share your registered email, programme name, and a short description of the issue with your programme administrator so they can assist you.
        </div>
      </section>
    </div>
  );
}
