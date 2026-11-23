/** Ilustrasi piring Welcome: lingkaran bertumpuk dari token warna. */
export function PlateIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-auto w-44" role="img" aria-label="Ilustrasi piring makanan seimbang">
      <circle cx="100" cy="100" r="92" className="fill-surface stroke-border" strokeWidth="3" />
      <circle cx="100" cy="100" r="74" className="fill-surface stroke-border" strokeWidth="1.5" />
      <circle cx="78" cy="82" r="34" className="fill-accent-soft" />
      <circle cx="128" cy="88" r="28" className="fill-primary" fillOpacity="0.85" />
      <circle cx="100" cy="132" r="24" className="fill-accent" fillOpacity="0.8" />
      <circle cx="130" cy="84" r="7" className="fill-primary-strong" fillOpacity="0.7" />
      <circle cx="118" cy="98" r="5" className="fill-primary-strong" fillOpacity="0.7" />
      <circle cx="94" cy="130" r="4" className="fill-primary-strong" fillOpacity="0.7" />
    </svg>
  );
}
