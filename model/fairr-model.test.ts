import { describe, expect, it } from 'vitest';
import {
  BASE_INPUTS,
  HORIZON_MONTHS,
  OFFERING_KEYS,
  SCENARIOS,
  computeClv36,
  computeModel,
  computeScenarios,
  computeTornado,
  computeUnitEconomics,
  runChecks,
  type ModelInputs,
} from './fairr-model.ts';

const base = computeModel(BASE_INPUTS);

describe('computeModel: structure', () => {
  it('produces 36 monthly rows and 3 annual rows', () => {
    expect(base.months).toHaveLength(HORIZON_MONTHS);
    expect(base.annual).toHaveLength(3);
    expect(base.months[0].month).toBe(1);
    expect(base.months[35].year).toBe(3);
  });

  it('is a pure function of its inputs', () => {
    const a = computeModel(BASE_INPUTS);
    const b = computeModel({ ...BASE_INPUTS });
    expect(a.summary).toEqual(b.summary);
    expect(a.months.map((r) => r.ebitda)).toEqual(b.months.map((r) => r.ebitda));
  });

  it('starts with two Principal Advisors on month 1', () => {
    expect(base.months[0].advisors).toBe(BASE_INPUTS.startingAdvisors);
    expect(base.months[0].principals).toBe(2);
    expect(base.months[0].seniors).toBe(0);
  });
});

describe('computeModel: validation checks (Phase 2)', () => {
  const checks = runChecks(base);

  it.each(checks.map((c) => [c.name, c]))('%s', (_name, c) => {
    expect(c.passed, c.detail).toBe(true);
  });

  it('has no negative gross margin after month 6', () => {
    for (const r of base.months.filter((m) => m.month > 6)) expect(r.grossMargin).toBeGreaterThanOrEqual(0);
  });

  it('never recognizes more project hours than advisor plus bench capacity', () => {
    for (const r of base.months) {
      expect(r.projectDeliveredHours).toBeLessThanOrEqual(r.advisorCapacityForProjects + r.benchHours + 1e-6);
      expect(r.utilization).toBeLessThanOrEqual(BASE_INPUTS.utilSteadyState + 1e-9);
    }
  });

  it('fires the hiring rule only when trailing utilization and backlog both qualify', () => {
    const decisions = base.months.filter((r) => r.hireDecision);
    expect(decisions.length).toBeGreaterThan(0);
    for (const r of decisions) {
      const trailing = base.months.slice(r.month - 4, r.month - 1);
      const avg = trailing.reduce((s, t) => s + t.utilization, 0) / 3;
      expect(avg).toBeGreaterThanOrEqual(BASE_INPUTS.hireUtilThreshold - 1e-9);
      expect(base.months[r.month - 2].backlogWeeks).toBeGreaterThan(BASE_INPUTS.hireBacklogWeeks);
    }
    expect(Math.max(...base.months.map((r) => r.advisors))).toBeLessThanOrEqual(BASE_INPUTS.maxAdvisors);
  });

  it('does not fire the hiring rule when the backlog condition is removed', () => {
    const noBacklog = computeModel({ ...BASE_INPUTS, hireBacklogWeeks: 1e9 });
    expect(noBacklog.months.some((r) => r.hireDecision)).toBe(false);
    expect(noBacklog.summary.endingAdvisors).toBe(BASE_INPUTS.startingAdvisors);
  });

  it('does not fire the hiring rule when the utilization condition cannot be met', () => {
    const lowUtil = computeModel({ ...BASE_INPUTS, hireUtilThreshold: 0.99 });
    expect(lowUtil.months.some((r) => r.hireDecision)).toBe(false);
  });

  it('places hires after the recruiting lag', () => {
    const decisions = base.months.filter((r) => r.hireDecision).map((r) => r.month);
    expect(base.summary.hireMonths).toEqual(decisions.map((m) => m + BASE_INPUTS.hireLagMonths));
  });

  it('reconciles cash flow to EBITDA less working-capital timing', () => {
    const ebitda = base.months.reduce((s, r) => s + r.ebitda, 0);
    const netCash = base.months.reduce((s, r) => s + r.netCash, 0);
    const receivables = base.months.reduce((s, r) => s + r.netRevenue - r.collections, 0);
    expect(Math.abs(ebitda - receivables - netCash)).toBeLessThan(0.01);
    expect(base.months[35].cumulativeCash).toBeCloseTo(netCash, 6);
  });

  it('sums offering revenue to total revenue every month', () => {
    for (const r of base.months) {
      const sum = OFFERING_KEYS.reduce((s, k) => s + r.grossRevenue[k], 0);
      expect(sum).toBeCloseTo(r.grossRevenueTotal, 6);
      expect(r.netRevenue).toBeCloseTo(r.grossRevenueTotal - r.flexProgramMargin, 6);
    }
  });

  it('keeps backlog finite by declining assessments when the backlog cap is exceeded', () => {
    expect(Math.max(...base.months.map((r) => r.backlogWeeks))).toBeLessThan(BASE_INPUTS.maxBacklogWeeks + 20);
    expect(base.summary.totalAssessmentsLost).toBeGreaterThan(0);
    expect(base.summary.totalRevenueLeftOnTable).toBeCloseTo(base.summary.totalAssessmentsLost * base.summary.clv36Gross, 3);
  });
});

