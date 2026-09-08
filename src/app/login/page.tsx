import Link from "next/link";
import { Mark } from "@/components/shell/Logo";
import { Button } from "@/components/ui";

export const metadata = { title: "Sign in" };

export default function Login() {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden border-r border-seam/60">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[520px] w-[520px]">
          {[0, 1, 2].map((i) => <span key={i} className="sonar-ring absolute inset-0 rounded-full border border-ice/40" />)}
          <div className="absolute inset-0 rounded-full border border-seam-2" />
          <div className="absolute inset-[18%] rounded-full border border-seam-2/70" />
          <div className="absolute inset-[36%] rounded-full border border-seam-2/50" />
          <div className="sweep absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(143,208,255,0.22), transparent 70deg)" }} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-signal shadow-[0_0_24px_4px_rgba(53,224,194,0.5)]" />
          <div className="absolute left-[63%] top-[31%] h-1.5 w-1.5 rounded-full bg-ice" />
          <div className="absolute left-[38%] top-[66%] h-1.5 w-1.5 rounded-full bg-ice/70" />
          <div className="absolute left-[71%] top-[58%] h-1.5 w-1.5 rounded-full bg-flare" />
        </div>
        <div className="relative flex items-center gap-3">
          <Mark size={34} />
          <span className="text-[22px] font-bold tracking-[-0.03em]">Hunter</span>
        </div>
        <div className="relative max-w-[30ch]">
          <h1 className="text-[42px] font-semibold leading-[1.05] tracking-[-0.03em]">Hunt from the prompt.</h1>
          <p className="text-muted text-[15px] mt-4 leading-relaxed">One hypothesis, every tenant, every EDR. Every query approved by a person and written to git.</p>
        </div>
      </section>
      <section className="flex items-center justify-center p-8">
        <div className="w-full max-w-[380px]">
          <div className="lg:hidden flex items-center gap-2.5 mb-10"><Mark size={28} /><span className="text-[18px] font-bold tracking-tight">Hunter</span></div>
          <h2 className="text-[24px] font-semibold tracking-[-0.02em]">Sign in</h2>
          <p className="text-muted text-[13.5px] mt-1.5">Use your Novacoast identity. Access to each tenant is granted separately.</p>
          <div className="mt-8 space-y-3">
            <Link href="/" className="block"><Button variant="primary" size="lg" className="w-full">Continue with Okta</Button></Link>
            <Link href="/" className="block"><Button size="lg" className="w-full">Continue with Microsoft Entra</Button></Link>
          </div>
          <p className="text-faint text-[12px] mt-8 leading-relaxed">Sessions are bound to your analyst identity and the tenants you select. Every action you take is recorded in the audit log.</p>
          <p className="text-faint text-[12px] mt-10">Novacoast</p>
        </div>
      </section>
    </div>
  );
}
