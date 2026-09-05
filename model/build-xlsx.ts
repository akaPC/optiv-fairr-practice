/**
 * Builds model/fairr-model.xlsx with live formulas that mirror computeModel().
 *
 * Sheet layout
 * - Inputs:     every ModelInputs field (label, value, unit, source/ASSUMPTION label, key)
 * - Monthly:    one row per line item, one column per month (C..AL = months 1..36); all formulas
 * - Annual:     year rollups (formulas over Monthly)
 * - Summary:    headline KPIs (formulas)
 * - UnitEconomics, CLV: formulas from Inputs
 * - Scenarios, Tornado: value snapshots from the TypeScript model (labeled as such)
 * - Checks:     the validation checks expressed as formulas
 *
 * npm run model:xlsx
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';
import {
  BASE_INPUTS,
  HORIZON_MONTHS,
  OFFERING_LABELS,
  computeModel,
  computeScenarios,
  computeTornado,
  type ModelInputs,
} from './fairr-model.ts';
import { INPUT_META } from './input-meta.ts';
import { sensitivityRanks } from './write-assumptions.ts';

const here = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type Cell = string | number | { f: string; z?: string } | { v: number | string; z?: string };
type Grid = Cell[][];

const FIRST_MONTH_COL = 2; // zero-based index of month 1 (column C)
export const colLetter = (idx: number): string => XLSX.utils.encode_col(idx);
export const monthCol = (m: number): string => colLetter(FIRST_MONTH_COL + m - 1);

const MONEY = '"$"#,##0;[Red]-"$"#,##0';
const PCT = '0.0%';
const NUM = '#,##0.00';
const INT = '0';

// ---------------------------------------------------------------------------
// Inputs sheet
// ---------------------------------------------------------------------------

export const INPUT_KEYS = Object.keys(BASE_INPUTS) as Array<keyof ModelInputs>;
const inputRow = new Map<keyof ModelInputs, number>();

function buildInputsSheet(inputs: ModelInputs): Grid {
  const grid: Grid = [['Input', 'Value', 'Unit', 'Basis', 'Key', 'Sensitivity rank']];
  let row = 2; // 1-based Excel row of the first input
  let currentGroup = '';
  const ranks = sensitivityRanks(inputs);
  for (const key of INPUT_KEYS) {
    const meta = INPUT_META[key];
    if (meta.group !== currentGroup) {
      grid.push([meta.group.toUpperCase(), '', '', '', '', '']);
      row++;
      currentGroup = meta.group;
    }
    const v = inputs[key];
    const cell: Cell = meta.format === 'pct' ? { v, z: PCT } : meta.format === 'money' ? { v, z: MONEY } : { v, z: meta.format === 'int' ? INT : NUM };
    grid.push([meta.label, cell, meta.unit, meta.basis, key, ranks.get(key) ?? '']);
    inputRow.set(key, row);
    row++;
  }
  return grid;
}

/** Absolute reference to an input cell. */
export const I = (key: keyof ModelInputs): string => `Inputs!$B$${inputRow.get(key)}`;

// ---------------------------------------------------------------------------
// Monthly sheet
// ---------------------------------------------------------------------------

interface RowSpec {
  key: string;
  label: string;
  format: string;
  /** Formula for month m (1-based). Return a number for a literal. */
  formula: (m: number) => string | number;
}

const rowIndex = new Map<string, number>(); // key -> 1-based Excel row

/** Reference to row `key` in month `m`; literal 0 when m is outside the horizon. */
const R = (key: string, m: number): string => {
  if (m < 1 || m > HORIZON_MONTHS) return '0';
  const r = rowIndex.get(key);
  if (!r) throw new Error(`Unknown monthly row ${key}`);
  return `${monthCol(m)}$${r}`;
};

/** SUM of row `key` over months a..b, clamped to the horizon (0 when empty). */
const RSUM = (key: string, a: number, b: number): string => {
  const lo = Math.max(1, a);
  const hi = Math.min(HORIZON_MONTHS, b);
  if (hi < lo) return '0';
  const r = rowIndex.get(key)!;
  return `SUM(${monthCol(lo)}$${r}:${monthCol(hi)}$${r})`;
};

/** Past-only range of row `key` for months 1..m (used with SUMIFS/INDEX to avoid circular references). */
const RPAST = (key: string, m: number): string => {
  const r = rowIndex.get(key)!;
  return `${monthCol(1)}$${r}:${monthCol(Math.max(1, m))}$${r}`;
};

