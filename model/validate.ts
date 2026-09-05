/**
 * Validates the model and writes model/VALIDATION.md.
 *
 * 1. Runs the shared checks (runChecks) against the base case and each scenario.
 * 2. Rebuilds the Excel workbook in memory, loads every formula into HyperFormula,
 *    recalculates, and compares the Monthly, Annual, and Summary results to the
 *    TypeScript model cell by cell.
 *
 * npm run model:validate
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';
import { HyperFormula, type RawCellContent } from 'hyperformula';
import { BASE_INPUTS, HORIZON_MONTHS, SCENARIOS, computeModel, runChecks, type ModelOutputs, type MonthRow } from './fairr-model.ts';
import { buildWorkbook, monthCol, monthlyRowIndex } from './build-xlsx.ts';

const here = dirname(fileURLToPath(import.meta.url));
const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;

interface Diff {
  row: string;
  month: number;
  ts: number;
  xlsx: number;
}

function sheetToRaw(ws: XLSX.WorkSheet): RawCellContent[][] {
  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  const rows: RawCellContent[][] = [];
  for (let r = range.s.r; r <= range.e.r; r++) {
    const row: RawCellContent[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })] as XLSX.CellObject | undefined;
      if (!cell) row.push(null);
      else if (cell.f) row.push(`=${cell.f}`);
      else row.push((cell.v as RawCellContent) ?? null);
    }
    rows.push(row);
  }
  return rows;
}

function recalcWorkbook(): { hf: HyperFormula; sheetIds: Record<string, number> } {
  const wb = buildWorkbook(BASE_INPUTS);
  const sheets: Record<string, RawCellContent[][]> = {};
  for (const name of wb.SheetNames) sheets[name] = sheetToRaw(wb.Sheets[name]);
  const hf = HyperFormula.buildFromSheets(sheets, { licenseKey: 'gpl-v3', useArrayArithmetic: true });
  const sheetIds: Record<string, number> = {};
  for (const name of wb.SheetNames) sheetIds[name] = hf.getSheetId(name)!;
  return { hf, sheetIds };
}

function compareMonthly(out: ModelOutputs, hf: HyperFormula, sheet: number): { diffs: Diff[]; compared: number } {
  const idx = monthlyRowIndex();
  const map: Array<[string, (r: MonthRow) => number]> = [
    ['advisors', (r) => r.advisors],
    ['advisorCapacity', (r) => r.advisorCapacityHours],
    ['assessmentsAccepted', (r) => r.assessmentsAccepted],
    ['assessmentsLost', (r) => r.assessmentsLost],
    ['sprintStarts', (r) => r.sprintStarts],
    ['retainerStarts', (r) => r.retainerStarts],
    ['renewalStarts', (r) => r.renewalStarts],
    ['retainersActive', (r) => r.retainersActive],
    ['boardReadouts', (r) => r.boardReadouts],
    ['fcCustomers', (r) => r.fcCustomers],
    ['benchHours', (r) => r.benchHours],
    ['projectDelivered', (r) => r.projectDeliveredHours],
    ['backlogHours', (r) => r.totalBacklogHours],
    ['backlogWeeks', (r) => r.backlogWeeks],
    ['utilization', (r) => r.utilization],
    ['hireDecision', (r) => (r.hireDecision ? 1 : 0)],
    ['rev_assessment', (r) => r.grossRevenue.assessment],
    ['rev_sprint', (r) => r.grossRevenue.sprint],
    ['rev_retainer', (r) => r.grossRevenue.retainer],
    ['rev_board', (r) => r.grossRevenue.board],
    ['rev_fcAddon', (r) => r.grossRevenue.fcAddon],
    ['grossRevenue', (r) => r.grossRevenueTotal],
    ['netRevenue', (r) => r.netRevenue],
    ['directCost', (r) => r.directCost],
    ['grossMargin', (r) => r.grossMargin],
    ['contribution', (r) => r.contributionMargin],
    ['fixedOpex', (r) => r.fixedOpex],
    ['ebitda', (r) => r.ebitda],
    ['collections', (r) => r.collections],
    ['netCash', (r) => r.netCash],
    ['cumulativeCash', (r) => r.cumulativeCash],
    ['leftOnTable', (r) => r.revenueLeftOnTable],
  ];
  const diffs: Diff[] = [];
  let compared = 0;
  for (const [key, pick] of map) {
    const row = idx.get(key)!;
    for (let m = 1; m <= HORIZON_MONTHS; m++) {
      const addr = `${monthCol(m)}${row}`;
      const v = hf.getCellValue(toAddress(sheet, addr));
      const x = typeof v === 'number' ? v : Number.NaN;
      const t = pick(out.months[m - 1]);
      compared++;
      const tol = Math.max(0.01, Math.abs(t) * 1e-7);
      if (!(Math.abs(x - t) <= tol)) diffs.push({ row: key, month: m, ts: t, xlsx: x });
    }
  }
  return { diffs, compared };
}

function toAddress(sheet: number, addr: string): { sheet: number; row: number; col: number } {
  const { r, c } = XLSX.utils.decode_cell(addr);
  return { sheet, row: r, col: c };
}

function cell(hf: HyperFormula, sheet: number, addr: string): number | string {
  const v = hf.getCellValue(toAddress(sheet, addr));
  if (typeof v === 'number' || typeof v === 'string') return v;
  return Number.NaN;
}

function main(): void {
  const lines: string[] = [];
  lines.push('# Model Validation');
  lines.push('');
  lines.push(`Generated ${new Date().toISOString().slice(0, 10)} by \`npm run model:validate\`. Every check below is re-run by the Vitest suite (\`npm test\`).`);
  lines.push('');

  let allPassed = true;

  // 1. Shared checks per scenario
  lines.push('## Model checks by scenario');
  lines.push('');
  for (const s of SCENARIOS) {
    const out = computeModel(s.apply(BASE_INPUTS));
    const checks = runChecks(out);
    lines.push(`### ${s.label}`);
    lines.push('');
    lines.push('| Check | Result | Detail |');
    lines.push('|---|---|---|');
    for (const c of checks) {
      if (!c.passed) allPassed = false;
      lines.push(`| ${c.name} | ${c.passed ? 'PASS' : 'FAIL'} | ${c.detail} |`);
    }
    lines.push('');
    const sm = out.summary;
    lines.push(`Headline: Y1 ${money(sm.revenueYear1)} / Y2 ${money(sm.revenueYear2)} / Y3 ${money(sm.revenueYear3)} gross revenue; EBITDA Y2 ${money(sm.ebitdaYear2)}; cash break-even month ${sm.cashBreakEvenMonth ?? 'beyond horizon'}; peak funding ${money(sm.peakFundingRequirement)}; investment ask ${money(sm.investmentAsk)}; ending headcount ${sm.endingAdvisors}.`);
    lines.push('');
  }

  // 2. Excel reconciliation
  lines.push('## Excel workbook reconciliation (HyperFormula recalculation)');
  lines.push('');
  const base = computeModel(BASE_INPUTS);
  const { hf, sheetIds } = recalcWorkbook();
  const { diffs, compared } = compareMonthly(base, hf, sheetIds.Monthly);
  const summaryPairs: Array<[string, string, number]> = [
    ['Year 1 gross revenue', 'B2', base.summary.revenueYear1],
    ['Year 2 gross revenue', 'B3', base.summary.revenueYear2],
    ['Year 3 gross revenue', 'B4', base.summary.revenueYear3],
    ['Year 1 EBITDA', 'B5', base.summary.ebitdaYear1],
    ['Year 2 EBITDA', 'B6', base.summary.ebitdaYear2],
    ['Year 3 EBITDA', 'B7', base.summary.ebitdaYear3],
    ['Peak funding requirement', 'B8', base.summary.peakFundingRequirement],
    ['Peak funding month', 'B9', base.summary.peakFundingMonth],
    ['Investment ask', 'B10', base.summary.investmentAsk],
    ['Cash break-even month', 'B11', base.summary.cashBreakEvenMonth ?? Number.NaN],
    ['Ending advisors', 'B12', base.summary.endingAdvisors],
    ['Total hires', 'B13', base.summary.hireMonths.length],
    ['Assessments declined', 'B14', base.summary.totalAssessmentsLost],
    ['Revenue left on the table', 'B15', base.summary.totalRevenueLeftOnTable],
    ['Cumulative cash at month 36', 'B16', base.summary.cumulativeCashMonth36],
  ];
  lines.push(`Monthly sheet: ${compared} formula cells across 32 line items compared to the TypeScript model at a tolerance of $0.01 or 1e-7 relative. Mismatches: ${diffs.length}.`);
  lines.push('');
  if (diffs.length) {
    allPassed = false;
    lines.push('| Row | Month | TypeScript | Excel |');
    lines.push('|---|---|---|---|');
    for (const d of diffs.slice(0, 40)) lines.push(`| ${d.row} | ${d.month} | ${d.ts} | ${d.xlsx} |`);
    lines.push('');
  }
  lines.push('| Summary metric | TypeScript | Excel (recalculated) | Match |');
  lines.push('|---|---|---|---|');
  for (const [label, addr, ts] of summaryPairs) {
    const x = cell(hf, sheetIds.Summary, addr);
    const xv = typeof x === 'number' ? x : Number.NaN;
    const ok = Math.abs(xv - ts) <= Math.max(0.01, Math.abs(ts) * 1e-7);
    if (!ok) allPassed = false;
    const isCount = /month|advisors|hires|declined/i.test(label);
    const fmtT = isCount ? String(Math.round(ts * 10) / 10) : money(ts);
    const fmtX = typeof x === 'number' ? (isCount ? String(Math.round(x * 10) / 10) : money(x)) : String(x);
    lines.push(`| ${label} | ${fmtT} | ${fmtX} | ${ok ? 'PASS' : 'FAIL'} |`);
  }
  lines.push('');
  const clvX = cell(hf, sheetIds.CLV, 'B3');
  const clvOk = typeof clvX === 'number' && Math.abs(clvX - base.summary.clv36Gross) < 0.01;
  if (!clvOk) allPassed = false;
  lines.push(`CLV sheet: TypeScript ${money(base.summary.clv36Gross)} vs Excel ${typeof clvX === 'number' ? money(clvX) : String(clvX)}: ${clvOk ? 'PASS' : 'FAIL'}.`);
  lines.push('');
  lines.push('Checks sheet (formulas evaluated in the workbook):');
  lines.push('');
  lines.push('| Check | Result |');
  lines.push('|---|---|');
  for (let r = 2; r <= 7; r++) {
    const name = cell(hf, sheetIds.Checks, `A${r}`);
    const res = cell(hf, sheetIds.Checks, `B${r}`);
    if (res !== 'PASS') allPassed = false;
    lines.push(`| ${name} | ${res} |`);
  }
  lines.push('');
  lines.push(`## Overall: ${allPassed ? 'ALL CHECKS PASSED' : 'FAILURES PRESENT'}`);
  lines.push('');
  writeFileSync(resolve(here, 'VALIDATION.md'), lines.join('\n'));
  console.log(lines.join('\n'));
  if (!allPassed) process.exit(1);
}

main();
