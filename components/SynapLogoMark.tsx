interface SynapLogoMarkProps {
  className?: string;
}

export function SynapLogoMark({ className }: SynapLogoMarkProps) {
  return (
    <img
      src="https://synap.live/logo.png"
      alt="Synap"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}