function monthlyRows(): RowSpec[] {
  const rows: RowSpec[] = [
    { key: 'month', label: 'Month', format: INT, formula: (m) => m },
    { key: 'year', label: 'Practice year', format: INT, formula: (m) => `CEILING(${R('month', m)}/12,1)` },
    { key: 'escalator', label: 'Price escalator factor', format: '0.0000', formula: (m) => `(1+${I('priceEscalator')})^(${R('year', m)}-1)` },

    // --- Headcount ---
    { key: 'arrivals', label: 'Advisor arrivals (hires starting this month)', format: INT, formula: (m) => (m >= 2 ? `SUMIF(${RPAST('month', m - 1)},${R('month', m)}-${I('hireLagMonths')},${RPAST('hireDecision', m - 1)})` : 0) },
    { key: 'cumArrivals', label: 'Cumulative hires arrived', format: INT, formula: (m) => `${R('cumArrivals', m - 1)}+${R('arrivals', m)}` },
    { key: 'advisors', label: 'Advisors on payroll', format: INT, formula: (m) => `${I('startingAdvisors')}+${R('cumArrivals', m)}` },
    { key: 'principals', label: 'Principal Advisors', format: INT, formula: (m) => `MIN(${R('advisors', m)},${I('startingAdvisors')})` },
    { key: 'seniors', label: 'Senior Advisors', format: INT, formula: (m) => `${R('advisors', m)}-${R('principals', m)}` },
    { key: 'founderUtil', label: 'Founding advisor planned utilization (practice ramp)', format: PCT, formula: (m) => `IF(${R('month', m)}<=3,${I('utilMonths1to3')},IF(${R('month', m)}<=6,${I('utilMonths4to6')},IF(${R('month', m)}<=12,${I('utilMonths7to12')},${I('utilSteadyState')})))` },
    {
      key: 'rampingHires',
      label: 'Hires still inside new-hire ramp',
      format: NUM,
      // arrivals in the last newHireRampMonths months = cumArrivals(m) - cumArrivals(m - N)
      formula: (m) => `${R('cumArrivals', m)}-IF(${R('month', m)}-${I('newHireRampMonths')}<1,0,INDEX(${RPAST('cumArrivals', m)},1,MAX(1,${R('month', m)}-${I('newHireRampMonths')})))`,
    },
    {
      key: 'hireUtilSum',
      label: 'Sum of hired advisors planned utilization',
      format: NUM,
      formula: (m) => `${R('cumArrivals', m)}*${I('utilSteadyState')}-${R('rampingHires', m)}*(${I('utilSteadyState')}-MIN(${I('newHireRampUtil')},${I('utilSteadyState')}))`,
    },
    { key: 'hoursPerMonth', label: 'Billable hours per advisor per month', format: NUM, formula: () => `${I('billableHoursPerYear')}/12` },
    { key: 'advisorCapacity', label: 'Advisor capacity hours', format: NUM, formula: (m) => `${R('hoursPerMonth', m)}*(${I('startingAdvisors')}*${R('founderUtil', m)}+${R('hireUtilSum', m)})` },

    // --- Demand funnel ---
    {
      key: 'assessmentsDemand',
      label: 'Assessments demanded',
      format: NUM,
      formula: (m) =>
        `IF(${R('month', m)}<=3,${I('assessmentsMonths1to3')},IF(${R('month', m)}<=6,${I('assessmentsMonths4to6')},IF(${R('month', m)}<=12,${I('assessmentsMonths7to12')},${I('assessmentsMonths7to12')}*(1+${I('assessmentGrowthPerYear')})^(${R('year', m)}-1))))*IF(${R('month', m)}>=${I('cosellStartMonth')},${I('cosellMultiplier')},1)`,
    },
    { key: 'prevBacklogWeeks', label: 'Backlog weeks entering the month', format: NUM, formula: (m) => R('backlogWeeks', m - 1) },
    { key: 'assessmentsAccepted', label: 'Assessments accepted', format: NUM, formula: (m) => `IF(${R('prevBacklogWeeks', m)}>${I('maxBacklogWeeks')},0,${R('assessmentsDemand', m)})` },
    { key: 'assessmentsLost', label: 'Assessments declined (capacity)', format: NUM, formula: (m) => `${R('assessmentsDemand', m)}-${R('assessmentsAccepted', m)}` },
    { key: 'sprintStarts', label: 'Sprint starts', format: NUM, formula: (m) => `${R('assessmentsAccepted', m - 1)}*${I('attachSprint')}` },
    { key: 'sprintCompletions', label: 'Sprint completions', format: NUM, formula: (m) => R('sprintStarts', m - 1) },
    { key: 'retainerStarts', label: 'Retainer starts (new)', format: NUM, formula: (m) => `${R('sprintStarts', m - 2)}*${I('attachRetainer')}` },
    { key: 'renewalStarts', label: 'Retainer renewals', format: NUM, formula: (m) => `(${R('retainerStarts', m - 12)}+${R('renewalStarts', m - 12)})*${I('renewalRate')}` },
    { key: 'retainersActive', label: 'Retainers active', format: NUM, formula: (m) => `${RSUM('retainerStarts', m - 11, m)}+${RSUM('renewalStarts', m - 11, m)}` },
    { key: 'boardReadouts', label: 'Board readouts delivered', format: NUM, formula: (m) => `${R('sprintStarts', m - 2)}*${I('boardAttach')}+${R('renewalStarts', m)}*${I('boardAttach')}` },
    {
      key: 'fcCustomers',
      label: 'Falcon Complete add-on customers',
      format: NUM,
      formula: (m) =>
        `IF(${R('month', m)}<=6,${I('fcAddonByMonth6')}*${R('month', m)}/6,IF(${R('month', m)}<=12,${I('fcAddonByMonth6')}+(${I('fcAddonByMonth12')}-${I('fcAddonByMonth6')})*(${R('month', m)}-6)/6,IF(${R('month', m)}<=24,${I('fcAddonByMonth12')}+(${I('fcAddonByMonth24')}-${I('fcAddonByMonth12')})*(${R('month', m)}-12)/12,${I('fcAddonByMonth24')}+(${I('fcAddonByMonth36')}-${I('fcAddonByMonth24')})*(${R('month', m)}-24)/12)))`,
    },

    // --- Hours ---
    { key: 'retainerBlendedHours', label: 'Retainer blended hours per month', format: NUM, formula: () => `${I('tierMix1')}*${I('retainerTier1Hours')}+${I('tierMix2')}*${I('retainerTier2Hours')}+${I('tierMix3')}*${I('retainerTier3Hours')}` },
    { key: 'retainerBlendedFee', label: 'Retainer blended fee per month', format: MONEY, formula: () => `${I('tierMix1')}*${I('retainerTier1Monthly')}+${I('tierMix2')}*${I('retainerTier2Monthly')}+${I('tierMix3')}*${I('retainerTier3Monthly')}` },
    { key: 'dh_assessment', label: 'Demand hours: Assessment', format: NUM, formula: (m) => `${R('assessmentsAccepted', m)}*${I('assessmentHours')}` },
    { key: 'dh_sprint', label: 'Demand hours: Sprint', format: NUM, formula: (m) => `${R('sprintStarts', m)}*${I('sprintHours')}*4/6+${R('sprintStarts', m - 1)}*${I('sprintHours')}*2/6` },
    { key: 'dh_retainer', label: 'Demand hours: Retainer', format: NUM, formula: (m) => `${R('retainersActive', m)}*${R('retainerBlendedHours', m)}` },
    { key: 'dh_board', label: 'Demand hours: Board readout', format: NUM, formula: (m) => `${R('boardReadouts', m)}*${I('boardReadoutHours')}` },
    { key: 'dh_fcAddon', label: 'Demand hours: FC add-on oversight', format: NUM, formula: (m) => `${R('fcCustomers', m)}*${I('fcAddonAdvisorHours')}` },
    { key: 'fcDelivered', label: 'FC add-on hours delivered', format: NUM, formula: (m) => `MIN(${R('dh_fcAddon', m)},${R('advisorCapacity', m)})` },
    { key: 'capacityForProjects', label: 'Advisor capacity for project work', format: NUM, formula: (m) => `MAX(0,${R('advisorCapacity', m)}-${R('dh_fcAddon', m)})` },
    { key: 'pool_assessment', label: 'Work pool: Assessment', format: NUM, formula: (m) => `${R('bl_assessment', m - 1)}+${R('dh_assessment', m)}` },
    { key: 'pool_sprint', label: 'Work pool: Sprint', format: NUM, formula: (m) => `${R('bl_sprint', m - 1)}+${R('dh_sprint', m)}` },
    { key: 'pool_retainer', label: 'Work pool: Retainer', format: NUM, formula: (m) => `${R('bl_retainer', m - 1)}+${R('dh_retainer', m)}` },
    { key: 'pool_board', label: 'Work pool: Board readout', format: NUM, formula: (m) => `${R('bl_board', m - 1)}+${R('dh_board', m)}` },
    { key: 'projectPool', label: 'Project work pool hours', format: NUM, formula: (m) => `${R('pool_assessment', m)}+${R('pool_sprint', m)}+${R('pool_retainer', m)}+${R('pool_board', m)}` },
    {
      key: 'benchHours',
      label: 'Internal bench hours',
      format: NUM,
      formula: (m) => `IF(AND(${R('month', m)}>=${I('benchStartMonth')},${R('prevBacklogWeeks', m)}>${I('benchTriggerBacklogWeeks')}),MIN(${I('benchMaxHoursPerMonth')},MAX(0,${R('projectPool', m)}-${R('capacityForProjects', m)})),0)`,
    },
    { key: 'projectCapacity', label: 'Project capacity (advisors + bench)', format: NUM, formula: (m) => `${R('capacityForProjects', m)}+${R('benchHours', m)}` },
    { key: 'fulfillment', label: 'Fulfillment ratio', format: PCT, formula: (m) => `IF(${R('projectPool', m)}>0.000000001,MIN(1,${R('projectCapacity', m)}/${R('projectPool', m)}),1)` },
    { key: 'projectDelivered', label: 'Project hours delivered', format: NUM, formula: (m) => `${R('projectPool', m)}*${R('fulfillment', m)}` },
    { key: 'del_assessment', label: 'Delivered hours: Assessment', format: NUM, formula: (m) => `${R('pool_assessment', m)}*${R('fulfillment', m)}` },
    { key: 'del_sprint', label: 'Delivered hours: Sprint', format: NUM, formula: (m) => `${R('pool_sprint', m)}*${R('fulfillment', m)}` },
    { key: 'del_retainer', label: 'Delivered hours: Retainer', format: NUM, formula: (m) => `${R('pool_retainer', m)}*${R('fulfillment', m)}` },
    { key: 'del_board', label: 'Delivered hours: Board readout', format: NUM, formula: (m) => `${R('pool_board', m)}*${R('fulfillment', m)}` },
    { key: 'bl_assessment', label: 'Backlog hours: Assessment', format: NUM, formula: (m) => `${R('pool_assessment', m)}-${R('del_assessment', m)}` },
    { key: 'bl_sprint', label: 'Backlog hours: Sprint', format: NUM, formula: (m) => `${R('pool_sprint', m)}-${R('del_sprint', m)}` },
    { key: 'bl_retainer', label: 'Backlog hours: Retainer', format: NUM, formula: (m) => `${R('pool_retainer', m)}-${R('del_retainer', m)}` },
    { key: 'bl_board', label: 'Backlog hours: Board readout', format: NUM, formula: (m) => `${R('pool_board', m)}-${R('del_board', m)}` },
    { key: 'backlogHours', label: 'Total backlog hours', format: NUM, formula: (m) => `${R('bl_assessment', m)}+${R('bl_sprint', m)}+${R('bl_retainer', m)}+${R('bl_board', m)}` },
    { key: 'backlogWeeks', label: 'Backlog (weeks of advisor capacity)', format: NUM, formula: (m) => `IF(${R('advisorCapacity', m)}>0.000000001,${R('backlogHours', m)}/(${R('advisorCapacity', m)}*12/52),0)` },
    { key: 'utilization', label: 'Realized advisor utilization', format: PCT, formula: (m) => `IF(${R('advisors', m)}>0,(MIN(${R('projectDelivered', m)},${R('capacityForProjects', m)})+${R('fcDelivered', m)})/(${R('advisors', m)}*${R('hoursPerMonth', m)}),0)` },

    // --- Hiring rule (evaluated at start of month using prior months) ---
    { key: 'trailingUtil', label: 'Trailing 3-month utilization', format: PCT, formula: (m) => (m >= 4 ? `AVERAGE(${monthCol(m - 3)}$${rowIndex.get('utilization')}:${monthCol(m - 1)}$${rowIndex.get('utilization')})` : 0) },
    { key: 'pendingHires', label: 'Hires decided, not yet arrived', format: INT, formula: (m) => (m >= 2 ? `SUMIFS(${RPAST('hireDecision', m - 1)},${RPAST('month', m - 1)},">="&(${R('month', m)}-${I('hireLagMonths')}+1),${RPAST('month', m - 1)},"<="&(${R('month', m)}-1))` : 0) },
    { key: 'recentDecisions', label: 'Hire decisions inside cooldown window', format: INT, formula: (m) => (m >= 2 ? `SUMIFS(${RPAST('hireDecision', m - 1)},${RPAST('month', m - 1)},">="&(${R('month', m)}-${I('hireCooldownMonths')}),${RPAST('month', m - 1)},"<="&(${R('month', m)}-1))` : 0) },
    {
      key: 'hireDecision',
      label: 'Hire decision (1 = hire)',
      format: INT,
      formula: (m) =>
        m >= 4
          ? `IF(AND(ROUND(${R('trailingUtil', m)},9)>=${I('hireUtilThreshold')},${R('prevBacklogWeeks', m)}>${I('hireBacklogWeeks')},${R('advisors', m)}+${R('pendingHires', m)}<${I('maxAdvisors')},${R('recentDecisions', m)}=0),1,0)`
          : 0,
    },

    // --- Revenue ---
    { key: 'rev_assessment', label: `Revenue: ${OFFERING_LABELS.assessment}`, format: MONEY, formula: (m) => `${R('del_assessment', m)}*${I('assessmentPrice')}/${I('assessmentHours')}*${R('escalator', m)}` },
    { key: 'rev_sprint', label: `Revenue: ${OFFERING_LABELS.sprint}`, format: MONEY, formula: (m) => `${R('del_sprint', m)}*${I('sprintPrice')}/${I('sprintHours')}*${R('escalator', m)}` },
    { key: 'rev_retainer', label: `Revenue: ${OFFERING_LABELS.retainer}`, format: MONEY, formula: (m) => `IF(${R('retainerBlendedHours', m)}>0,${R('del_retainer', m)}*${R('retainerBlendedFee', m)}/${R('retainerBlendedHours', m)},0)*${R('escalator', m)}` },
    { key: 'rev_board', label: `Revenue: ${OFFERING_LABELS.board}`, format: MONEY, formula: (m) => `${R('del_board', m)}*${I('boardReadoutPrice')}/${I('boardReadoutHours')}*${R('escalator', m)}` },
    { key: 'rev_fcAddon', label: `Revenue: ${OFFERING_LABELS.fcAddon}`, format: MONEY, formula: (m) => `${R('fcCustomers', m)}*${I('fcAddonMonthly')}*${R('escalator', m)}` },
    { key: 'grossRevenue', label: 'Gross revenue', format: MONEY, formula: (m) => `${R('rev_assessment', m)}+${R('rev_sprint', m)}+${R('rev_retainer', m)}+${R('rev_board', m)}+${R('rev_fcAddon', m)}` },
    { key: 'flexMargin', label: 'Falcon Flex program margin (ASSUMPTION)', format: MONEY, formula: (m) => `${R('grossRevenue', m)}*${I('flexShare')}*${I('flexProgramMarginPct')}` },
    { key: 'netRevenue', label: 'Net revenue', format: MONEY, formula: (m) => `${R('grossRevenue', m)}-${R('flexMargin', m)}` },

    // --- Direct cost and margins ---
    { key: 'advisorLabor', label: 'Advisor labor (loaded)', format: MONEY, formula: (m) => `(${R('principals', m)}*${I('principalLoadedCost')}+${R('seniors', m)}*${I('seniorLoadedCost')})/12` },
    { key: 'benchCost', label: 'Internal bench cost', format: MONEY, formula: (m) => `${R('benchHours', m)}*${I('benchCostPerHour')}` },
    { key: 'fcDeliveryCost', label: 'FC add-on delivery cost transfer', format: MONEY, formula: (m) => `${R('rev_fcAddon', m)}*${I('fcAddonDeliveryCostPct')}` },
    { key: 'directCost', label: 'Direct cost', format: MONEY, formula: (m) => `${R('advisorLabor', m)}+${R('benchCost', m)}+${R('fcDeliveryCost', m)}` },
    { key: 'grossMargin', label: 'Gross margin', format: MONEY, formula: (m) => `${R('netRevenue', m)}-${R('directCost', m)}` },
    { key: 'grossMarginPct', label: 'Gross margin %', format: PCT, formula: (m) => `IF(${R('netRevenue', m)}>0.000000001,${R('grossMargin', m)}/${R('netRevenue', m)},0)` },
    { key: 'salesOverhead', label: 'Sales/SE overhead allocation', format: MONEY, formula: (m) => `${R('netRevenue', m)}*${I('salesOverheadPct')}` },
    { key: 'travel', label: 'Travel', format: MONEY, formula: (m) => `${R('netRevenue', m)}*${I('travelPct')}` },
    { key: 'contribution', label: 'Contribution margin', format: MONEY, formula: (m) => `${R('grossMargin', m)}-${R('salesOverhead', m)}-${R('travel', m)}` },
    { key: 'practiceLead', label: 'Practice lead allocation', format: MONEY, formula: () => `${I('practiceLeadAllocation')}/12` },
    { key: 'marketing', label: 'Marketing / MDF', format: MONEY, formula: (m) => `IF(${R('year', m)}=1,${I('marketingYear1')},IF(${R('year', m)}=2,${I('marketingYear2')},${I('marketingYear3')}))/12` },
    { key: 'training', label: 'Training and certification', format: MONEY, formula: (m) => `${R('advisors', m)}*${I('trainingPerAdvisor')}/12` },
    { key: 'tooling', label: 'Tooling, lab, Falcon IQ sandbox', format: MONEY, formula: () => `${I('toolingPerYear')}/12` },
    { key: 'insuranceLegal', label: 'Insurance / legal', format: MONEY, formula: () => `${I('insuranceLegalPerYear')}/12` },
    { key: 'fixedOpex', label: 'Fixed opex', format: MONEY, formula: (m) => `${R('practiceLead', m)}+${R('marketing', m)}+${R('training', m)}+${R('tooling', m)}+${R('insuranceLegal', m)}` },
    { key: 'ebitda', label: 'EBITDA', format: MONEY, formula: (m) => `${R('contribution', m)}-${R('fixedOpex', m)}` },

    // --- Cash ---
    { key: 'collectW2', label: 'Share of revenue collected two months out', format: PCT, formula: () => `MAX(0,MIN(1,${I('paymentTermsDays')}/30-1))` },
    { key: 'collections', label: 'Collections', format: MONEY, formula: (m) => `${R('netRevenue', m - 1)}*(1-${R('collectW2', m)})+${R('netRevenue', m - 2)}*${R('collectW2', m)}` },
    { key: 'cashOut', label: 'Cash out', format: MONEY, formula: (m) => `${R('directCost', m)}+${R('salesOverhead', m)}+${R('travel', m)}+${R('fixedOpex', m)}` },
    { key: 'netCash', label: 'Net cash', format: MONEY, formula: (m) => `${R('collections', m)}-${R('cashOut', m)}` },
    { key: 'cumulativeCash', label: 'Cumulative cash', format: MONEY, formula: (m) => `${R('cumulativeCash', m - 1)}+${R('netCash', m)}` },
    { key: 'leftOnTable', label: 'Revenue left on the table (declined assessments x CLV)', format: MONEY, formula: (m) => `${R('assessmentsLost', m)}*CLV!$B$3` },
  ];
  return rows;
}

