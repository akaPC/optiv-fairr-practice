import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { OFFERING_KEYS, type ModelInputs, type MonthRow, type OfferingKey } from '../../model/fairr-model';
import { INPUT_GROUPS, INPUT_META, type InputGroup } from '../../model/input-meta';
import { OFFERING_LABELS } from '../../model/fairr-model';
import { useModel } from '../lib/model-store';
import { int, money, num, pct } from '../lib/format';
import { COLORS, OFFERING_COLORS, OFFERING_SHORT, compactMoney } from '../lib/charts';
import { ABadge, KPI, PageHeader, Panel, SectionLabel, Table } from '../components/ui';

function InputRow({ k }: { k: keyof ModelInputs }) {
  const { inputs, setInput } = useModel();
  const meta = INPUT_META[k];
  const v = inputs[k];
  const isPct = meta.format === 'pct';
  const display = isPct ? Math.round(v * 1000) / 10 : v;
  const step = meta.step ?? (isPct ? 0.01 : 1);
  return (
    <div className="py-1.5 border-b border-line last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <label htmlFor={`in-${k}`} className="text-2xs leading-4 text-slate-bright flex-1">
          {meta.label}
          {meta.assumption && <ABadge inputs={[k]} />}
        </label>
        <div className="flex items-center gap-1 shrink-0">
          <input
            id={`in-${k}`}
            type="number"
            className="w-24 bg-ink border border-line2 font-mono text-xs text-right px-1.5 py-0.5 text-paper focus:border-cyan focus:outline-none"
            value={display}
            step={isPct ? step * 100 : step}
            min={meta.min !== undefined ? (isPct ? meta.min * 100 : meta.min) : undefined}
            max={meta.max !== undefined ? (isPct ? meta.max * 100 : meta.max) : undefined}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) setInput(k, isPct ? n / 100 : n);
            }}
          />
          <span className="font-mono text-2xs text-slate-dim w-14 truncate">{isPct ? '%' : meta.unit}</span>
        </div>
      </div>
      {meta.min !== undefined && meta.max !== undefined && (
        <input
          type="range"
          aria-label={`${meta.label} slider`}
          className="mt-1"
          min={meta.min}
          max={meta.max}
          step={step}
          value={v}
          onChange={(e) => setInput(k, Number(e.target.value))}
        />
      )}
    </div>
  );
}

function InputGroupPanel({ group, open, onToggle }: { group: InputGroup; open: boolean; onToggle: () => void }) {
  const { changedKeys } = useModel();
  const keys = (Object.keys(INPUT_META) as Array<keyof ModelInputs>).filter((k) => INPUT_META[k].group === group);
  const changed = keys.filter((k) => changedKeys.includes(k)).length;
  return (
    <div className="panel mb-2">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2 text-left" aria-expanded={open}>
        <span className="label mb-0">
          {group} <span className="text-slate-dim">· {keys.length}</span>
          {changed > 0 && <span className="ml-2 text-amber">{changed} modified</span>}
        </span>
        <span className="font-mono text-xs text-slate">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-3 pb-2">
          {keys.map((k) => (
            <InputRow key={k} k={k} />
          ))}
        </div>
      )}
    </div>
  );
}

const PNL_LINES: Array<{ label: string; pick: (r: MonthRow) => number; kind?: 'money' | 'pct' | 'num' | 'int'; strong?: boolean; indent?: boolean }> = [
  { label: 'Advisors', pick: (r) => r.advisors, kind: 'int' },
  { label: 'Utilization', pick: (r) => r.utilization, kind: 'pct' },
  { label: 'Backlog (weeks)', pick: (r) => r.backlogWeeks, kind: 'num' },
  { label: 'Assessments accepted', pick: (r) => r.assessmentsAccepted, kind: 'num' },
  { label: 'Retainers active', pick: (r) => r.retainersActive, kind: 'num' },
  { label: 'FC add-on customers', pick: (r) => r.fcCustomers, kind: 'num' },
  ...OFFERING_KEYS.map((k) => ({ label: `Revenue: ${OFFERING_SHORT[k]}`, pick: (r: MonthRow) => r.grossRevenue[k], indent: true })),
  { label: 'Gross revenue', pick: (r) => r.grossRevenueTotal, strong: true },
  { label: 'Falcon Flex program margin', pick: (r) => -r.flexProgramMargin, indent: true },
  { label: 'Net revenue', pick: (r) => r.netRevenue, strong: true },
  { label: 'Advisor labor', pick: (r) => -r.advisorLabor, indent: true },
  { label: 'Internal bench', pick: (r) => -r.benchCost, indent: true },
  { label: 'Add-on delivery cost', pick: (r) => -r.fcDeliveryCost, indent: true },
  { label: 'Gross margin', pick: (r) => r.grossMargin, strong: true },
  { label: 'Gross margin %', pick: (r) => r.grossMarginPct, kind: 'pct' },
  { label: 'Sales/SE overhead', pick: (r) => -r.salesOverhead, indent: true },
  { label: 'Travel', pick: (r) => -r.travel, indent: true },
  { label: 'Contribution margin', pick: (r) => r.contributionMargin, strong: true },
  { label: 'Practice lead', pick: (r) => -r.practiceLead, indent: true },
  { label: 'Marketing / MDF', pick: (r) => -r.marketing, indent: true },
  { label: 'Training', pick: (r) => -r.training, indent: true },
  { label: 'Tooling / sandbox', pick: (r) => -r.tooling, indent: true },
  { label: 'Insurance / legal', pick: (r) => -r.insuranceLegal, indent: true },
  { label: 'EBITDA', pick: (r) => r.ebitda, strong: true },
  { label: 'Collections', pick: (r) => r.collections },
  { label: 'Cash out', pick: (r) => -r.cashOut },
  { label: 'Net cash', pick: (r) => r.netCash, strong: true },
  { label: 'Cumulative cash', pick: (r) => r.cumulativeCash, strong: true },
  { label: 'Revenue left on the table', pick: (r) => r.revenueLeftOnTable },
];

