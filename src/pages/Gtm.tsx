import { useModel } from '../lib/model-store';
import { money, monthName, num, pct } from '../lib/format';
import { ABadge, PageHeader, Panel, SectionLabel, Table, Tag } from '../components/ui';
import { ENROLLMENT_STEPS, PIPELINE_90, ROADMAP } from '../data/content';

export default function Gtm() {
  const { outputs, inputs } = useModel();
  const s = outputs.summary;
  const m = outputs.months;
  const quarterMarker = (a: number, b: number) => {
    const rows = m.slice(a - 1, b);
    const rev = rows.reduce((t, r) => t + r.grossRevenueTotal, 0);
    const end = rows[rows.length - 1];
    const hires = rows.filter((r) => r.hireArrival > 0).map((r) => r.month);
    const decisions = rows.filter((r) => r.hireDecision).map((r) => r.month);
    const be = s.cashBreakEvenMonth && s.cashBreakEvenMonth >= a && s.cashBreakEvenMonth <= b;
    const peak = s.peakFundingMonth >= a && s.peakFundingMonth <= b;
    return { rev, end, hires, decisions, be, peak };
  };

  return (
    <div>
      <PageHeader
        eyebrow="Go-to-market and roadmap · co-sell mechanics, Flex packaging, enrollment gate, 90-day plan"
        title="How the practice reaches market"
        lede={`Sales cycle ${inputs.salesCycleDays} days from first meeting to signature; net ${inputs.paymentTermsDays} payment terms. Model month 1 is ${monthName(1)}. Model markers on the roadmap recompute with the inputs.`}
      />

      <div className="grid md:grid-cols-3 gap-2 mb-6">
        <Panel title="CrowdStrike co-sell mechanics">
          <ol className="list-decimal pl-4 text-xs leading-5 text-slate-bright space-y-1">
            <li>Optiv catalogue loaded into Falcon IQ so agent recommendations name Optiv offerings inside the customer dashboard.</li>
            <li>Joint account planning with CrowdStrike regional alliance and account teams on a 40-account installed-base list.</li>
            <li>The co-branded dashboard is the shared artifact both field teams review with the customer.</li>
            <li>Partner incentives for attached services are held at zero in the model until CrowdStrike publishes them.</li>
          </ol>
        </Panel>
        <Panel title="Falcon Flex packaging">
          <p className="text-xs leading-5 text-slate-bright">
            Every offering is a Flex-consumable SKU where the customer's Flex agreement covers partner services, consistent with Flex for Services (24 March 2026), which lists
            readiness assessments and AI advisory and names systems integrators as participants. The model assumes {pct(inputs.flexShare, 0)} of deals transact through Flex with a{' '}
            {pct(inputs.flexProgramMarginPct, 0)} program margin retained by CrowdStrike.
            <ABadge inputs={['flexShare', 'flexProgramMarginPct']} />
          </p>
        </Panel>
        <Panel title="Alliance MDF and launch marketing">
          <p className="text-xs leading-5 text-slate-bright">
            Marketing and MDF {money(inputs.marketingYear1)} in Year 1, {money(inputs.marketingYear2)} in Year 2, {money(inputs.marketingYear3)} in Year 3: launch brief and one-pagers,
            joint webinar with the CrowdStrike alliance team, two executive roundtables, a Fal.Con 2027 case study, and a quarterly board-readiness briefing series aligned to insurer
            renewal calendars.
          </p>
        </Panel>
      </div>

      <SectionLabel>QuiltWorks enrollment gate · Optiv is not a named partner today</SectionLabel>
      <Panel className="mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <Tag tone="amber">Gating milestone, not an assumption</Tag>
          <Tag>Fallback: deliver on Falcon IQ outputs via Elite status</Tag>
          <Tag>Only the Upside scenario assumes inclusion</Tag>
        </div>
        <Table minWidth={800}>
          <thead>
            <tr>
              <th>Step</th>
              <th>Owner</th>
              <th>Date</th>
              <th>Exit criterion</th>
            </tr>
          </thead>
          <tbody>
            {ENROLLMENT_STEPS.map((e) => (
              <tr key={e.date + e.owner}>
                <td className="font-body text-xs text-slate-bright">{e.step}</td>
                <td className="whitespace-nowrap">{e.owner}</td>
                <td className="whitespace-nowrap text-cyan">{e.date}</td>
                <td className="font-body text-xs text-slate-bright">{e.exit}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="text-xs text-slate mt-3 leading-5 max-w-3xl">
          Fallback: Optiv's advisors operate Falcon IQ in customer tenants where Optiv already holds administrative access as the Falcon Complete or platform operator, consume the
          same attack narratives, priorities, and roadmaps, and deliver through Optiv's own reporting rather than the coalition's co-branded dashboard. The economics in the model do
          not depend on coalition listing.
        </p>
      </Panel>

      <SectionLabel>12-quarter roadmap · model markers recompute with inputs</SectionLabel>
      <div className="relative mb-6">
        <div className="absolute left-0 right-0 top-[18px] h-px bg-line2 hidden xl:block" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
          {ROADMAP.map((q, i) => {
            const mk = quarterMarker(q.months[0], q.months[1]);
            return (
              <div key={q.quarter} className="panel p-3 relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2.5 h-2.5 border ${mk.be ? 'bg-cyan border-cyan' : mk.peak ? 'bg-amber border-amber' : mk.hires.length ? 'bg-paper border-paper' : 'bg-ink border-slate-dim'}`} />
                  <span className="font-head text-lg uppercase tracking-wide text-paper leading-none">{q.quarter}</span>
                  <span className="label mb-0">Q{i + 1} · M{q.months[0]}–{q.months[1]}</span>
                </div>
                <ul className="list-[square] pl-3 text-2xs leading-4 text-slate-bright space-y-0.5 mb-2">
                  {q.milestones.map((ms) => (
                    <li key={ms}>{ms}</li>
                  ))}
                </ul>
                <div className="border-t border-line pt-1.5 font-mono text-2xs text-slate space-y-0.5">
                  <div>
                    Rev <span className="text-paper">{money(mk.rev, { compact: true })}</span> · adv <span className="text-paper">{mk.end.advisors}</span> · util{' '}
                    <span className="text-paper">{pct(mk.end.utilization, 0)}</span>
                  </div>
                  <div>
                    Cum cash <span className={mk.end.cumulativeCash < 0 ? 'text-red' : 'text-cyan'}>{money(mk.end.cumulativeCash, { compact: true })}</span> · FC{' '}
                    <span className="text-paper">{num(mk.end.fcCustomers, 0)}</span> · backlog <span className="text-paper">{num(mk.end.backlogWeeks, 0)} wks</span>
                  </div>
                  {mk.decisions.length > 0 && <div className="text-amber">Hire decision M{mk.decisions.join(', M')}</div>}
                  {mk.hires.length > 0 && <div className="text-paper">Advisor arrives M{mk.hires.join(', M')}</div>}
                  {mk.peak && <div className="text-amber">Peak funding M{s.peakFundingMonth}</div>}
                  {mk.be && <div className="text-cyan">Cash break-even M{s.cashBreakEvenMonth}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SectionLabel>90-day pipeline plan · September to December 2026</SectionLabel>
      <Panel className="mb-6">
        <Table minWidth={860}>
          <thead>
            <tr>
              <th>Week</th>
              <th>Activity</th>
              <th>Owner</th>
              <th>Output</th>
            </tr>
          </thead>
          <tbody>
            {PIPELINE_90.map((p) => (
              <tr key={p.week + p.activity}>
                <td className="whitespace-nowrap text-cyan">{p.week}</td>
                <td className="font-body text-xs text-slate-bright">{p.activity}</td>
                <td className="whitespace-nowrap">{p.owner}</td>
                <td className="font-body text-xs text-slate-bright">{p.output}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <p className="text-xs text-slate mt-3 leading-5 max-w-3xl">
          The model's month 1 to 3 intake is {num(inputs.assessmentsMonths1to3, 1)} assessment per month, rising to {num(inputs.assessmentsMonths4to6, 1)} in months 4 to 6 and{' '}
          {num(inputs.assessmentsMonths7to12, 1)} in months 7 to 12; with a {inputs.salesCycleDays}-day cycle the first signature must come from an account already in conversation at
          launch. Month 6 target: {inputs.fcAddonByMonth6} Falcon Complete add-on customers.
        </p>
      </Panel>

      <SectionLabel>Hiring trigger and delivery model</SectionLabel>
      <div className="grid md:grid-cols-2 gap-3">
        <Panel title="Hiring rule">
          <p className="text-xs leading-5 text-slate-bright">
            Add one Senior Advisor ({money(inputs.seniorLoadedCost)} loaded) whenever trailing three-month utilization is at or above {pct(inputs.hireUtilThreshold, 0)} and backlog exceeds{' '}
            {inputs.hireBacklogWeeks} weeks, to a cap of {inputs.maxAdvisors}, with a {inputs.hireLagMonths}-month recruiting lag and a {inputs.hireCooldownMonths}-month cooldown.
            <ABadge inputs={['hireLagMonths', 'hireCooldownMonths', 'newHireRampMonths', 'newHireRampUtil']} />
            {' '}In the current inputs the rule fires in {m.filter((r) => r.hireDecision).length ? `month${m.filter((r) => r.hireDecision).length > 1 ? 's' : ''} ${m.filter((r) => r.hireDecision).map((r) => r.month).join(', ')}` : 'no month'}
            {s.hireMonths.length ? `, and advisors arrive in month${s.hireMonths.length > 1 ? 's' : ''} ${s.hireMonths.join(', ')}` : ''}, ending at {s.endingAdvisors}.
          </p>
        </Panel>
        <Panel title="Bench and surge">
          <p className="text-xs leading-5 text-slate-bright">
            An internal bench from Optiv's Application Security and Cyber Strategy practices provides up to {inputs.benchMaxHoursPerMonth} hours per month from month{' '}
            {inputs.benchStartMonth} at {money(inputs.benchCostPerHour)} per hour whenever backlog exceeds {inputs.benchTriggerBacklogWeeks} weeks.
            <ABadge inputs={['benchMaxHoursPerMonth', 'benchCostPerHour', 'benchStartMonth', 'benchTriggerBacklogWeeks']} />
            {' '}Backlog in the current inputs peaks at {num(Math.max(...m.map((r) => r.backlogWeeks)), 1)} weeks, and the practice declines {num(s.totalAssessmentsLost, 1)} assessments over 36 months.
          </p>
        </Panel>
      </div>
    </div>
  );
}
