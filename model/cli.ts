/**
 * CLI: npm run model
 * Runs the base case, prints headline results and validation checks, and writes
 * model/fairr-model.csv (36-month base-case snapshot) plus model/scenarios.json.
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BASE_INPUTS,
  OFFERING_KEYS,
  OFFERING_LABELS,
  computeModel,
  computeScenarios,
  computeTornado,
  runChecks,
} from './fairr-model.ts';
import { assumptionsMarkdown } from './write-assumptions.ts';

const here = dirname(fileURLToPath(import.meta.url));
const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

const out = computeModel(BASE_INPUTS);
const s = out.summary;

console.log('FAIRR practice model: base case');
console.log(`Year 1 revenue      ${money(s.revenueYear1)}   (net ${money(s.netRevenueYear1)})`);
console.log(`Year 2 revenue      ${money(s.revenueYear2)}   (net ${money(s.netRevenueYear2)})`);
console.log(`Year 3 revenue      ${money(s.revenueYear3)}   (net ${money(s.netRevenueYear3)})`);
console.log(`EBITDA Y1/Y2/Y3     ${money(s.ebitdaYear1)} / ${money(s.ebitdaYear2)} / ${money(s.ebitdaYear3)}`);
console.log(`Cash break-even     month ${s.cashBreakEvenMonth ?? 'n/a'}   (EBITDA positive from month ${s.ebitdaPositiveMonth ?? 'n/a'})`);
console.log(`Peak funding        ${money(s.peakFundingRequirement)} in month ${s.peakFundingMonth}`);
console.log(`Investment ask      ${money(s.investmentAsk)}`);
console.log(`Ending headcount    ${s.endingAdvisors} advisors; hires arrive in months ${s.hireMonths.join(', ') || 'none'}`);
console.log(`Capacity-bound      ${s.capacityBoundMonths} of 36 months; ${s.totalAssessmentsLost.toFixed(1)} assessments declined; ${money(s.totalRevenueLeftOnTable)} left on the table`);
console.log(`CLV (36 mo)         ${money(s.clv36Gross)} gross / ${money(s.clv36Net)} net`);
console.log('');
console.log('Validation checks');
const checks = runChecks(out);
for (const c of checks) console.log(`  [${c.passed ? 'PASS' : 'FAIL'}] ${c.name}: ${c.detail}`);

// CSV snapshot
const headers = [
  'Month', 'Year', 'Advisors', 'Hire decision', 'Hire arrival', 'Assessments demand', 'Assessments accepted', 'Assessments lost',
  'Sprint starts', 'Retainer starts', 'Renewal starts', 'Retainers active', 'Board readouts', 'FC add-on customers',
  'Advisor capacity hrs', 'Bench hrs', 'Project pool hrs', 'Project delivered hrs', 'Backlog hrs', 'Backlog weeks', 'Utilization',
  ...OFFERING_KEYS.map((k) => `Revenue: ${OFFERING_LABELS[k]}`),
  'Gross revenue', 'Flex program margin', 'Net revenue', 'Advisor labor', 'Bench cost', 'Add-on delivery cost', 'Direct cost',
  'Gross margin', 'Gross margin %', 'Sales/SE overhead', 'Travel', 'Contribution margin', 'Practice lead', 'Marketing', 'Training',
  'Tooling', 'Insurance/legal', 'Fixed opex', 'EBITDA', 'Collections', 'Cash out', 'Net cash', 'Cumulative cash', 'Revenue left on table',
];
const rows = out.months.map((r) => [
  r.month, r.year, r.advisors, r.hireDecision ? 1 : 0, r.hireArrival, r.assessmentsDemand, r.assessmentsAccepted, r.assessmentsLost,
  r.sprintStarts, r.retainerStarts, r.renewalStarts, r.retainersActive, r.boardReadouts, r.fcCustomers,
  r.advisorCapacityHours, r.benchHours, r.projectPoolHours, r.projectDeliveredHours, r.totalBacklogHours, r.backlogWeeks, r.utilization,
  ...OFFERING_KEYS.map((k) => r.grossRevenue[k]),
  r.grossRevenueTotal, r.flexProgramMargin, r.netRevenue, r.advisorLabor, r.benchCost, r.fcDeliveryCost, r.directCost,
  r.grossMargin, r.grossMarginPct, r.salesOverhead, r.travel, r.contributionMargin, r.practiceLead, r.marketing, r.training,
  r.tooling, r.insuranceLegal, r.fixedOpex, r.ebitda, r.collections, r.cashOut, r.netCash, r.cumulativeCash, r.revenueLeftOnTable,
]);
const csv = [headers.join(','), ...rows.map((r) => r.map((v) => (typeof v === 'number' ? (Number.isInteger(v) ? String(v) : v.toFixed(4)) : String(v))).join(','))].join('\n');
writeFileSync(resolve(here, 'fairr-model.csv'), csv + '\n');

// Scenario and tornado snapshot for the plan and README
const scenarios = computeScenarios(BASE_INPUTS);
const tornado = computeTornado(BASE_INPUTS);
writeFileSync(
  resolve(here, 'scenarios.json'),
  JSON.stringify(
    {
      generated: new Date().toISOString().slice(0, 10),
      scenarios: Object.fromEntries(Object.entries(scenarios).map(([k, v]) => [k, v.summary])),
      annual: Object.fromEntries(Object.entries(scenarios).map(([k, v]) => [k, v.annual])),
      unitEconomics: out.unitEconomics,
      tornado,
    },
    null,
    2,
  ),
);
console.log('');
console.log('Scenarios (gross revenue Y1 / Y2 / Y3, EBITDA Y2, cash break-even, peak funding)');
for (const [k, v] of Object.entries(scenarios)) {
  const ss = v.summary;
  console.log(`  ${k.padEnd(9)} ${money(ss.revenueYear1)} / ${money(ss.revenueYear2)} / ${money(ss.revenueYear3)}   EBITDA Y2 ${money(ss.ebitdaYear2)}   BE m${ss.cashBreakEvenMonth ?? '-'}   peak ${money(ss.peakFundingRequirement)}`);
}
console.log('');
console.log('Tornado (EBITDA Year 2)');
for (const b of tornado.bars) console.log(`  ${b.label.padEnd(48)} ${money(b.ebitdaLow)} .. ${money(b.ebitdaHigh)}  swing ${money(b.swing)}`);
console.log('');
writeFileSync(resolve(here, 'ASSUMPTIONS.md'), assumptionsMarkdown(BASE_INPUTS));
console.log('Wrote model/fairr-model.csv, model/scenarios.json, and model/ASSUMPTIONS.md');
if (checks.some((c) => !c.passed)) process.exit(1);
