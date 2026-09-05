import { Link } from 'react-router-dom';
import { useModel } from '../lib/model-store';
import { money, pct } from '../lib/format';
import { KPI, PageHeader, Panel, SectionLabel, Tag } from '../components/ui';
import { MARKET_FACTS, SOURCES } from '../data/sources';

function ValueFlowDiagram() {
  // Inline SVG: Falcon IQ outputs on the left, Optiv offerings in the middle, customer outcomes on the right.
  const left = ['Attack narratives', 'Investment priorities', 'Remediation roadmaps', 'Co-branded dashboard'];
  const mid = ['Readiness Assessment', 'Prioritization Sprint', 'Remediation Program', 'Board Readout & Attestation', 'Falcon Complete add-on'];
  const right = ['Board answer: exposed? protected?', 'Validated, fixed findings', 'Insurer-ready attestation', 'Continuous resilience'];
  const W = 960;
  const H = 300;
  const colX = [20, 370, 720];
  const boxW = 220;
  const boxH = 30;
  const ys = (n: number, i: number) => 30 + i * ((H - 60) / Math.max(1, n - 1));
  const links: Array<[number, number]> = [
    [0, 1], [0, 3], [1, 0], [1, 2], [2, 2], [2, 4], [3, 2], [3, 3],
  ];
  const outLinks: Array<[number, number]> = [
    [0, 0], [1, 0], [1, 1], [2, 1], [3, 2], [4, 3], [2, 3],
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Value flow from Falcon IQ outputs through Optiv offerings to customer outcomes">
      <defs>
        <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L8 4L0 8z" fill="#64748B" />
        </marker>
      </defs>
      {[['CrowdStrike ships', 0], ['Optiv sells', 1], ['Customer gets', 2]].map(([t, i]) => (
        <text key={String(t)} x={colX[Number(i)]} y={16} fill="#64748B" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="2">
          {String(t).toUpperCase()}
        </text>
      ))}
      {links.map(([a, b], i) => {
        const x1 = colX[0] + boxW;
        const y1 = ys(left.length, a) + boxH / 2;
        const x2 = colX[1];
        const y2 = ys(mid.length, b) + boxH / 2;
        return <path key={`l${i}`} d={`M${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`} fill="none" stroke="#2A3644" strokeWidth="1.2" markerEnd="url(#arrow)" />;
      })}
      {outLinks.map(([a, b], i) => {
        const x1 = colX[1] + boxW;
        const y1 = ys(mid.length, a) + boxH / 2;
        const x2 = colX[2];
        const y2 = ys(right.length, b) + boxH / 2;
        return <path key={`o${i}`} d={`M${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`} fill="none" stroke="#2A3644" strokeWidth="1.2" markerEnd="url(#arrow)" />;
      })}
      {left.map((t, i) => (
        <g key={t}>
          <rect x={colX[0]} y={ys(left.length, i)} width={boxW} height={boxH} fill="#121821" stroke="#94A3B8" />
          <text x={colX[0] + 10} y={ys(left.length, i) + 19} fill="#CBD5E1" fontFamily="JetBrains Mono, monospace" fontSize="11">{t}</text>
        </g>
      ))}
      {mid.map((t, i) => (
        <g key={t}>
          <rect x={colX[1]} y={ys(mid.length, i)} width={boxW} height={boxH} fill="#0B0F14" stroke="#22D3EE" />
          <text x={colX[1] + 10} y={ys(mid.length, i) + 19} fill="#22D3EE" fontFamily="JetBrains Mono, monospace" fontSize="11">{t}</text>
        </g>
      ))}
      {right.map((t, i) => (
        <g key={t}>
          <rect x={colX[2]} y={ys(right.length, i)} width={boxW} height={boxH} fill="#121821" stroke="#F59E0B" />
          <text x={colX[2] + 10} y={ys(right.length, i) + 19} fill="#E6EDF3" fontFamily="JetBrains Mono, monospace" fontSize="11">{t}</text>
        </g>
      ))}
    </svg>
  );
}