describe('computeModel: summary metrics', () => {
  it('computes the investment ask as peak funding plus 20% rounded up to $25,000', () => {
    const expected = Math.ceil((base.summary.peakFundingRequirement * 1.2) / 25_000) * 25_000;
    expect(base.summary.investmentAsk).toBe(expected);
    expect(base.summary.investmentAsk % 25_000).toBe(0);
  });

  it('reports a cash break-even month after the peak funding month', () => {
    expect(base.summary.cashBreakEvenMonth).not.toBeNull();
    expect(base.summary.cashBreakEvenMonth!).toBeGreaterThan(base.summary.peakFundingMonth);
    expect(base.months[base.summary.cashBreakEvenMonth! - 1].cumulativeCash).toBeGreaterThanOrEqual(0);
  });

  it('rolls annual revenue up from monthly rows', () => {
    for (const a of base.annual) {
      const rows = base.months.filter((r) => r.year === a.year);
      expect(a.grossRevenueTotal).toBeCloseTo(rows.reduce((s, r) => s + r.grossRevenueTotal, 0), 6);
      expect(a.ebitda).toBeCloseTo(rows.reduce((s, r) => s + r.ebitda, 0), 6);
    }
    expect(base.summary.revenueYear1 + base.summary.revenueYear2 + base.summary.revenueYear3).toBeCloseTo(
      base.months.reduce((s, r) => s + r.grossRevenueTotal, 0),
      6,
    );
  });

  it('grows revenue year over year in the base case', () => {
    expect(base.summary.revenueYear2).toBeGreaterThan(base.summary.revenueYear1);
    expect(base.summary.revenueYear3).toBeGreaterThan(base.summary.revenueYear2);
  });
});

describe('unit economics and CLV', () => {
  it('prices each offering above its delivery cost', () => {
    for (const u of computeUnitEconomics(BASE_INPUTS)) {
      expect(u.grossMargin, u.label).toBeGreaterThan(0);
      expect(u.grossMarginPct).toBeLessThan(1);
    }
  });

  it('computes CLV consistently with the attach chain', () => {
    const { gross, net } = computeClv36(BASE_INPUTS);
    expect(gross).toBeGreaterThan(BASE_INPUTS.assessmentPrice);
    expect(net).toBeCloseTo(gross * (1 - BASE_INPUTS.flexShare * BASE_INPUTS.flexProgramMarginPct), 6);
    const noAttach = computeClv36({ ...BASE_INPUTS, attachSprint: 0 });
    expect(noAttach.gross).toBeCloseTo(BASE_INPUTS.assessmentPrice, 6);
  });
});

describe('scenarios', () => {
  const scenarios = computeScenarios(BASE_INPUTS);

  it('defines the four required scenarios', () => {
    expect(SCENARIOS.map((s) => s.key)).toEqual(['base', 'downside', 'upside', 'priceWar']);
  });

  it('base scenario equals the base inputs', () => {
    expect(scenarios.base.summary).toEqual(base.summary);
  });

  it('downside lowers attach rates by 15 points, utilization by 10 points, and assessments by one per month', () => {
    const d = SCENARIOS[1].apply(BASE_INPUTS);
    expect(d.attachSprint).toBeCloseTo(BASE_INPUTS.attachSprint - 0.15, 9);
    expect(d.attachRetainer).toBeCloseTo(BASE_INPUTS.attachRetainer - 0.15, 9);
    expect(d.utilSteadyState).toBeCloseTo(BASE_INPUTS.utilSteadyState - 0.1, 9);
    expect(d.assessmentsMonths7to12).toBe(BASE_INPUTS.assessmentsMonths7to12 - 1);
    expect(scenarios.downside.summary.ebitdaYear2).toBeLessThan(base.summary.ebitdaYear2);
    expect(scenarios.downside.summary.revenueYear1).toBeLessThan(base.summary.revenueYear1);
  });

  it('upside doubles assessment demand from month 7', () => {
    const u = SCENARIOS[2].apply(BASE_INPUTS);
    const up = computeModel(u);
    expect(up.months[6].assessmentsDemand).toBeCloseTo(base.months[6].assessmentsDemand * 2, 9);
    expect(up.months[5].assessmentsDemand).toBeCloseTo(base.months[5].assessmentsDemand, 9);
    expect(scenarios.upside.summary.ebitdaYear2).toBeGreaterThan(base.summary.ebitdaYear2);
  });

  it('price war cuts every price by 20% and reduces revenue and EBITDA', () => {
    const p = SCENARIOS[3].apply(BASE_INPUTS);
    const priceKeys: Array<keyof ModelInputs> = [
      'assessmentPrice', 'sprintPrice', 'retainerTier1Monthly', 'retainerTier2Monthly', 'retainerTier3Monthly', 'boardReadoutPrice', 'fcAddonMonthly',
    ];
    for (const k of priceKeys) expect(p[k]).toBeCloseTo(BASE_INPUTS[k] * 0.8, 6);
    expect(scenarios.priceWar.summary.revenueYear2).toBeLessThan(base.summary.revenueYear2);
    expect(scenarios.priceWar.summary.ebitdaYear2).toBeLessThan(base.summary.ebitdaYear2);
  });

  it('passes every validation check in every scenario', () => {
    for (const s of SCENARIOS) {
      const out = computeModel(s.apply(BASE_INPUTS));
      for (const c of runChecks(out)) expect(c.passed, `${s.label}: ${c.name}: ${c.detail}`).toBe(true);
    }
  });
});

describe('tornado', () => {
  it('returns the ten highest-impact inputs sorted by swing', () => {
    const t = computeTornado(BASE_INPUTS);
    expect(t.bars).toHaveLength(10);
    expect(t.baseEbitdaYear2).toBeCloseTo(base.summary.ebitdaYear2, 6);
    for (let i = 1; i < t.bars.length; i++) expect(t.bars[i - 1].swing).toBeGreaterThanOrEqual(t.bars[i].swing);
    for (const b of t.bars) expect(b.swing).toBeGreaterThan(0);
  });
});