function buildMonthlySheet(): Grid {
  const specs = monthlyRows();
  // Assign rows first so cross references resolve. Row 1 = header.
  specs.forEach((s, i) => rowIndex.set(s.key, i + 2));
  const header: Cell[] = ['Line item', 'Key'];
  for (let m = 1; m <= HORIZON_MONTHS; m++) header.push(`M${m}`);
  const grid: Grid = [header];
  for (const s of specs) {
    const row: Cell[] = [s.label, s.key];
    for (let m = 1; m <= HORIZON_MONTHS; m++) {
      const f = s.formula(m);
      row.push(typeof f === 'number' ? { v: f, z: s.format } : { f, z: s.format });
    }
    grid.push(row);
  }
  return grid;
}

// ---------------------------------------------------------------------------
// Annual, Summary, UnitEconomics, CLV, Checks
// ---------------------------------------------------------------------------

const yearRange = (key: string, year: number) => {
  const r = rowIndex.get(key)!;
  return `Monthly!${monthCol((year - 1) * 12 + 1)}$${r}:${monthCol(year * 12)}$${r}`;
};
const yearSum = (key: string, year: number) => `SUM(${yearRange(key, year)})`;
const yearEnd = (key: string, year: number) => `Monthly!${monthCol(year * 12)}$${rowIndex.get(key)}`;

