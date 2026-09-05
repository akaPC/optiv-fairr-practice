import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { html, sections } from 'virtual:business-plan';
import { PageHeader } from '../components/ui';

export default function Plan() {
  const { hash } = useLocation();
  const [active, setActive] = useState<string>('');
  const topSections = useMemo(() => sections.filter((s) => s.level === 2), []);

  useEffect(() => {
    // Support deep links of the form #/plan#section-id (the router keeps only the first hash segment).
    const target = hash.replace(/^#/, '');
    if (target) {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ block: 'start' });
    }
  }, [hash]);

  useEffect(() => {
    const headings = topSections.map((s) => document.getElementById(s.id)).filter((el): el is HTMLElement => !!el);
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [topSections]);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: 'smooth' });
      setActive(id);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Business plan · rendered from docs/business-plan.md at build time"
        title="Optiv FAIRR practice plan"
        lede="Twelve sections, in the order practice leadership, alliance leadership, finance, and the CrowdStrike partner team will read them. Figures are the model's base case as of the build."
      />
      <div className="lg:hidden mb-4">
        <label className="label" htmlFor="plan-section">
          Jump to section
        </label>
        <select
          id="plan-section"
          className="w-full bg-panel border border-line font-mono text-xs px-2 py-2 text-paper"
          value={active}
          onChange={(e) => jump(e.target.value)}
        >
          <option value="">Select…</option>
          {topSections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.text}
            </option>
          ))}
        </select>
      </div>
      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        <aside className="hidden lg:block">
          <nav className="sticky top-28 panel p-3" aria-label="Plan sections">
            <div className="label">Sections</div>
            <ol className="space-y-0.5">
              {topSections.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => jump(s.id)}
                    className={`w-full text-left font-mono text-2xs leading-4 px-2 py-1 border-l-2 ${
                      active === s.id ? 'border-cyan text-cyan bg-cyan/5' : 'border-transparent text-slate hover:text-paper'
                    }`}
                  >
                    {s.text}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </aside>
        <article className="plan min-w-0 panel p-5 md:p-8" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