function fmtCell(v: number, kind: 'money' | 'pct' | 'num' | 'int' = 'money'): string {
  if (kind === 'pct') return pct(v, 0);
  if (kind === 'num') return num(v, 1);
  if (kind === 'int') return int(v);
  return money(v, { compact: true, decimals: 0 });
}

export default function Model() {
  const { outputs, inputs, reset, isBaseCase } = useModel();
  const [open, setOpen] = useState<Record<InputGroup, boolean>>({ People: true, Overhead: false, Pricing: true, Delivery: false, Demand: true, Scenario: false });
  const [showMonthly, setShowMonthly] = useState(true);
  const s = outputs.summary;

  const monthly = useMemo(
    () =>
      outputs.months.map((r) => ({
        m: r.month,
        ...Object.fromEntries(OFFERING_KEYS.map((k) => [k, Math.round(r.grossRevenue[k])])),
        cumulativeCash: Math.round(r.cumulativeCash),
        netCash: Math.round(r.netCash),
        advisors: r.advisors,
        utilization: Math.round(r.utilization * 1000) / 10,
        capacityHours: Math.round(r.advisorCapacityHours + r.benchHours),
        backlogWeeks: Math.round(r.backlogWeeks * 10) / 10,
        grossMarginPct: Math.round(r.grossMarginPct * 1000) / 10,
        ebitdaPct: r.netRevenue > 0 ? Math.round((r.ebitda / r.netRevenue) * 1000) / 10 : 0,
      })),
    [outputs],
  );

  const csv = useMemo(() => {
    const headers = ['Month', 'Year', ...PNL_LINES.map((l) => l.label)];
    const rows = outputs.months.map((r) => [r.month, r.year, ...PNL_LINES.map((l) => l.pick(r))]);
    return [headers.join(','), ...rows.map((row) => row.map((v) => (typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(4)) : String(v))).join(','))].join('\n');
  }, [outputs]);

  const download = () => {
    try {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fairr-model-${isBaseCase ? 'base' : 'custom'}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // Some sandboxes block downloads; the full table is rendered below.
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Financial model · computeModel() runs in the browser"
        title="36-month model"
        lede="Every figure on this page recomputes as you edit the rail. Inputs persist in this browser only. Amber A badges mark inputs the sources do not support."
      />
      <div className="grid xl:grid-cols-[340px_1fr] gap-4">
        <aside>
          <div className="flex items-center justify-between mb-2">
            <SectionLabel className="mb-0">Inputs</SectionLabel>
            <button
              type="button"
              onClick={reset}
              disabled={isBaseCase}
              className="font-mono text-2xs uppercase tracking-[0.14em] px-2 py-1 border border-line2 text-slate hover:text-cyan hover:border-cyan disabled:opacity-40 disabled:hover:text-slate disabled:hover:border-line2"
            >
              Reset to base case
            </button>
          </div>
          <div className="xl:sticky xl:top-28 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto pr-1">
            {INPUT_GROUPS.map((g) => (
              <InputGroupPanel key={g} group={g} open={open[g]} onToggle={() => setOpen((o) => ({ ...o, [g]: !o[g] }))} />
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <KPI label="Y1 / Y2 / Y3 gross revenue" value={money(s.revenueYear3, { compact: true })} sub={`${money(s.revenueYear1, { compact: true })} / ${money(s.revenueYear2, { compact: true })} / Y3`} assumption={['assessmentHours', 'benchMaxHoursPerMonth']} />
            <KPI label="EBITDA Y2" value={money(s.ebitdaYear2, { compact: true })} sub={`Y1 ${money(s.ebitdaYear1, { compact: true })} · Y3 ${money(s.ebitdaYear3, { compact: true })}`} tone={s.ebitdaYear2 >= 0 ? 'positive' : 'negative'} assumption={['flexProgramMarginPct', 'fcAddonDeliveryCostPct']} />
            <KPI label="Peak funding · ask" value={money(s.investmentAsk, { compact: true })} sub={`peak ${money(s.peakFundingRequirement, { compact: true })} in M${s.peakFundingMonth}`} tone="caution" assumption={['flexProgramMarginPct', 'benchCostPerHour']} />
            <KPI label="Cash break-even" value={s.cashBreakEvenMonth ? `M${s.cashBreakEvenMonth}` : 'beyond M36'} sub={`headcount ${inputs.startingAdvisors} → ${s.endingAdvisors}`} tone={s.cashBreakEvenMonth ? 'positive' : 'negative'} assumption={['hireLagMonths', 'newHireRampUtil']} />
          </div>

          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <Panel title="Monthly gross revenue by offering">
              <div className="h-56">
                <ResponsiveContainer>
                  <AreaChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="m" tickFormatter={(v) => `M${v}`} interval={5} />
                    <YAxis tickFormatter={compactMoney} width={52} />
                    <Tooltip formatter={(v: number, n: string) => [money(v), OFFERING_SHORT[n as OfferingKey] ?? n]} labelFormatter={(l) => `Month ${l}`} />
                    <Legend formatter={(v) => OFFERING_SHORT[v as OfferingKey] ?? v} wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} />
                    {OFFERING_KEYS.map((k) => (
                      <Area key={k} type="monotone" dataKey={k} stackId="rev" stroke={OFFERING_COLORS[k]} fill={OFFERING_COLORS[k]} fillOpacity={0.55} isAnimationActive={false} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Cumulative cash">
              <div className="h-56">
                <ResponsiveContainer>
                  <AreaChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="m" tickFormatter={(v) => `M${v}`} interval={5} />
                    <YAxis tickFormatter={compactMoney} width={52} />
                    <Tooltip formatter={(v: number, n: string) => [money(v), n === 'cumulativeCash' ? 'Cumulative cash' : 'Net cash']} labelFormatter={(l) => `Month ${l}`} />
                    <ReferenceLine y={0} stroke={COLORS.slateDim} />
                    {s.cashBreakEvenMonth && <ReferenceLine x={s.cashBreakEvenMonth} stroke={COLORS.cyan} strokeDasharray="3 3" label={{ value: `BE M${s.cashBreakEvenMonth}`, fill: COLORS.cyan, fontSize: 10, position: 'insideTopLeft' }} />}
                    <ReferenceLine x={s.peakFundingMonth} stroke={COLORS.amber} strokeDasharray="3 3" label={{ value: `Peak M${s.peakFundingMonth}`, fill: COLORS.amber, fontSize: 10, position: 'insideBottomRight' }} />
                    <Area type="monotone" dataKey="cumulativeCash" stroke={COLORS.cyan} fill={COLORS.cyan} fillOpacity={0.2} isAnimationActive={false} />
                    <Bar dataKey="netCash" fill={COLORS.slateDim} isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Headcount vs utilization vs backlog">
              <div className="h-56">
                <ResponsiveContainer>
                  <LineChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="m" tickFormatter={(v) => `M${v}`} interval={5} />
                    <YAxis yAxisId="pct" tickFormatter={(v) => `${v}%`} width={40} domain={[0, 100]} />
                    <YAxis yAxisId="n" orientation="right" width={34} allowDecimals={false} />
                    <Tooltip
                      formatter={(v: number, n: string) => [n === 'utilization' ? `${v}%` : n === 'backlogWeeks' ? `${v} wks` : v, n === 'utilization' ? 'Utilization' : n === 'backlogWeeks' ? 'Backlog' : 'Advisors']}
                      labelFormatter={(l) => `Month ${l}`}
                    />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} formatter={(v) => (v === 'utilization' ? 'Utilization %' : v === 'backlogWeeks' ? 'Backlog weeks' : 'Advisors')} />
                    <ReferenceLine yAxisId="pct" y={inputs.hireUtilThreshold * 100} stroke={COLORS.amber} strokeDasharray="2 4" />
                    <Line yAxisId="pct" type="stepAfter" dataKey="utilization" stroke={COLORS.cyan} dot={false} isAnimationActive={false} />
                    <Line yAxisId="n" type="stepAfter" dataKey="advisors" stroke={COLORS.paper} dot={false} isAnimationActive={false} />
                    <Line yAxisId="n" type="monotone" dataKey="backlogWeeks" stroke={COLORS.amber} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Panel>
            <Panel title="Gross margin and EBITDA margin trend">
              <div className="h-56">
                <ResponsiveContainer>
                  <BarChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="m" tickFormatter={(v) => `M${v}`} interval={5} />
                    <YAxis tickFormatter={(v) => `${v}%`} width={40} />
                    <Tooltip formatter={(v: number, n: string) => [`${v}%`, n === 'grossMarginPct' ? 'Gross margin' : 'EBITDA margin']} labelFormatter={(l) => `Month ${l}`} />
                    <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} formatter={(v) => (v === 'grossMarginPct' ? 'Gross margin %' : 'EBITDA margin %')} />
                    <ReferenceLine y={0} stroke={COLORS.slateDim} />
                    <Bar dataKey="grossMarginPct" fill={COLORS.cyanDim} isAnimationActive={false} />
                    <Bar dataKey="ebitdaPct" fill={COLORS.amber} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          <Panel title="Annual rollups" className="mb-4">
            <Table minWidth={720}>
              <thead>
                <tr>
                  <th>Line</th>
                  {outputs.annual.map((a) => (
                    <th key={a.year} className="text-right">
                      Year {a.year}
                    </th>
                  ))}
                  <th className="text-right">36 months</th>
                </tr>
              </thead>
              <tbody>
                {OFFERING_KEYS.map((k) => (
                  <tr key={k}>
                    <td className="pl-4 text-slate">{OFFERING_LABELS[k]}</td>
                    {outputs.annual.map((a) => (
                      <td key={a.year} className="text-right">
                        {money(a.grossRevenue[k])}
                      </td>
                    ))}
                    <td className="text-right">{money(outputs.annual.reduce((t, a) => t + a.grossRevenue[k], 0))}</td>
                  </tr>
                ))}
                {(
                  [
                    ['Gross revenue', (a) => a.grossRevenueTotal, true],
                    ['Falcon Flex program margin', (a) => -a.flexProgramMargin, false],
                    ['Net revenue', (a) => a.netRevenue, true],
                    ['Direct cost', (a) => -a.directCost, false],
                    ['Gross margin', (a) => a.grossMargin, true],
                    ['Sales/SE overhead + travel', (a) => -(a.salesOverhead + a.travel), false],
                    ['Contribution margin', (a) => a.contributionMargin, true],
                    ['Fixed opex', (a) => -a.fixedOpex, false],
                    ['EBITDA', (a) => a.ebitda, true],
                    ['Net cash', (a) => a.netCash, false],
                    ['Revenue left on the table', (a) => a.revenueLeftOnTable, false],
                  ] as Array<[string, (a: (typeof outputs.annual)[number]) => number, boolean]>
                ).map(([label, pick, strong]) => (
                  <tr key={label} className={strong ? 'text-paper' : 'text-slate'}>
                    <td className={strong ? 'font-semibold' : 'pl-4'}>{label}</td>
                    {outputs.annual.map((a) => (
                      <td key={a.year} className={`text-right ${pick(a) < 0 ? 'text-red' : ''}`}>
                        {money(pick(a))}
                      </td>
                    ))}
                    <td className="text-right">{money(outputs.annual.reduce((t, a) => t + pick(a), 0))}</td>
                  </tr>
                ))}
                <tr className="text-slate">
                  <td className="pl-4">Gross margin % · EBITDA %</td>
                  {outputs.annual.map((a) => (
                    <td key={a.year} className="text-right">
                      {pct(a.grossMarginPct, 1)} · {pct(a.ebitdaPct, 1)}
                    </td>
                  ))}
                  <td className="text-right">—</td>
                </tr>
                <tr className="text-slate">
                  <td className="pl-4">Ending advisors · avg utilization · assessments accepted / declined</td>
                  {outputs.annual.map((a) => (
                    <td key={a.year} className="text-right">
                      {a.endingAdvisors} · {pct(a.averageUtilization, 0)} · {num(a.assessmentsAccepted, 1)} / {num(a.assessmentsLost, 1)}
                    </td>
                  ))}
                  <td className="text-right">{num(s.totalAssessmentsLost, 1)} declined</td>
                </tr>
              </tbody>
            </Table>
          </Panel>

          <Panel
            title="36-month P&L and cash flow"
            right={
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowMonthly((v) => !v)} className="font-mono text-2xs uppercase tracking-[0.14em] px-2 py-1 border border-line2 text-slate hover:text-cyan hover:border-cyan">
                  {showMonthly ? 'Collapse' : 'Expand'}
                </button>
                <button type="button" onClick={download} className="font-mono text-2xs uppercase tracking-[0.14em] px-2 py-1 border border-cyan/60 text-cyan hover:bg-cyan/10">
                  Download CSV
                </button>
              </div>
            }
          >
            <p className="text-2xs font-mono text-slate-dim mb-2">Some viewer sandboxes block downloads; the full table is rendered here in any case. Negative values are costs.</p>
            {showMonthly && (
              <Table minWidth={2400}>
                <thead>
                  <tr>
                    <th className="sticky left-0 bg-panel2 z-10">Line</th>
                    {outputs.months.map((r) => (
                      <th key={r.month} className="text-right">
                        M{r.month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PNL_LINES.map((l) => (
                    <tr key={l.label} className={l.strong ? 'text-paper' : 'text-slate'}>
                      <td className={`sticky left-0 bg-panel z-10 whitespace-nowrap ${l.strong ? 'font-semibold' : ''} ${l.indent ? 'pl-4' : ''}`}>{l.label}</td>
                      {outputs.months.map((r) => {
                        const v = l.pick(r);
                        return (
                          <td key={r.month} className={`text-right whitespace-nowrap ${v < 0 && (l.kind ?? 'money') === 'money' ? 'text-red' : ''}`}>
                            {fmtCell(v, l.kind)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Panel>

          <div className="grid md:grid-cols-2 gap-3 mt-4">
            <Panel title="Unit economics per offering">
              <Table minWidth={620}>
                <thead>
                  <tr>
                    <th>Offering</th>
                    <th className="text-right">Revenue</th>
                    <th className="text-right">Hours</th>
                    <th className="text-right">Cost</th>
                    <th className="text-right">GM</th>
                    <th className="text-right">GM %</th>
                    <th className="text-right">GM / adv-hr</th>
                  </tr>
                </thead>
                <tbody>
                  {outputs.unitEconomics.map((u) => (
                    <tr key={u.key}>
                      <td className="whitespace-nowrap">
                        {OFFERING_SHORT[u.key]} <span className="text-slate-dim">{u.revenueBasis === 'per month' ? '/mo' : ''}</span>
                      </td>
                      <td className="text-right">{money(u.revenue)}</td>
                      <td className="text-right">{num(u.deliveryHours, 0)}</td>
                      <td className="text-right">{money(u.deliveryCost)}</td>
                      <td className="text-right text-cyan">{money(u.grossMargin)}</td>
                      <td className="text-right">{pct(u.grossMarginPct, 1)}</td>
                      <td className="text-right">{money(u.marginPerAdvisorHour)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p className="font-mono text-2xs text-slate-dim mt-2">
                Cost per billable advisor-hour {money(s.costPerBillableHour)} = principal loaded cost / (billable hours × steady-state utilization).
                <ABadge inputs={['assessmentHours', 'sprintHours', 'fcAddonDeliveryCostPct']} />
              </p>
            </Panel>
            <Panel title="Customer lifetime value and capacity economics">
              <div className="grid grid-cols-2 gap-2">
                <KPI label="CLV, 36 months, gross" value={money(s.clv36Gross, { compact: true })} sub="assessment-originated account" assumption={['flexProgramMarginPct']} />
                <KPI label="CLV, net of Flex margin" value={money(s.clv36Net, { compact: true })} sub={`${pct(inputs.flexShare, 0)} Flex share`} assumption={['flexShare', 'flexProgramMarginPct']} />
                <KPI label="Capacity-bound months" value={`${s.capacityBoundMonths} / 36`} sub={`${num(s.totalAssessmentsLost, 1)} assessments declined`} tone="caution" assumption={['maxBacklogWeeks', 'benchMaxHoursPerMonth']} />
                <KPI label="Revenue left on the table" value={money(s.totalRevenueLeftOnTable, { compact: true })} sub={`+ ${money(s.backlogValueMonth36, { compact: true })} backlog at M36`} tone="caution" assumption={['maxBacklogWeeks']} />
              </div>
              <p className="text-xs text-slate mt-3 leading-5">
                Revenue left on the table values each declined assessment at the expected 36-month lifetime value of an assessment-originated account (assessment, attached sprint,
                retainer with renewals, board readouts). It is a measure of unmet demand under the input assumptions, not booked revenue.
              </p>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}