function buildAnnualSheet(): Grid {
  const lines: Array<[string, (y: number) => string, string]> = [
    ['Revenue: Readiness Assessment', (y) => yearSum('rev_assessment', y), MONEY],
    ['Revenue: Prioritization Sprint', (y) => yearSum('rev_sprint', y), MONEY],
    ['Revenue: Remediation Retainer', (y) => yearSum('rev_retainer', y), MONEY],
    ['Revenue: Board Readout', (y) => yearSum('rev_board', y), MONEY],
    ['Revenue: Falcon Complete Add-on', (y) => yearSum('rev_fcAddon', y), MONEY],
    ['Gross revenue', (y) => yearSum('grossRevenue', y), MONEY],
    ['Falcon Flex program margin', (y) => yearSum('flexMargin', y), MONEY],
    ['Net revenue', (y) => yearSum('netRevenue', y), MONEY],
    ['Direct cost', (y) => yearSum('directCost', y), MONEY],
    ['Gross margin', (y) => yearSum('grossMargin', y), MONEY],
    ['Gross margin %', (y) => `IF(${yearSum('netRevenue', y)}>0,${yearSum('grossMargin', y)}/${yearSum('netRevenue', y)},0)`, PCT],
    ['Sales/SE overhead', (y) => yearSum('salesOverhead', y), MONEY],
    ['Travel', (y) => yearSum('travel', y), MONEY],
    ['Contribution margin', (y) => yearSum('contribution', y), MONEY],
    ['Fixed opex', (y) => yearSum('fixedOpex', y), MONEY],
    ['EBITDA', (y) => yearSum('ebitda', y), MONEY],
    ['EBITDA %', (y) => `IF(${yearSum('netRevenue', y)}>0,${yearSum('ebitda', y)}/${yearSum('netRevenue', y)},0)`, PCT],
    ['Ending advisors', (y) => yearEnd('advisors', y), INT],
    ['Average utilization', (y) => `AVERAGE(${yearRange('utilization', y)})`, PCT],
    ['Assessments accepted', (y) => yearSum('assessmentsAccepted', y), NUM],
    ['Assessments declined', (y) => yearSum('assessmentsLost', y), NUM],
    ['Revenue left on the table', (y) => yearSum('leftOnTable', y), MONEY],
    ['Net cash', (y) => yearSum('netCash', y), MONEY],
    ['Ending cumulative cash', (y) => yearEnd('cumulativeCash', y), MONEY],
  ];
  const grid: Grid = [['Line item', 'Year 1', 'Year 2', 'Year 3']];
  for (const [label, f, z] of lines) grid.push([label, { f: f(1), z }, { f: f(2), z }, { f: f(3), z }]);
  return grid;
}