export default function Executive() {
  const { outputs, inputs } = useModel();
  const s = outputs.summary;
  const a = outputs.annual;
  const fcShareY3 = a[2].grossRevenueTotal > 0 ? a[2].grossRevenue.fcAddon / a[2].grossRevenueTotal : 0;
  return (
    <div>
      <PageHeader
        eyebrow="Executive summary · Optiv Frontier AI Readiness & Resilience practice"
        title="Sell the remediation Falcon IQ hands to partners"
        lede={
          <>
            CrowdStrike's Falcon IQ automates assessment and prioritization for Project QuiltWorks and maps every finding to a partner's service catalogue.
            The FAIRR practice is Optiv's catalogue: two Principal Advisors on month 1, five offerings that consume Falcon IQ outputs, headcount that scales
            only on demonstrated backlog, and a Falcon Complete bundle no global integrator can offer.
          </>
        }
      />

      <SectionLabel>The ask</SectionLabel>
      <Panel className="mb-6">
        <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
          <div className="text-[15px] leading-6 text-slate-bright">
            Approve a two-advisor launch on 1 October 2026 with a <span className="kpi text-cyan text-2xl align-baseline">{money(s.investmentAsk)}</span> working-capital
            allocation (peak cumulative burn of {money(s.peakFundingRequirement)} in month {s.peakFundingMonth}, plus 20% contingency, rounded up to $25,000), and
            authorize the Partner Architect to pursue formal Project QuiltWorks enrollment in parallel with launch. The practice is EBITDA-positive from month{' '}
            {s.ebitdaPositiveMonth ?? '—'} and returns to cumulative cash break-even in month {s.cashBreakEvenMonth ?? '—'}.
          </div>
          <div className="flex flex-col gap-1 items-start md:items-end">
            <Tag tone="cyan">Decision requested</Tag>
            <Link to="/plan#12-decision-requested-and-investment-ask" className="font-mono text-2xs uppercase tracking-[0.14em] text-slate hover:text-cyan underline underline-offset-2">
              Full ask in the plan
            </Link>
          </div>
        </div>
      </Panel>

      <SectionLabel>Headline KPIs · base case unless inputs are modified</SectionLabel>
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2 mb-6">
        <KPI label="Year 1 revenue" value={money(s.revenueYear1, { compact: true })} sub={`net ${money(s.netRevenueYear1, { compact: true })}`} assumption={['assessmentHours', 'benchMaxHoursPerMonth']} />
        <KPI label="Year 2 revenue" value={money(s.revenueYear2, { compact: true })} sub={`net ${money(s.netRevenueYear2, { compact: true })}`} assumption={['assessmentHours', 'benchMaxHoursPerMonth']} />
        <KPI label="Year 3 revenue" value={money(s.revenueYear3, { compact: true })} sub={`FC add-on ${pct(fcShareY3, 0)} of Y3`} assumption={['fcAddonAdvisorHours', 'benchMaxHoursPerMonth']} />
        <KPI label="EBITDA Y1 / Y2 / Y3" value={money(s.ebitdaYear3, { compact: true })} sub={`${money(s.ebitdaYear1, { compact: true })} / ${money(s.ebitdaYear2, { compact: true })} / Y3`} tone={s.ebitdaYear3 >= 0 ? 'positive' : 'negative'} assumption={['flexProgramMarginPct', 'fcAddonDeliveryCostPct', 'benchCostPerHour']} />
        <KPI label="Cash break-even" value={s.cashBreakEvenMonth ? `M${s.cashBreakEvenMonth}` : 'n/a'} sub={`EBITDA positive from M${s.ebitdaPositiveMonth ?? '—'}`} tone="positive" assumption={['flexProgramMarginPct', 'benchMaxHoursPerMonth']} />
        <KPI label="Peak funding" value={money(s.peakFundingRequirement, { compact: true })} sub={`month ${s.peakFundingMonth}`} tone="caution" assumption={['flexProgramMarginPct', 'benchCostPerHour']} />
        <KPI label="Investment ask" value={money(s.investmentAsk, { compact: true })} sub="peak burn +20%, to $25K" tone="caution" assumption={['flexProgramMarginPct', 'benchCostPerHour']} />
        <KPI label="Headcount" value={`${inputs.startingAdvisors} → ${s.endingAdvisors}`} sub={s.hireMonths.length ? `hires arrive M${s.hireMonths.join(', M')}` : 'no hires triggered'} assumption={['hireLagMonths', 'hireCooldownMonths', 'newHireRampUtil']} />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4 mb-6">
        <Panel title="Thesis">
          <p className="text-[15px] leading-6 text-slate-bright">
            Frontier AI models are finding vulnerabilities in production code faster than enterprises can fix them, and CrowdStrike has built the coalition
            (Project QuiltWorks) and the engine (Falcon IQ, 50-plus agents) that turn that discovery into a prioritized remediation roadmap mapped to partner
            services. The scarce resource in that loop is accountable remediation capacity, not detection. Optiv already operates Falcon for its customers
            as the number-one CrowdStrike seller with more than $1 billion in joint sales, so it can start remediation programs in weeks, at a mid-enterprise
            price, with a continuous-remediation add-on for its Falcon Complete base that no coalition GSI can replicate. The plan's financial return is gated
            by delivery capacity: in the current inputs the practice declines {s.totalAssessmentsLost.toFixed(1)} assessments over 36 months worth an expected{' '}
            {money(s.totalRevenueLeftOnTable, { compact: true })} of lifetime value, which makes the headcount cap the most consequential decision after approval.
          </p>
        </Panel>
        <Panel title="Sourced market facts">
          <ul className="space-y-2">
            {MARKET_FACTS.slice(0, 6).map((f) => {
              const src = SOURCES.find((x) => x.id === f.source);
              return (
                <li key={f.value + f.source} className="flex gap-3 items-baseline">
                  <span className="kpi text-2xl text-cyan w-24 shrink-0 text-right">{f.value}</span>
                  <span className="text-xs text-slate-bright leading-5">
                    {f.text}{' '}
                    <a href={src?.url} target="_blank" rel="noreferrer" className="font-mono text-2xs text-slate-dim hover:text-cyan">
                      [{f.source}]
                    </a>
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel title="Value flow · Falcon IQ outputs to Optiv offerings to customer outcomes" className="mb-6">
        <ValueFlowDiagram />
      </Panel>

      <div className="grid md:grid-cols-3 gap-2">
        <Panel title="Two-advisor launch">
          <p className="text-xs leading-5 text-slate-bright">
            One assessment and prioritization lead, one remediation and engineering lead, each fully loaded at {money(inputs.principalLoadedCost)} per year. A Senior
            Advisor ({money(inputs.seniorLoadedCost)}) is added when trailing three-month utilization reaches {pct(inputs.hireUtilThreshold, 0)} and backlog exceeds{' '}
            {inputs.hireBacklogWeeks} weeks, to a cap of {inputs.maxAdvisors}.
          </p>
        </Panel>
        <Panel title="QuiltWorks enrollment is a gate, not an assumption">
          <p className="text-xs leading-5 text-slate-bright">
            Optiv is not a named QuiltWorks partner. The plan carries an enrollment path with owners and dates, and a fallback that delivers the identical service on
            Falcon IQ outputs through Optiv's existing Elite status. Only the Upside scenario assumes coalition inclusion.
          </p>
        </Panel>
        <Panel title="Success metrics">
          <p className="text-xs leading-5 text-slate-bright">
            Month 6: {inputs.fcAddonByMonth6} add-on customers, enrollment accepted or fallback active. Month 12: {money(s.revenueYear1, { compact: true })} revenue, positive EBITDA,
            hiring trigger armed. Month 24: {money(s.revenueYear2, { compact: true })} revenue, {inputs.fcAddonByMonth24} add-on customers, cumulative cash positive.
          </p>
        </Panel>
      </div>
    </div>
  );
}
