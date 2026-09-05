import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SCENARIOS, type ScenarioKey } from '../../model/fairr-model';
import { INPUT_META } from '../../model/input-meta';
import { useModel } from '../lib/model-store';
import { money, num, pct } from '../lib/format';
import { COLORS, SCENARIO_COLORS, compactMoney } from '../lib/charts';
import { ABadge, PageHeader, Panel, SectionLabel, Table } from '../components/ui';

const KEYS: ScenarioKey[] = ['base', 'downside', 'upside', 'priceWar'];

export default function Scenarios() {
  const { scenarios, tornado, isBaseCase } = useModel();

  const monthly = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const row: Record<string, number> = { m: i + 1 };
        for (const k of KEYS) {
          row[`rev_${k}`] = Math.round(scenarios[k].months[i].grossRevenueTotal);
          row[`cash_${k}`] = Math.round(scenarios[k].months[i].cumulativeCash);
        }
        return row;
      }),
    [scenarios],
  );

  const tornadoData = useMemo(
    () =>
      tornado.bars.map((b) => ({
        label: b.label,
        low: Math.round(Math.min(b.ebitdaLow, b.ebitdaHigh) - tornado.baseEbitdaYear2),
        high: Math.round(Math.max(b.ebitdaLow, b.ebitdaHigh) - tornado.baseEbitdaYear2),
        swing: b.swing,
        bar: b,
      })),
    [tornado],
  );

  const rows: Array<{ label: string; pick: (k: ScenarioKey) => string; assumption?: boolean }> = [
    { label: 'Year 1 gross revenue', pick: (k) => money(scenarios[k].summary.revenueYear1) },
    { label: 'Year 2 gross revenue', pick: (k) => money(scenarios[k].summary.revenueYear2) },
    { label: 'Year 3 gross revenue', pick: (k) => money(scenarios[k].summary.revenueYear3) },
    { label: 'Year 1 EBITDA', pick: (k) => money(scenarios[k].summary.ebitdaYear1) },
    { label: 'Year 2 EBITDA', pick: (k) => money(scenarios[k].summary.ebitdaYear2) },
    { label: 'Year 3 EBITDA', pick: (k) => money(scenarios[k].summary.ebitdaYear3) },
    { label: 'Year 3 gross margin', pick: (k) => pct(scenarios[k].summary.grossMarginPctYear3, 1) },
    { label: 'EBITDA positive from', pick: (k) => (scenarios[k].summary.ebitdaPositiveMonth ? `M${scenarios[k].summary.ebitdaPositiveMonth}` : 'beyond M36') },
    { label: 'Cash break-even month', pick: (k) => (scenarios[k].summary.cashBreakEvenMonth ? `M${scenarios[k].summary.cashBreakEvenMonth}` : 'beyond M36') },
    { label: 'Peak funding requirement', pick: (k) => `${money(scenarios[k].summary.peakFundingRequirement)} (M${scenarios[k].summary.peakFundingMonth})` },
    { label: 'Investment ask', pick: (k) => money(scenarios[k].summary.investmentAsk) },
    { label: 'Ending advisors · hire arrivals', pick: (k) => `${scenarios[k].summary.endingAdvisors} · ${scenarios[k].summary.hireMonths.length ? 'M' + scenarios[k].summary.hireMonths.join(', M') : 'none'}` },
    { label: 'Assessments declined (capacity)', pick: (k) => num(scenarios[k].summary.totalAssessmentsLost, 1) },
    { label: 'Revenue left on the table', pick: (k) => money(scenarios[k].summary.totalRevenueLeftOnTable, { compact: true }) },
    { label: 'Cumulative cash at M36', pick: (k) => money(scenarios[k].summary.cumulativeCashMonth36) },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={`Scenario comparison · ${isBaseCase ? 'applied to the base case' : 'applied to your modified inputs'}`}
        title="Base · Downside · Upside · GSI price war"
        lede="Each scenario transforms the current inputs and reruns the full model. The tornado flexes each candidate input plus and minus 20% (rates by 10 points) and ranks the ten largest swings in Year 2 EBITDA."
      />

      <div className="grid md:grid-cols-4 gap-2 mb-4">
        {SCENARIOS.map((sc) => (
          <Panel key={sc.key} className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-block w-2.5 h-2.5" style={{ background: SCENARIO_COLORS[sc.key] }} />
              <span className="font-head text-xl uppercase tracking-wide text-paper leading-none">{sc.label}</span>
            </div>
            <p className="text-2xs leading-4 text-slate">{sc.description}</p>
          </Panel>
        ))}
      </div>

      <Panel className="mb-4">
        <Table minWidth={760}>
          <thead>
            <tr>
              <th>Metric</th>
              {KEYS.map((k) => (
                <th key={k} className="text-right" style={{ color: SCENARIO_COLORS[k] }}>
                  {SCENARIOS.find((s) => s.key === k)?.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <td className="text-slate-bright whitespace-nowrap">{r.label}</td>
                {KEYS.map((k) => (
                  <td key={k} className="text-right whitespace-nowrap">
                    {r.pick(k)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="font-mono text-2xs text-slate-dim mt-2">
          All scenario figures depend on the assumptions register.
          <ABadge inputs={['flexProgramMarginPct', 'benchMaxHoursPerMonth', 'fcAddonDeliveryCostPct', 'maxBacklogWeeks']} />
        </p>
      </Panel>

      <div className="grid md:grid-cols-2 gap-3 mb-4">
        <Panel title="Monthly gross revenue by scenario">
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="m" tickFormatter={(v) => `M${v}`} interval={5} />
                <YAxis tickFormatter={compactMoney} width={52} />
                <Tooltip formatter={(v: number, n: string) => [money(v), SCENARIOS.find((s) => `rev_${s.key}` === n)?.label ?? n]} labelFormatter={(l) => `Month ${l}`} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} formatter={(v) => SCENARIOS.find((s) => `rev_${s.key}` === v)?.label ?? v} />
                {KEYS.map((k) => (
                  <Line key={k} type="monotone" dataKey={`rev_${k}`} stroke={SCENARIO_COLORS[k]} dot={false} strokeWidth={k === 'base' ? 2 : 1.2} isAnimationActive={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Cumulative cash by scenario">
          <div className="h-60">
            <ResponsiveContainer>
              <LineChart data={monthly} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="m" tickFormatter={(v) => `M${v}`} interval={5} />
                <YAxis tickFormatter={compactMoney} width={52} />
                <Tooltip formatter={(v: number, n: string) => [money(v), SCENARIOS.find((s) => `cash_${s.key}` === n)?.label ?? n]} labelFormatter={(l) => `Month ${l}`} />
                <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} formatter={(v) => SCENARIOS.find((s) => `cash_${s.key}` === v)?.label ?? v} />
                <ReferenceLine y={0} stroke={COLORS.slateDim} />
                {KEYS.map((k) => (
                  <Line key={k} type="monotone" dataKey={`cash_${k}`} stroke={SCENARIO_COLORS[k]} dot={false} strokeWidth={k === 'base' ? 2 : 1.2} isAnimationActive={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <SectionLabel>Tornado · Year 2 EBITDA sensitivity, base {money(tornado.baseEbitdaYear2)}</SectionLabel>
      <Panel>
        <div className="h-[380px]">
          <ResponsiveContainer>
            <BarChart data={tornadoData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }} stackOffset="sign">
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickFormatter={compactMoney} />
              <YAxis type="category" dataKey="label" width={230} tick={{ fontSize: 10, fill: '#CBD5E1' }} />
              <Tooltip
                formatter={(v: number, n: string) => [`${v >= 0 ? '+' : ''}${money(v)} vs base`, n === 'low' ? 'Downside flex' : 'Upside flex']}
                labelFormatter={(l) => String(l)}
              />
              <ReferenceLine x={0} stroke={COLORS.paper} />
              <Bar dataKey="low" stackId="t" isAnimationActive={false}>
                {tornadoData.map((d) => (
                  <Cell key={d.label} fill={COLORS.red} fillOpacity={0.85} />
                ))}
              </Bar>
              <Bar dataKey="high" stackId="t" isAnimationActive={false}>
                {tornadoData.map((d) => (
                  <Cell key={d.label} fill={COLORS.cyan} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <Table minWidth={760}>
          <thead>
            <tr>
              <th>#</th>
              <th>Input</th>
              <th className="text-right">Base</th>
              <th className="text-right">Low</th>
              <th className="text-right">High</th>
              <th className="text-right">EBITDA Y2 at low</th>
              <th className="text-right">EBITDA Y2 at high</th>
              <th className="text-right">Swing</th>
            </tr>
          </thead>
          <tbody>
            {tornado.bars.map((b, i) => {
              const meta = INPUT_META[b.key];
              const f = (v: number) => (meta.format === 'pct' ? pct(v, 0) : meta.format === 'money' ? money(v) : num(v, meta.format === 'int' ? 0 : 1));
              return (
                <tr key={b.key}>
                  <td>{i + 1}</td>
                  <td className="text-slate-bright">
                    {b.label}
                    {meta.assumption && <ABadge inputs={[b.key]} />}
                  </td>
                  <td className="text-right">{f(b.baseValue)}</td>
                  <td className="text-right">{f(b.lowValue)}</td>
                  <td className="text-right">{f(b.highValue)}</td>
                  <td className={`text-right ${b.ebitdaLow < b.ebitdaHigh ? 'text-red' : 'text-cyan'}`}>{money(b.ebitdaLow)}</td>
                  <td className={`text-right ${b.ebitdaHigh >= b.ebitdaLow ? 'text-cyan' : 'text-red'}`}>{money(b.ebitdaHigh)}</td>
                  <td className="text-right text-paper">{money(b.swing)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