function buildSummarySheet(): Grid {
  const cum = `Monthly!${monthCol(1)}$${rowIndex.get('cumulativeCash')}:${monthCol(HORIZON_MONTHS)}$${rowIndex.get('cumulativeCash')}`;
  const monthRow = `Monthly!${monthCol(1)}$${rowIndex.get('month')}:${monthCol(HORIZON_MONTHS)}$${rowIndex.get('month')}`;
  const grid: Grid = [
    ['Metric', 'Value', 'Note'],
    ['Year 1 gross revenue', { f: 'Annual!B7', z: MONEY }, ''],
    ['Year 2 gross revenue', { f: 'Annual!C7', z: MONEY }, ''],
    ['Year 3 gross revenue', { f: 'Annual!D7', z: MONEY }, ''],
    ['Year 1 EBITDA', { f: 'Annual!B17', z: MONEY }, ''],
    ['Year 2 EBITDA', { f: 'Annual!C17', z: MONEY }, ''],
    ['Year 3 EBITDA', { f: 'Annual!D17', z: MONEY }, ''],
    ['Peak funding requirement', { f: `MAX(0,-MIN(${cum}))`, z: MONEY }, 'Most negative cumulative cash'],
    ['Peak funding month', { f: `MATCH(MIN(${cum}),${cum},0)`, z: INT }, ''],
    ['Investment ask', { f: 'CEILING(B8*1.2,25000)', z: MONEY }, 'Peak funding plus 20% contingency, rounded up to $25,000'],
    ['Cash break-even month', { f: `IFERROR(MINIFS(${monthRow},${monthRow},">"&B9,${cum},">=0"),"beyond horizon")`, z: INT }, 'First month after the peak with cumulative cash at or above zero'],
    ['Ending advisors', { f: 'Annual!D19', z: INT }, ''],
    ['Total hires', { f: `SUM(Monthly!${monthCol(1)}$${rowIndex.get('arrivals')}:${monthCol(HORIZON_MONTHS)}$${rowIndex.get('arrivals')})`, z: INT }, ''],
    ['Assessments declined (36 months)', { f: 'SUM(Annual!B22:D22)', z: NUM }, ''],
    ['Revenue left on the table (36 months)', { f: 'SUM(Annual!B23:D23)', z: MONEY }, 'Declined assessments valued at 36-month CLV'],
    ['Cumulative cash at month 36', { f: 'Annual!D25', z: MONEY }, ''],
  ];
  return grid;
}

