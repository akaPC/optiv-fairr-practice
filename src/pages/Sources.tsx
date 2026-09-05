import { useMemo } from 'react';
import { BASE_INPUTS, TORNADO_CANDIDATES, computeTornado, type ModelInputs } from '../../model/fairr-model';
import { INPUT_GROUPS, INPUT_META } from '../../model/input-meta';
import { useModel } from '../lib/model-store';
import { money, num, pct } from '../lib/format';
import { ABadge, PageHeader, Panel, SectionLabel, Table, Tag } from '../components/ui';
import { SOURCES } from '../data/sources';

const KIND_LABEL = { primary: 'CrowdStrike primary', analysis: 'Third-party analysis', rates: 'Rates and compensation', optiv: 'Optiv context' } as const;

function fmt(v: number, format: string): string {
  if (format === 'pct') return pct(v, v * 100 % 1 === 0 ? 0 : 1);
  if (format === 'money') return money(v);
  return num(v, format === 'int' ? 0 : 1);
}

export default function Sources() {
  const { inputs, changedKeys } = useModel();
  const ranks = useMemo(() => {
    const t = computeTornado(BASE_INPUTS, TORNADO_CANDIDATES.length);
    const map = new Map<keyof ModelInputs, number>();
    t.bars.forEach((b, i) => {
      const cand = TORNADO_CANDIDATES.find((c) => c.key === b.key);
      for (const k of cand?.group ?? [b.key]) map.set(k, i + 1);
    });
    return map;
  }, []);
  const keys = Object.keys(BASE_INPUTS) as Array<keyof ModelInputs>;
  const assumptionCount = keys.filter((k) => INPUT_META[k].assumption).length;

  return (
    <div>
      <PageHeader
        eyebrow="Sources and assumptions · everything cited, everything else labeled"
        title="Where the numbers come from"
        lede={`${SOURCES.length} sources retrieved 4 September 2026. ${keys.length} model inputs, of which ${assumptionCount} are labeled ASSUMPTION because the sources are silent. Cleaned extracts live in research/sources/.`}
      />

      {(['primary', 'analysis', 'rates', 'optiv'] as const).map((kind) => (
        <div key={kind} className="mb-6">
          <SectionLabel>{KIND_LABEL[kind]}</SectionLabel>
          <div className="grid md:grid-cols-2 gap-2">
            {SOURCES.filter((s) => s.kind === kind).map((s) => (
              <Panel key={s.id} className="p-3">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-mono text-2xs text-slate-dim">[{s.id}]</span>
                  <a href={s.url} target="_blank" rel="noreferrer" className="font-head text-lg uppercase tracking-wide text-paper leading-tight hover:text-cyan">
                    {s.title}
                  </a>
                </div>
                <div className="font-mono text-2xs text-slate mb-1">
                  {s.publisher} · {s.date}
                </div>
                <p className="text-xs leading-5 text-slate-bright">{s.contributes}</p>
                <div className="mt-1 font-mono text-2xs text-slate-dim break-all">
                  <a href={s.url} target="_blank" rel="noreferrer" className="hover:text-cyan">
                    {s.url}
                  </a>
                </div>
              </Panel>
            ))}
          </div>
        </div>
      ))}

      <SectionLabel>Where the sources are silent</SectionLabel>
      <Panel className="mb-6">
        <p className="text-xs leading-5 text-slate-bright max-w-4xl">
          Not published anywhere in the sources above, and therefore modeled as ASSUMPTION inputs: QuiltWorks partner enrollment criteria and timelines; partner economics on Falcon
          Flex-transacted services (program margin, referral fees, MDF); Falcon IQ partner sandbox pricing; CrowdStrike's list price for the Frontier AI Readiness and Resilience
          Service; the GSIs' price points. Optiv's Elite tier designation is stated by the plan author and is not confirmed on the public partner page, which lists Partner of the
          Year awards and the $1 billion joint-sales milestone instead.
        </p>
      </Panel>

      <SectionLabel>
        Assumptions register · {assumptionCount} of {keys.length} inputs labeled <Tag tone="amber">ASSUMPTION</Tag>
        {changedKeys.length > 0 && <span className="ml-2 text-amber normal-case tracking-normal">· {changedKeys.length} currently modified from base</span>}
      </SectionLabel>
      {INPUT_GROUPS.map((g) => (
        <Panel key={g} title={g} className="mb-3">
          <Table minWidth={900}>
            <thead>
              <tr>
                <th>Input</th>
                <th>Key</th>
                <th className="text-right">Default</th>
                <th className="text-right">Current</th>
                <th>Unit</th>
                <th>Basis</th>
                <th className="text-right">Sens. rank</th>
              </tr>
            </thead>
            <tbody>
              {keys
                .filter((k) => INPUT_META[k].group === g)
                .map((k) => {
                  const m = INPUT_META[k];
                  const changed = changedKeys.includes(k);
                  return (
                    <tr key={k}>
                      <td className="font-body text-xs text-slate-bright whitespace-nowrap">
                        {m.label}
                        {m.assumption && <ABadge inputs={[k]} />}
                      </td>
                      <td className="text-slate-dim">{k}</td>
                      <td className="text-right">{fmt(BASE_INPUTS[k], m.format)}</td>
                      <td className={`text-right ${changed ? 'text-amber' : ''}`}>{fmt(inputs[k], m.format)}</td>
                      <td className="text-slate-dim whitespace-nowrap">{m.unit}</td>
                      <td className="font-body text-xs text-slate-bright min-w-[280px]">
                        {m.assumption ? (
                          <>
                            <span className="font-mono text-2xs text-amber">ASSUMPTION</span> {m.basis.replace(/^ASSUMPTION: /, '')}
                          </>
                        ) : (
                          m.basis
                        )}
                      </td>
                      <td className="text-right">{ranks.get(k) ?? '—'}</td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </Panel>
      ))}
    </div>
  );
}
