export function PageHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <header className="pb-10 pt-14 sm:pb-14 sm:pt-20">
      <p className="hero-in text-sm font-semibold text-accent">{eyebrow}</p>
      <h1
        className="hero-in mt-2 text-4xl font-semibold tracking-tight text-fg sm:text-6xl"
        style={{ "--delay": "80ms" } as React.CSSProperties}
      >
        {title}
      </h1>
      <p
        className="hero-in mt-4 max-w-2xl text-lg leading-8 text-muted sm:text-xl"
        style={{ "--delay": "160ms" } as React.CSSProperties}
      >
        {desc}
      </p>
    </header>
  );
}