function buildUnitEconomicsSheet(): Grid {
  const cph = `${I('principalLoadedCost')}/(${I('billableHoursPerYear')}*${I('utilSteadyState')})`;
  const grid: Grid = [
    ['Offering', 'Revenue', 'Basis', 'Delivery hours', 'Delivery cost', 'Gross margin', 'Gross margin %', 'Margin per advisor-hour', 'Effective rate'],
  ];
  const push = (label: string, rev: string, basis: string, hours: string, extra = '0') => {
    const r = grid.length + 1;
    grid.push([
      label,
      { f: rev, z: MONEY },
      basis,
      { f: hours, z: NUM },
      { f: `D${r}*${cph}+${extra}`, z: MONEY },
      { f: `B${r}-E${r}`, z: MONEY },
      { f: `IF(B${r}>0,F${r}/B${r},0)`, z: PCT },
      { f: `IF(D${r}>0,F${r}/D${r},0)`, z: MONEY },
      { f: `IF(D${r}>0,B${r}/D${r},0)`, z: MONEY },
    ]);
  };
  push(OFFERING_LABELS.assessment, I('assessmentPrice'), 'per engagement', I('assessmentHours'));
  push(OFFERING_LABELS.sprint, I('sprintPrice'), 'per engagement', I('sprintHours'));
  push(OFFERING_LABELS.retainer, `Monthly!${monthCol(1)}$${rowIndex.get('retainerBlendedFee')}`, 'per month', `Monthly!${monthCol(1)}$${rowIndex.get('retainerBlendedHours')}`);
  push(OFFERING_LABELS.board, I('boardReadoutPrice'), 'per engagement', I('boardReadoutHours'));
  push(OFFERING_LABELS.fcAddon, I('fcAddonMonthly'), 'per month', I('fcAddonAdvisorHours'), `${I('fcAddonMonthly')}*${I('fcAddonDeliveryCostPct')}`);
  grid.push([]);
  grid.push(['Cost per billable advisor-hour', { f: cph, z: MONEY }, 'Principal loaded cost / (billable hours x steady-state utilization)']);
  return grid;
}

