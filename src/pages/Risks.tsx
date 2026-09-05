import { useModel } from '../lib/model-store';
import { money, num, pct } from '../lib/format';
import { PageHeader, Panel, Table, Tag } from '../components/ui';
import { RISKS } from '../data/content';

const tone = (v: 'Low' | 'Medium' | 'High') => (v === 'High' ? 'red' : v === 'Medium' ? 'amber' : 'slate');

export default function Risks() {
  const { outputs, scenarios } = useModel();
  const s = outputs.summary;
  const a = outputs.annual;
  const fcShare = a[2].grossRevenueTotal > 0 ? a[2].grossRevenue.fcAddon / a[2].grossRevenueTotal : 0;
  const evidence: Record<number, string> = {
    4: `Model: EBITDA positive from M${s.ebitdaPositiveMonth ?? '—'}; Downside cash break-even M${scenarios.downside.summary.cashBreakEvenMonth ?? 'beyond 36'}.`,
    6: `Model: GSI price-war EBITDA positive from M${scenarios.priceWar.summary.ebitdaPositiveMonth ?? '—'}; Y2 EBITDA ${money(scenarios.priceWar.summary.ebitdaYear2, { compact: true })}.`,
    8: `Model: ${num(s.totalAssessmentsLost, 1)} assessments declined; ${money(s.totalRevenueLeftOnTable, { compact: true })} expected value left on the table; capacity binds in ${s.capacityBoundMonths} of 36 months.`,
    9: `Model: FC add-on is ${pct(fcShare, 0)} of Y3 revenue; add-on price and delivery-cost share rank ${outputs.unitEconomics ? '1 and 2' : ''} in the tornado.`,
    10: `Model: Flex margin reduces net revenue by ${pct(outputs.inputs.flexShare * outputs.inputs.flexProgramMarginPct, 1)} at current inputs.`,
  };
  return (
    <div>
      <PageHeader
        eyebrow="Risk register · likelihood, impact, owner, mitigation, status"
        title="What could go wrong"
        lede="Ten named risks from the plan. Where the model quantifies the exposure, the evidence line shows the current figure."
      />
      <div className="grid md:grid-cols-4 gap-2 mb-4">
        <Panel className="p-3">
          <div className="label">High impact</div>
          <div className="kpi text-3xl text-red">{RISKS.filter((r) => r.impact === 'High').length}</div>
        </Panel>
        <Panel className="p-3">
          <div className="label">High likelihood</div>
          <div className="kpi text-3xl text-amber">{RISKS.filter((r) => r.likelihood === 'High').length}</div>
        </Panel>
        <Panel className="p-3">
          <div className="label">Open</div>
          <div className="kpi text-3xl text-paper">{RISKS.filter((r) => r.status.startsWith('Open')).length}</div>
        </Panel>
        <Panel className="p-3">
          <div className="label">Mitigated by design</div>
          <div className="kpi text-3xl text-cyan">{RISKS.filter((r) => r.status.startsWith('Mitigated')).length}</div>
        </Panel>
      </div>
      <Table minWidth={1000}>
        <thead>
          <tr>
            <th>#</th>
            <th>Risk</th>
            <th>Likelihood</th>
            <th>Impact</th>
            <th>Owner</th>
            <th>Mitigation</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {RISKS.map((r) => (
            <tr key={r.id}>
              <td className="text-slate-dim">{r.id}</td>
              <td className="font-body text-xs text-slate-bright min-w-[220px]">
                {r.risk}
                {evidence[r.id] && <div className="font-mono text-2xs text-cyan mt-1">{evidence[r.id]}</div>}
              </td>
              <td>
                <Tag tone={tone(r.likelihood)}>{r.likelihood}</Tag>
              </td>
              <td>
                <Tag tone={tone(r.impact)}>{r.impact}</Tag>
              </td>
              <td className="font-body text-xs text-slate-bright whitespace-nowrap">{r.owner}</td>
              <td className="font-body text-xs text-slate-bright min-w-[260px]">{r.mitigation}</td>
              <td className="font-body text-xs text-slate whitespace-nowrap">{r.status}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
