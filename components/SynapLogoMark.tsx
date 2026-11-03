interface SynapLogoMarkProps {
  className?: string;
}

/**
 * The Synap mark: the amber S. public/brand/synap-mark.svg is an unchanged copy of
 * synap-landing/public/brand/synap-mark.svg (path and 6-stop radial gradient); never recolour or redraw it.
 * Its aspect ratio is 724/1584: size it by height and the width follows (`h-5 w-auto`).
 *
 * An <img>, not inline SVG: the layouts render the nav title more than once (desktop sidebar and mobile bar) from
 * one element, so an inline copy's gradient id would be shared, and a gradient defined in the hidden copy does not
 * paint the visible one.
 * Decorative: it always sits next to the word "Synap", so a screen reader would otherwise read the name twice.
 */
export function SynapLogoMark({ className }: SynapLogoMarkProps) {
  return (
    <img
      src="/brand/synap-mark.svg"
      alt=""
      width={724}
      height={1584}
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}
