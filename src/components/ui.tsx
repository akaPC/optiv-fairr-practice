import { useState, type ReactNode } from 'react';
import type { ModelInputs } from '../../model/fairr-model';
import { INPUT_META } from '../../model/input-meta';

/** Uppercase tracked section label. */
export function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`label mb-2 ${className}`}>{children}</div>;
}

export function Panel({ children, className = '', title, right }: { children: ReactNode; className?: string; title?: ReactNode; right?: ReactNode }) {
  return (
    <section className={`panel p-4 ${className}`}>
      {(title || right) && (
        <header className="flex items-baseline justify-between gap-3 mb-3">
          {title && <div className="label mb-0">{title}</div>}
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

/**
 * Amber "A" badge marking an assumption-derived figure. The tooltip names the
 * input(s) the figure depends on and their basis.
 */
export function ABadge({ inputs, label }: { inputs: Array<keyof ModelInputs>; label?: string }) {
  const [open, setOpen] = useState(false);
  const text =
    label ??
    inputs
      .map((k) => `${INPUT_META[k].label}: ${INPUT_META[k].basis.replace(/^ASSUMPTION: /, '')}`)
      .join(' · ');
  return (
    <span className="relative inline-block align-top ml-1">
      <button
        type="button"
        aria-label={`Assumption: ${text}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="font-mono text-[9px] leading-none px-1 py-0.5 border border-amber text-amber hover:bg-amber/10 focus:outline-none focus:bg-amber/10"
      >
        A
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-30 left-0 top-full mt-1 w-64 max-w-[80vw] p-2 bg-panel2 border border-amber/60 text-2xs font-mono text-slate-bright normal-case tracking-normal text-left shadow-xl"
        >
          <span className="text-amber">ASSUMPTION</span> {text}
        </span>
      )}
    </span>
  );
}

export function KPI({
  label,
  value,
  sub,
  tone = 'default',
  assumption,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: 'default' | 'positive' | 'caution' | 'negative';
  assumption?: Array<keyof ModelInputs>;
}) {
  const color =
    tone === 'positive' ? 'text-cyan' : tone === 'caution' ? 'text-amber' : tone === 'negative' ? 'text-red' : 'text-paper';
  return (
    <div className="panel-2 p-3 min-w-0">
      <div className="label truncate">
        {label}
        {assumption && assumption.length > 0 && <ABadge inputs={assumption} />}
      </div>
      <div className={`kpi text-3xl md:text-4xl mt-1 ${color}`}>{value}</div>
      {sub && <div className="font-mono text-2xs text-slate mt-1 truncate">{sub}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, lede }: { eyebrow: string; title: string; lede?: ReactNode }) {
  return (
    <div className="mb-6 border-b border-line pb-4">
      <div className="label">{eyebrow}</div>
      <h1 className="font-head text-4xl md:text-5xl font-semibold uppercase leading-none tracking-wide text-paper">{title}</h1>
      {lede && <p className="mt-3 max-w-3xl text-slate-bright text-[15px] leading-6">{lede}</p>}
    </div>
  );
}

export function Tag({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'cyan' | 'amber' | 'red' }) {
  const c =
    tone === 'cyan'
      ? 'border-cyan/60 text-cyan'
      : tone === 'amber'
        ? 'border-amber/60 text-amber'
        : tone === 'red'
          ? 'border-red/60 text-red'
          : 'border-line2 text-slate';
  return <span className={`inline-block font-mono text-2xs uppercase tracking-[0.14em] px-1.5 py-0.5 border ${c}`}>{children}</span>;
}

export function Table({ children, minWidth }: { children: ReactNode; minWidth?: number }) {
  return (
    <div className="table-scroll">
      <table style={minWidth ? { minWidth } : undefined}>{children}</table>
    </div>
  );
}
