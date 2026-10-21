interface SynapLogoMarkProps {
  className?: string;
}

/**
 * The Synap mark, served from this site (public/logo.png) so the docs load it with no third-party request.
 * Decorative: it always sits next to the word "Synap", so a screen reader would otherwise read the name twice.
 */
export function SynapLogoMark({ className }: SynapLogoMarkProps) {
  return <img src="/logo.png" alt="" className={`object-contain ${className ?? ''}`} loading="eager" decoding="async" />;
}