function buildClvSheet(): Grid {
  // Row 3 holds the gross CLV total; rows 7.. hold the month-by-month expected revenue table.
  const grid: Grid = [
    ['Customer lifetime value: one assessment-originated account, 36 months'],
    ['Metric', 'Value'],
    ['Gross CLV (36 months)', { f: 'SUM(G7:G42)', z: MONEY }],
    ['Net CLV after Falcon Flex program margin', { f: `B3*(1-${I('flexShare')}*${I('flexProgramMarginPct')})`, z: MONEY }],
    [],
    ['Month', 'Escalator', 'Assessment', 'Sprint', 'Retainer', 'Board readout', 'Total'],
  ];
  const fee = `Monthly!${monthCol(1)}$${rowIndex.get('retainerBlendedFee')}`;
  for (let m = 1; m <= HORIZON_MONTHS; m++) {
    const r = 6 + m;
    const esc = `(1+${I('priceEscalator')})^(CEILING(A${r}/12,1)-1)`;
    const assessment = m === 1 ? `${I('assessmentPrice')}*B${r}` : '0';
    const sprint = m === 2 ? `${I('attachSprint')}*${I('sprintPrice')}*4/6*B${r}` : m === 3 ? `${I('attachSprint')}*${I('sprintPrice')}*2/6*B${r}` : '0';
    // retainer years start at month 4, 16, 28 with survival attachSprint*attachRetainer*renewal^(k)
    let retainer = '0';
    if (m >= 4) {
      const k = Math.floor((m - 4) / 12);
      retainer = `${I('attachSprint')}*${I('attachRetainer')}*${I('renewalRate')}^${k}*${fee}*B${r}`;
    }
    let board = '0';
    if (m === 4) board = `${I('attachSprint')}*${I('boardAttach')}*${I('boardReadoutPrice')}*B${r}`;
    else if (m === 16 || m === 28) {
      const k = (m - 4) / 12; // renewals survived
      board = `${I('attachSprint')}*${I('attachRetainer')}*${I('renewalRate')}^${k}*${I('boardAttach')}*${I('boardReadoutPrice')}*B${r}`;
    }
    grid.push([
      m,
      { f: esc, z: '0.0000' },
      { f: assessment, z: MONEY },
      { f: sprint, z: MONEY },
      { f: retainer, z: MONEY },
      { f: board, z: MONEY },
      { f: `SUM(C${r}:F${r})`, z: MONEY },
    ]);
  }
  return grid;
}

function buildChecksSheet(): Grid {
  const rr = (key: string, a: number, b: number) => `Monthly!${monthCol(a)}$${rowIndex.get(key)}:${monthCol(b)}$${rowIndex.get(key)}`;
  const grid: Grid = [
    ['Check', 'Result', 'Detail'],
    ['No negative gross margin after month 6', { f: `IF(MIN(${rr('grossMargin', 7, 36)})>=0,"PASS","FAIL")` }, 'Minimum monthly gross margin, months 7-36:'],
    ['Delivered project hours never exceed advisor plus bench capacity', { f: `IF(SUMPRODUCT((${rr('projectDelivered', 1, 36)}>${rr('projectCapacity', 1, 36)}+0.000001)*1)=0,"PASS","FAIL")` }, 'Count of months over capacity:'],
    ['Utilization never exceeds steady-state ceiling', { f: `IF(MAX(${rr('utilization', 1, 36)})<=${I('utilSteadyState')}+0.000000001,"PASS","FAIL")` }, 'Maximum realized utilization:'],
    ['Headcount never exceeds cap', { f: `IF(MAX(${rr('advisors', 1, 36)})<=${I('maxAdvisors')},"PASS","FAIL")` }, 'Maximum advisors:'],
    ['Cash reconciles to EBITDA less receivables', { f: `IF(ABS(SUM(${rr('ebitda', 1, 36)})-(SUM(${rr('netRevenue', 1, 36)})-SUM(${rr('collections', 1, 36)}))-SUM(${rr('netCash', 1, 36)}))<0.01,"PASS","FAIL")` }, 'Difference:'],
    ['Tier mix sums to 100%', { f: `IF(ABS(${I('tierMix1')}+${I('tierMix2')}+${I('tierMix3')}-1)<0.000000001,"PASS","FAIL")` }, 'Tier mix total:'],
  ];
  grid[1].push({ f: `MIN(${rr('grossMargin', 7, 36)})`, z: MONEY });
  grid[2].push({ f: `SUMPRODUCT((${rr('projectDelivered', 1, 36)}>${rr('projectCapacity', 1, 36)}+0.000001)*1)`, z: INT });
  grid[3].push({ f: `MAX(${rr('utilization', 1, 36)})`, z: PCT });
  grid[4].push({ f: `MAX(${rr('advisors', 1, 36)})`, z: INT });
  grid[5].push({ f: `SUM(${rr('ebitda', 1, 36)})-(SUM(${rr('netRevenue', 1, 36)})-SUM(${rr('collections', 1, 36)}))-SUM(${rr('netCash', 1, 36)})`, z: NUM });
  grid[6].push({ f: `${I('tierMix1')}+${I('tierMix2')}+${I('tierMix3')}`, z: PCT });
  return grid;
}

