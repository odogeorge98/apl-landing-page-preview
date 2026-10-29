import { Award, ShieldCheck } from "lucide-react";

import { formatDate } from "@/components/admin/shared/admin-ui";
import {
  CERTIFICATE_TITLES,
  type CertificateTemplate,
  type CertificateType,
} from "@/lib/mock/admin-certificates";
import { cn } from "@/lib/utils";

export type CertificatePreviewData = {
  recipientName: string;
  programme: string;
  type: CertificateType;
  issuedDate: string;
  certificateNumber: string;
};

type CertificatePreviewProps = {
  data: CertificatePreviewData;
  template: Pick<CertificateTemplate, "accent" | "frame">;
  /** Overlays a diagonal "REVOKED" stamp. */
  revoked?: boolean;
  className?: string;
};

/**
 * Visual rendering of a certificate (A4 landscape ratio, 1.414 : 1).
 *
 * Every size inside uses container-query units (`cqw`) so the SAME component
 * renders crisply as a small template thumbnail, inside the issue dialog,
 * and as the full-size preview — no separate "mini" version to maintain.
 *
 * Colours come from the selected template so admins can see exactly what a
 * learner will receive before issuing.
 *
 * NOTE: the downloadable PDF should be generated server-side from the same
 * template so the preview and the file never drift apart.
 */
export function CertificatePreview({ data, template, revoked = false, className }: CertificatePreviewProps) {
  const title = CERTIFICATE_TITLES[data.type];

  return (
    <div className={cn("@container w-full", className)}>
      <div
        className="relative aspect-[1.414/1] w-full overflow-hidden rounded-[1.2cqw] shadow-[0_10px_30px_rgba(16,29,73,0.18)]"
        style={{ backgroundColor: template.frame }}
        role="img"
        aria-label={`${title} for ${data.recipientName || "recipient"} — ${data.programme}`}
      >
        {/* Decorative concentric rings, echoing the portal's hero cards. */}
        <div aria-hidden="true" className="absolute -right-[10cqw] -top-[14cqw] size-[42cqw] rounded-full border border-white/10" />
        <div aria-hidden="true" className="absolute -left-[12cqw] -bottom-[18cqw] size-[40cqw] rounded-full border border-white/10" />

        {/* Inner paper panel */}
        <div className="absolute inset-[2.6cqw] flex flex-col items-center rounded-[0.8cqw] bg-[#fffdf7] px-[6cqw] pt-[4.5cqw] text-center">
          {/* Thin accent frame line */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-[1.2cqw] rounded-[0.5cqw] border" style={{ borderColor: `${template.accent}80` }} />

          <p className="text-[1.5cqw] font-bold uppercase tracking-[0.35em] text-[#101d49]/70">Nugi Innovations</p>

          <h3 className="mt-[2.2cqw] font-serif text-[4.4cqw] font-bold leading-none text-[#101d49]">{title}</h3>

          <div aria-hidden="true" className="mt-[1.8cqw] h-[0.35cqw] w-[9cqw] rounded-full" style={{ backgroundColor: template.accent }} />

          <p className="mt-[2.4cqw] text-[1.6cqw] text-[#64718a]">This is proudly presented to</p>

          <p className="mt-[1cqw] max-w-full truncate font-serif text-[5cqw] italic leading-tight text-[#101d49]">
            {data.recipientName || "Recipient name"}
          </p>

          <p className="mt-[1.6cqw] max-w-[70cqw] text-[1.6cqw] leading-relaxed text-[#64718a]">
            for successfully completing the{" "}
            <strong className="font-semibold text-[#101d49]">{data.programme}</strong> programme, demonstrating the
            practical skills and commitment required by Nugi Innovations.
          </p>

          {/* Signatures + seal */}
          <div className="absolute inset-x-[7cqw] bottom-[5.5cqw] flex items-end justify-between">
            <Signature label="Programme Director" />

            <div
              className="flex size-[10cqw] items-center justify-center rounded-full border-[0.5cqw] bg-[#101d49]"
              style={{ borderColor: template.accent }}
              aria-hidden="true"
            >
              <Award className="size-[5cqw]" style={{ color: template.accent }} strokeWidth={1.4} />
            </div>

            <Signature label="Date issued" value={data.issuedDate ? formatDate(data.issuedDate) : "—"} />
          </div>

          {/* Verification footer */}
          <p className="absolute bottom-[2.4cqw] flex items-center gap-[0.6cqw] text-[1.15cqw] text-[#8995aa]">
            <ShieldCheck className="size-[1.4cqw]" aria-hidden="true" />
            {data.certificateNumber} · verify at nugi.io/verify
          </p>
        </div>

        {/* Revoked stamp */}
        {revoked && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40">
            <span className="-rotate-12 rounded-[1cqw] border-[0.5cqw] border-red-600 px-[3cqw] py-[1cqw] text-[6cqw] font-black uppercase tracking-widest text-red-600/90">
              Revoked
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Signature({ label, value }: { label: string; value?: string }) {
  return (
    <div className="w-[18cqw] text-center">
      <p className="truncate font-serif text-[1.8cqw] italic text-[#101d49]">{value ?? "N. Uche"}</p>
      <div className="mt-[0.6cqw] h-px bg-[#101d49]/30" />
      <p className="mt-[0.6cqw] text-[1.1cqw] uppercase tracking-[0.15em] text-[#8995aa]">{label}</p>
    </div>
  );
}
