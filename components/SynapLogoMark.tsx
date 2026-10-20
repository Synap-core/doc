interface SynapLogoMarkProps {
  className?: string;
}

/** The Synap mark, served from this site (public/logo.png) so the docs load it with no third-party request. */
export function SynapLogoMark({ className }: SynapLogoMarkProps) {
  return <img src="/logo.png" alt="Synap" className={`object-contain ${className ?? ''}`} loading="eager" decoding="async" />;
}
