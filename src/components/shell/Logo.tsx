export function Mark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} aria-hidden>
      <circle cx="32" cy="32" r="17" stroke="var(--ice)" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="3.5" fill="var(--signal)" />
      <path d="M32 8v10M32 46v10M8 32h10M46 32h10" stroke="var(--ice)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 32 L46 18" stroke="var(--cobalt)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
export function Wordmark({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Mark size={size} />
      <span className="font-bold tracking-[-0.03em] leading-none" style={{ fontSize: size * 0.68 }}>Hunter</span>
    </span>
  );
}