function buildScenariosSheet(inputs: ModelInputs): Grid {
  const sc = computeScenarios(inputs);
  const grid: Grid = [
    ['Scenario snapshot (values computed by model/fairr-model.ts; the Inputs sheet drives the live Monthly model for one scenario at a time)'],
    ['Metric', 'Base', 'Downside', 'Upside', 'GSI price war'],
  ];
  const keys = ['base', 'downside', 'upside', 'priceWar'] as const;
  const line = (label: string, f: (k: (typeof keys)[number]) => number, z: string) =>
    grid.push([label, ...keys.map((k) => ({ v: f(k), z }))]);
  line('Year 1 gross revenue', (k) => sc[k].summary.revenueYear1, MONEY);
  line('Year 2 gross revenue', (k) => sc[k].summary.revenueYear2, MONEY);
  line('Year 3 gross revenue', (k) => sc[k].summary.revenueYear3, MONEY);
  line('Year 1 EBITDA', (k) => sc[k].summary.ebitdaYear1, MONEY);
  line('Year 2 EBITDA', (k) => sc[k].summary.ebitdaYear2, MONEY);
  line('Year 3 EBITDA', (k) => sc[k].summary.ebitdaYear3, MONEY);
  line('Cash break-even month', (k) => sc[k].summary.cashBreakEvenMonth ?? 0, INT);
  line('Peak funding requirement', (k) => sc[k].summary.peakFundingRequirement, MONEY);
  line('Investment ask', (k) => sc[k].summary.investmentAsk, MONEY);
  line('Ending advisors', (k) => sc[k].summary.endingAdvisors, INT);
  line('Assessments declined', (k) => sc[k].summary.totalAssessmentsLost, NUM);
  line('Revenue left on the table', (k) => sc[k].summary.totalRevenueLeftOnTable, MONEY);
  return grid;
}

function buildTornadoSheet(inputs: ModelInputs): Grid {
  const t = computeTornado(inputs);
  const grid: Grid = [
    ['Tornado sensitivity on EBITDA Year 2 (values computed by model/fairr-model.ts)'],
    ['Base EBITDA Year 2', { v: t.baseEbitdaYear2, z: MONEY }],
    ['Input', 'Base value', 'Low value', 'High value', 'EBITDA Y2 at low', 'EBITDA Y2 at high', 'Swing'],
  ];
  for (const b of t.bars) {
    grid.push([b.label, { v: b.baseValue, z: NUM }, { v: b.lowValue, z: NUM }, { v: b.highValue, z: NUM }, { v: b.ebitdaLow, z: MONEY }, { v: b.ebitdaHigh, z: MONEY }, { v: b.swing, z: MONEY }]);
  }
  return grid;
}

// ---------------------------------------------------------------------------
// Workbook assembly
// ---------------------------------------------------------------------------

export function buildWorkbook(inputs: ModelInputs = BASE_INPUTS): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();
  const inputsGrid = buildInputsSheet(inputs);
  const monthlyGrid = buildMonthlySheet(); // assigns rowIndex
  const sheets: Array<[string, Grid]> = [
    ['Inputs', inputsGrid],
    ['Monthly', monthlyGrid],
    ['Annual', buildAnnualSheet()],
    ['Summary', buildSummarySheet()],
    ['UnitEconomics', buildUnitEconomicsSheet()],
    ['CLV', buildClvSheet()],
    ['Checks', buildChecksSheet()],
    ['Scenarios', buildScenariosSheet(inputs)],
    ['Tornado', buildTornadoSheet(inputs)],
    ['ReadMe', buildReadmeSheet()],
  ];
  for (const [name, grid] of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(grid.map((row) => row.map(toCell)));
    ws['!cols'] = name === 'Monthly' ? [{ wch: 52 }, { wch: 20 }, ...Array(HORIZON_MONTHS).fill({ wch: 12 })] : [{ wch: 48 }, { wch: 18 }, { wch: 18 }, { wch: 40 }, { wch: 28 }, { wch: 10 }];
    if (name === 'Monthly') ws['!freeze'] = { xSplit: 2, ySplit: 1 };
    XLSX.utils.book_append_sheet(wb, ws, name);
  }
  return wb;
}

function toCell(c: Cell): XLSX.CellObject | string | number {
  if (typeof c === 'string' || typeof c === 'number') return c;
  if ('f' in c) return { t: 'n', f: c.f, z: c.z } as XLSX.CellObject;
  const v = c.v;
  return typeof v === 'number' ? ({ t: 'n', v, z: c.z } as XLSX.CellObject) : ({ t: 's', v } as XLSX.CellObject);
}

function buildReadmeSheet(): Grid {
  return [
    ['Optiv FAIRR practice financial model'],
    ['Generated from model/fairr-model.ts; every sheet except Scenarios and Tornado is driven by live formulas from the Inputs sheet.'],
    ['Edit yellow-basis values on the Inputs sheet to re-run the model. Rows labeled ASSUMPTION are not sourced; see model/ASSUMPTIONS.md.'],
    ['Monthly: one column per month (M1..M36). Annual and Summary roll up the Monthly sheet. Checks reproduces model/VALIDATION.md.'],
    ['Advisor headcount cap in this workbook is the maxAdvisors input; the hiring rule fires when trailing utilization >= threshold and backlog > threshold, with a recruiting lag and cooldown.'],
    ['The TypeScript model and this workbook are reconciled by model/validate.ts using the HyperFormula engine (see model/VALIDATION.md).'],
  ];
}

export function monthlyRowIndex(): Map<string, number> {
  return rowIndex;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const wb = buildWorkbook(BASE_INPUTS);
  const outPath = resolve(here, 'fairr-model.xlsx');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }) as Buffer;
  writeFileSync(outPath, buf);
  const out = computeModel(BASE_INPUTS);
  console.log(`Wrote ${outPath} (${(buf.length / 1024).toFixed(0)} KB). TypeScript base case Y1 revenue $${Math.round(out.summary.revenueYear1).toLocaleString('en-US')}.`);
}
