interface SynapLogoMarkProps {
  className?: string;
}

export function SynapLogoMark({ className }: SynapLogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="8" r="4" className="fill-fd-primary" />
      <circle cx="22" cy="24" r="4" className="fill-fd-primary" />
      <path
        d="M10 12 C10 20, 22 12, 22 20"
        className="stroke-fd-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="10" cy="8" r="5.5" className="stroke-fd-primary/35" strokeWidth="1" />
      <circle cx="22" cy="24" r="5.5" className="stroke-fd-primary/35" strokeWidth="1" />
    </svg>
  );
}
