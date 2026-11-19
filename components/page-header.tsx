export function PageHeader({ en, title, desc }: { en: string; title: string; desc: string }) {
  return (
    <header className="mb-10">
      <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-fuchsia-300">{en}</p>
      <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-slate-400">{desc}</p>
    </header>
  );
}
