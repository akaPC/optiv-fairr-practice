/**
 * Optiv Frontier AI Readiness & Resilience (FAIRR) practice financial model.
 *
 * A single pure function, computeModel(inputs), produces a 36-month P&L, cash
 * flow, headcount plan, capacity/backlog view, unit economics, customer lifetime
 * value, scenarios, and a tornado sensitivity. The web app and the CLI both
 * import this module; the Excel workbook mirrors the same monthly logic with
 * live formulas (see build-xlsx.ts).
 *
 * Conventions
 * - Month 1 is the practice launch month. Years are months 1-12, 13-24, 25-36.
 * - All money is USD. Rates are decimals (0.75 = 75%).
 * - "Advisor" means a billable Principal or Senior Advisor on the practice payroll.
 */

export const HORIZON_MONTHS = 36;

export interface ModelInputs {
  // People
  principalLoadedCost: number;
  seniorLoadedCost: number;
  startingAdvisors: number;
  billableHoursPerYear: number;
  utilMonths1to3: number;
  utilMonths4to6: number;
  utilMonths7to12: number;
  utilSteadyState: number;
  hireUtilThreshold: number;
  hireBacklogWeeks: number;
  maxAdvisors: number;
  hireLagMonths: number;
  hireCooldownMonths: number;
  newHireRampMonths: number;
  newHireRampUtil: number;
  practiceLeadAllocation: number;
  benchMaxHoursPerMonth: number;
  benchCostPerHour: number;
  benchStartMonth: number;
  benchTriggerBacklogWeeks: number;

  // Overhead
  salesOverheadPct: number;
  marketingYear1: number;
  marketingYear2: number;
  marketingYear3: number;
  trainingPerAdvisor: number;
  travelPct: number;
  toolingPerYear: number;
  insuranceLegalPerYear: number;

  // Pricing
  assessmentPrice: number;
  sprintPrice: number;
  retainerTier1Monthly: number;
  retainerTier2Monthly: number;
  retainerTier3Monthly: number;
  boardReadoutPrice: number;
  fcAddonMonthly: number;
  priceEscalator: number;
  flexShare: number;
  flexProgramMarginPct: number;
  blendedRate: number;

  // Delivery effort
  assessmentHours: number;
  sprintHours: number;
  retainerTier1Hours: number;
  retainerTier2Hours: number;
  retainerTier3Hours: number;
  boardReadoutHours: number;
  fcAddonAdvisorHours: number;
  fcAddonDeliveryCostPct: number;

  // Demand
  attachSprint: number;
  attachRetainer: number;
  tierMix1: number;
  tierMix2: number;
  tierMix3: number;
  boardAttach: number;
  renewalRate: number;
  assessmentsMonths1to3: number;
  assessmentsMonths4to6: number;
  assessmentsMonths7to12: number;
  assessmentGrowthPerYear: number;
  maxBacklogWeeks: number;
  fcAddonByMonth6: number;
  fcAddonByMonth12: number;
  fcAddonByMonth24: number;
  fcAddonByMonth36: number;
  salesCycleDays: number;
  paymentTermsDays: number;

  // Scenario levers
  cosellMultiplier: number;
  cosellStartMonth: number;
}

export const BASE_INPUTS: ModelInputs = {
  principalLoadedCost: 265_000,
  seniorLoadedCost: 215_000,
  startingAdvisors: 2,
  billableHoursPerYear: 1_880,
  utilMonths1to3: 0.35,
  utilMonths4to6: 0.55,
  utilMonths7to12: 0.7,
  utilSteadyState: 0.75,
  hireUtilThreshold: 0.75,
  hireBacklogWeeks: 8,
  maxAdvisors: 6,
  hireLagMonths: 2,
  hireCooldownMonths: 3,
  newHireRampMonths: 2,
  newHireRampUtil: 0.5,
  practiceLeadAllocation: 70_000,
  benchMaxHoursPerMonth: 240,
  benchCostPerHour: 165,
  benchStartMonth: 4,
  benchTriggerBacklogWeeks: 2,

  salesOverheadPct: 0.12,
  marketingYear1: 60_000,
  marketingYear2: 90_000,
  marketingYear3: 120_000,
  trainingPerAdvisor: 18_000,
  travelPct: 0.06,
  toolingPerYear: 36_000,
  insuranceLegalPerYear: 45_000,

  assessmentPrice: 85_000,
  sprintPrice: 140_000,
  retainerTier1Monthly: 22_000,
  retainerTier2Monthly: 38_000,
  retainerTier3Monthly: 65_000,
  boardReadoutPrice: 24_000,
  fcAddonMonthly: 9_500,
  priceEscalator: 0.04,
  flexShare: 0.6,
  flexProgramMarginPct: 0.1,
  blendedRate: 325,

  assessmentHours: 260,
  sprintHours: 430,
  retainerTier1Hours: 68,
  retainerTier2Hours: 117,
  retainerTier3Hours: 200,
  boardReadoutHours: 74,
  fcAddonAdvisorHours: 6,
  fcAddonDeliveryCostPct: 0.35,

  attachSprint: 0.65,
  attachRetainer: 0.55,
  tierMix1: 0.5,
  tierMix2: 0.35,
  tierMix3: 0.15,
  boardAttach: 0.4,
  renewalRate: 0.8,
  assessmentsMonths1to3: 1,
  assessmentsMonths4to6: 2,
  assessmentsMonths7to12: 3,
  assessmentGrowthPerYear: 0.25,
  maxBacklogWeeks: 12,
  fcAddonByMonth6: 3,
  fcAddonByMonth12: 12,
  fcAddonByMonth24: 30,
  fcAddonByMonth36: 50,
  salesCycleDays: 60,
  paymentTermsDays: 45,

  cosellMultiplier: 1,
  cosellStartMonth: 7,
};

export type OfferingKey = 'assessment' | 'sprint' | 'retainer' | 'board' | 'fcAddon';
export const OFFERING_KEYS: OfferingKey[] = ['assessment', 'sprint', 'retainer', 'board', 'fcAddon'];
export const OFFERING_LABELS: Record<OfferingKey, string> = {
  assessment: 'Readiness Assessment',
  sprint: 'Prioritization & Attack Narrative Sprint',
  retainer: 'Remediation Program Retainer',
  board: 'Board Readout & Insurance Attestation',
  fcAddon: 'Falcon Complete Continuous-Remediation Add-on',
};

export interface MonthRow {
  month: number;
  year: number;
  escalator: number;

  // Demand funnel (expected values, fractional)
  assessmentsDemand: number;
  assessmentsAccepted: number;
  assessmentsLost: number;
  sprintStarts: number;
  sprintCompletions: number;
  retainerStarts: number;
  renewalStarts: number;
  retainersActive: number;
  boardReadouts: number;
  fcCustomers: number;

  // Hours
  demandHours: Record<OfferingKey, number>;
  poolHours: Record<OfferingKey, number>;
  deliveredHours: Record<OfferingKey, number>;
  backlogHours: Record<OfferingKey, number>;
  advisorCapacityHours: number;
  advisorCapacityForProjects: number;
  benchHours: number;
  projectPoolHours: number;
  projectDeliveredHours: number;
  totalBacklogHours: number;
  backlogWeeks: number;
  fulfillment: number;
  utilization: number;

  // People
  advisors: number;
  principals: number;
  seniors: number;
  hireDecision: boolean;
  hireArrival: number;

  // P&L
  grossRevenue: Record<OfferingKey, number>;
  grossRevenueTotal: number;
  flexProgramMargin: number;
  netRevenue: number;
  advisorLabor: number;
  benchCost: number;
  fcDeliveryCost: number;
  directCost: number;
  grossMargin: number;
  grossMarginPct: number;
  salesOverhead: number;
  travel: number;
  contributionMargin: number;
  practiceLead: number;
  marketing: number;
  training: number;
  tooling: number;
  insuranceLegal: number;
  fixedOpex: number;
  ebitda: number;

  // Cash
  collections: number;
  cashOut: number;
  netCash: number;
  cumulativeCash: number;

  // Capacity economics
  revenueLeftOnTable: number;
}

export interface AnnualRow {
  year: number;
  grossRevenue: Record<OfferingKey, number>;
  grossRevenueTotal: number;
  flexProgramMargin: number;
  netRevenue: number;
  directCost: number;
  grossMargin: number;
  grossMarginPct: number;
  salesOverhead: number;
  travel: number;
  contributionMargin: number;
  fixedOpex: number;
  ebitda: number;
  ebitdaPct: number;
  endingAdvisors: number;
  averageUtilization: number;
  assessmentsAccepted: number;
  assessmentsLost: number;
  revenueLeftOnTable: number;
  netCash: number;
  endingCumulativeCash: number;
}

export interface UnitEconomics {
  key: OfferingKey;
  label: string;
  revenue: number;
  revenueBasis: 'per engagement' | 'per month';
  deliveryHours: number;
  deliveryCost: number;
  grossMargin: number;
  grossMarginPct: number;
  marginPerAdvisorHour: number;
  effectiveRate: number;
}

export interface Summary {
  revenueYear1: number;
  revenueYear2: number;
  revenueYear3: number;
  netRevenueYear1: number;
  netRevenueYear2: number;
  netRevenueYear3: number;
  ebitdaYear1: number;
  ebitdaYear2: number;
  ebitdaYear3: number;
  ebitdaPctYear3: number;
  grossMarginPctYear3: number;
  cashBreakEvenMonth: number | null;
  ebitdaPositiveMonth: number | null;
  peakFundingRequirement: number;
  peakFundingMonth: number;
  investmentAsk: number;
  endingAdvisors: number;
  hireMonths: number[];
  cumulativeCashMonth36: number;
  totalRevenueLeftOnTable: number;
  totalAssessmentsLost: number;
  backlogValueMonth36: number;
  clv36Gross: number;
  clv36Net: number;
  costPerBillableHour: number;
  capacityBoundMonths: number;
}

export interface ModelOutputs {
  inputs: ModelInputs;
  months: MonthRow[];
  annual: AnnualRow[];
  unitEconomics: UnitEconomics[];
  summary: Summary;
}

const emptyOffering = (): Record<OfferingKey, number> => ({
  assessment: 0,
  sprint: 0,
  retainer: 0,
  board: 0,
  fcAddon: 0,
});

const EPS = 1e-9;

export function yearOfMonth(month: number): number {
  return Math.ceil(month / 12);
}

/** Planned utilization for a founding advisor in the practice's n-th month (1-based). */
export function rampUtilization(inputs: ModelInputs, tenureMonth: number): number {
  if (tenureMonth <= 0) return 0;
  if (tenureMonth <= 3) return inputs.utilMonths1to3;
  if (tenureMonth <= 6) return inputs.utilMonths4to6;
  if (tenureMonth <= 12) return inputs.utilMonths7to12;
  return inputs.utilSteadyState;
}

/** Planned utilization for an advisor hired into an existing backlog, by tenure month (1-based). */
export function newHireUtilization(inputs: ModelInputs, tenureMonth: number): number {
  if (tenureMonth <= 0) return 0;
  if (tenureMonth <= inputs.newHireRampMonths) return Math.min(inputs.newHireRampUtil, inputs.utilSteadyState);
  return inputs.utilSteadyState;
}

/** Planned utilization for the advisor at index i (founders use the practice ramp, hires the new-hire ramp). */
export function advisorUtilization(inputs: ModelInputs, advisorIndex: number, startMonth: number, month: number): number {
  const tenure = month - startMonth + 1;
  return advisorIndex < inputs.startingAdvisors ? rampUtilization(inputs, tenure) : newHireUtilization(inputs, tenure);
}

/** Assessments the market would sign in a month, before capacity gating. */
export function assessmentDemand(inputs: ModelInputs, month: number): number {
  let base: number;
  if (month <= 3) base = inputs.assessmentsMonths1to3;
  else if (month <= 6) base = inputs.assessmentsMonths4to6;
  else if (month <= 12) base = inputs.assessmentsMonths7to12;
  else base = inputs.assessmentsMonths7to12 * Math.pow(1 + inputs.assessmentGrowthPerYear, yearOfMonth(month) - 1);
  const multiplier = month >= inputs.cosellStartMonth ? inputs.cosellMultiplier : 1;
  return base * multiplier;
}

/** Falcon Complete add-on customers active in a month (piecewise-linear ramp). */
export function fcAddonCustomers(inputs: ModelInputs, month: number): number {
  const pts: Array<[number, number]> = [
    [0, 0],
    [6, inputs.fcAddonByMonth6],
    [12, inputs.fcAddonByMonth12],
    [24, inputs.fcAddonByMonth24],
    [36, inputs.fcAddonByMonth36],
  ];
  for (let i = 1; i < pts.length; i++) {
    const [m0, c0] = pts[i - 1];
    const [m1, c1] = pts[i];
    if (month <= m1) return c0 + ((c1 - c0) * (month - m0)) / (m1 - m0);
  }
  return inputs.fcAddonByMonth36;
}

export function retainerBlendedMonthlyFee(inputs: ModelInputs): number {
  return (
    inputs.tierMix1 * inputs.retainerTier1Monthly +
    inputs.tierMix2 * inputs.retainerTier2Monthly +
    inputs.tierMix3 * inputs.retainerTier3Monthly
  );
}

export function retainerBlendedMonthlyHours(inputs: ModelInputs): number {
  return (
    inputs.tierMix1 * inputs.retainerTier1Hours +
    inputs.tierMix2 * inputs.retainerTier2Hours +
    inputs.tierMix3 * inputs.retainerTier3Hours
  );
}

/** Fully loaded cost of one advisor hour at steady-state utilization, weighted across the founding team. */
export function costPerBillableHour(inputs: ModelInputs): number {
  return inputs.principalLoadedCost / (inputs.billableHoursPerYear * inputs.utilSteadyState);
}

export function computeUnitEconomics(inputs: ModelInputs): UnitEconomics[] {
  const c = costPerBillableHour(inputs);
  const build = (
    key: OfferingKey,
    revenue: number,
    hours: number,
    basis: 'per engagement' | 'per month',
    extraCost = 0,
  ): UnitEconomics => {
    const deliveryCost = hours * c + extraCost;
    const gm = revenue - deliveryCost;
    return {
      key,
      label: OFFERING_LABELS[key],
      revenue,
      revenueBasis: basis,
      deliveryHours: hours,
      deliveryCost,
      grossMargin: gm,
      grossMarginPct: revenue > 0 ? gm / revenue : 0,
      marginPerAdvisorHour: hours > 0 ? gm / hours : 0,
      effectiveRate: hours > 0 ? revenue / hours : 0,
    };
  };
  return [
    build('assessment', inputs.assessmentPrice, inputs.assessmentHours, 'per engagement'),
    build('sprint', inputs.sprintPrice, inputs.sprintHours, 'per engagement'),
    build('retainer', retainerBlendedMonthlyFee(inputs), retainerBlendedMonthlyHours(inputs), 'per month'),
    build('board', inputs.boardReadoutPrice, inputs.boardReadoutHours, 'per engagement'),
    build(
      'fcAddon',
      inputs.fcAddonMonthly,
      inputs.fcAddonAdvisorHours,
      'per month',
      inputs.fcAddonMonthly * inputs.fcAddonDeliveryCostPct,
    ),
  ];
}

/**
 * Expected 36-month gross revenue from one assessment-originated account signed in month 1,
 * following the attach, tier-mix, renewal, and escalator assumptions.
 */
export function computeClv36(inputs: ModelInputs): { gross: number; net: number } {
  const esc = (m: number) => Math.pow(1 + inputs.priceEscalator, yearOfMonth(m) - 1);
  const pS = inputs.attachSprint;
  const pR = inputs.attachRetainer;
  const fee = retainerBlendedMonthlyFee(inputs);
  let gross = inputs.assessmentPrice * esc(1);
  // Sprint runs months 2-3 (4/6 then 2/6)
  gross += pS * inputs.sprintPrice * ((4 / 6) * esc(2) + (2 / 6) * esc(3));
  // Retainer starts month 4; renewals at month 16 and 28
  let survival = pS * pR;
  for (let start = 4; start <= HORIZON_MONTHS; start += 12) {
    for (let m = start; m < start + 12 && m <= HORIZON_MONTHS; m++) gross += survival * fee * esc(m);
    survival *= inputs.renewalRate;
  }
  // Board readouts: after sprint (month 4) and at each renewal
  gross += pS * inputs.boardAttach * inputs.boardReadoutPrice * esc(4);
  let renewalSurvival = pS * pR * inputs.renewalRate;
  for (let m = 16; m <= HORIZON_MONTHS; m += 12) {
    gross += renewalSurvival * inputs.boardAttach * inputs.boardReadoutPrice * esc(m);
    renewalSurvival *= inputs.renewalRate;
  }
  const net = gross * (1 - inputs.flexShare * inputs.flexProgramMarginPct);
  return { gross, net };
}

export function computeModel(inputs: ModelInputs): ModelOutputs {
  const H = inputs.billableHoursPerYear / 12;
  const weeksPerMonth = 52 / 12;
  const blendedFee = retainerBlendedMonthlyFee(inputs);
  const blendedHours = retainerBlendedMonthlyHours(inputs);
  const clv = computeClv36(inputs);

  // Rates used to convert delivered hours back into revenue (fee per hour of effort).
  const feePerHour: Record<OfferingKey, number> = {
    assessment: inputs.assessmentPrice / inputs.assessmentHours,
    sprint: inputs.sprintPrice / inputs.sprintHours,
    retainer: blendedHours > 0 ? blendedFee / blendedHours : 0,
    board: inputs.boardReadoutPrice / inputs.boardReadoutHours,
    fcAddon: 0, // add-on revenue is not hour-rated; see below
  };

  const months: MonthRow[] = [];
  const advisorStarts: number[] = []; // start month per advisor; index < startingAdvisors are principals
  for (let i = 0; i < inputs.startingAdvisors; i++) advisorStarts.push(1);
  const pendingArrivals: number[] = []; // months at which a hired advisor arrives
  const hireDecisionMonths: number[] = [];

  // Series needed for lagged lookups
  const accepted: number[] = [];
  const sprintStarts: number[] = [];
  const retainerStarts: number[] = [];
  const renewalStarts: number[] = [];
  const backlogByOffering: Record<OfferingKey, number> = emptyOffering();

  const at = (arr: number[], m: number) => (m >= 1 && m <= arr.length ? arr[m - 1] : 0);

  let cumulativeCash = 0;
  const netRevenueSeries: number[] = [];

  for (let m = 1; m <= HORIZON_MONTHS; m++) {
    const year = yearOfMonth(m);
    const escalator = Math.pow(1 + inputs.priceEscalator, year - 1);
    const prev = months[m - 2];
    const prevBacklogWeeks = prev ? prev.backlogWeeks : 0;

    // --- Headcount: arrivals and hiring decision (decision uses prior months only) ---
    const arrivalsThisMonth = pendingArrivals.filter((a) => a === m).length;
    for (let i = 0; i < arrivalsThisMonth; i++) advisorStarts.push(m);
    for (let i = pendingArrivals.length - 1; i >= 0; i--) if (pendingArrivals[i] === m) pendingArrivals.splice(i, 1);

    let hireDecision = false;
    if (m >= 4) {
      const trailing = months.slice(m - 4, m - 1).map((r) => r.utilization);
      const avgUtil = trailing.reduce((a, b) => a + b, 0) / trailing.length;
      const utilOk = avgUtil >= inputs.hireUtilThreshold - EPS;
      const backlogOk = prevBacklogWeeks > inputs.hireBacklogWeeks;
      const headroom = advisorStarts.length + pendingArrivals.length < inputs.maxAdvisors;
      const lastDecision = hireDecisionMonths.length ? hireDecisionMonths[hireDecisionMonths.length - 1] : -Infinity;
      const cooled = m - lastDecision > inputs.hireCooldownMonths;
      if (utilOk && backlogOk && headroom && cooled) {
        hireDecision = true;
        hireDecisionMonths.push(m);
        pendingArrivals.push(m + inputs.hireLagMonths);
      }
    }

    const advisors = advisorStarts.length;
    const principals = Math.min(advisors, inputs.startingAdvisors);
    const seniors = advisors - principals;
    const advisorCapacityHours = advisorStarts.reduce((sum, start, idx) => sum + H * advisorUtilization(inputs, idx, start, m), 0);

    // --- Demand funnel ---
    const demand = assessmentDemand(inputs, m);
    const acceptedNow = prevBacklogWeeks > inputs.maxBacklogWeeks ? 0 : demand;
    accepted.push(acceptedNow);
    const lost = demand - acceptedNow;

    const sprintStartNow = at(accepted, m - 1) * inputs.attachSprint;
    sprintStarts.push(sprintStartNow);
    const sprintCompletions = at(sprintStarts, m - 1);

    const retainerStartNow = at(sprintStarts, m - 2) * inputs.attachRetainer;
    retainerStarts.push(retainerStartNow);
    const renewalStartNow = (at(retainerStarts, m - 12) + at(renewalStarts, m - 12)) * inputs.renewalRate;
    renewalStarts.push(renewalStartNow);
    let retainersActive = 0;
    for (let k = m - 11; k <= m; k++) retainersActive += at(retainerStarts, k) + at(renewalStarts, k);

    const boardReadouts = at(sprintStarts, m - 2) * inputs.boardAttach + renewalStartNow * inputs.boardAttach;
    const fcCustomers = fcAddonCustomers(inputs, m);

    const demandHours: Record<OfferingKey, number> = {
      assessment: acceptedNow * inputs.assessmentHours,
      sprint: sprintStartNow * inputs.sprintHours * (4 / 6) + at(sprintStarts, m - 1) * inputs.sprintHours * (2 / 6),
      retainer: retainersActive * blendedHours,
      board: boardReadouts * inputs.boardReadoutHours,
      fcAddon: fcCustomers * inputs.fcAddonAdvisorHours,
    };

    // --- Capacity allocation ---
    // Add-on oversight hours are a first call on advisor capacity (contractual monthly commitment).
    const fcHoursDelivered = Math.min(demandHours.fcAddon, advisorCapacityHours);
    const advisorCapacityForProjects = Math.max(0, advisorCapacityHours - demandHours.fcAddon);

    const poolHours: Record<OfferingKey, number> = {
      assessment: backlogByOffering.assessment + demandHours.assessment,
      sprint: backlogByOffering.sprint + demandHours.sprint,
      retainer: backlogByOffering.retainer + demandHours.retainer,
      board: backlogByOffering.board + demandHours.board,
      fcAddon: demandHours.fcAddon,
    };
    const projectPoolHours = poolHours.assessment + poolHours.sprint + poolHours.retainer + poolHours.board;

    const benchEligible = m >= inputs.benchStartMonth && prevBacklogWeeks > inputs.benchTriggerBacklogWeeks;
    const benchHours = benchEligible
      ? Math.min(inputs.benchMaxHoursPerMonth, Math.max(0, projectPoolHours - advisorCapacityForProjects))
      : 0;

    const projectCapacity = advisorCapacityForProjects + benchHours;
    const fulfillment = projectPoolHours > EPS ? Math.min(1, projectCapacity / projectPoolHours) : 1;
    const projectDeliveredHours = projectPoolHours * fulfillment;

    const deliveredHours: Record<OfferingKey, number> = emptyOffering();
    const backlogHours: Record<OfferingKey, number> = emptyOffering();
    for (const key of ['assessment', 'sprint', 'retainer', 'board'] as OfferingKey[]) {
      deliveredHours[key] = poolHours[key] * fulfillment;
      backlogHours[key] = poolHours[key] - deliveredHours[key];
      backlogByOffering[key] = backlogHours[key];
    }
    deliveredHours.fcAddon = fcHoursDelivered;
    const totalBacklogHours = backlogHours.assessment + backlogHours.sprint + backlogHours.retainer + backlogHours.board;
    const weeklyCapacity = advisorCapacityHours / weeksPerMonth;
    const backlogWeeks = weeklyCapacity > EPS ? totalBacklogHours / weeklyCapacity : 0;

    const advisorDelivered = Math.min(projectDeliveredHours, advisorCapacityForProjects) + fcHoursDelivered;
    const utilization = advisors > 0 ? advisorDelivered / (advisors * H) : 0;

    // --- Revenue ---
    const grossRevenue: Record<OfferingKey, number> = {
      assessment: deliveredHours.assessment * feePerHour.assessment * escalator,
      sprint: deliveredHours.sprint * feePerHour.sprint * escalator,
      retainer: deliveredHours.retainer * feePerHour.retainer * escalator,
      board: deliveredHours.board * feePerHour.board * escalator,
      fcAddon: fcCustomers * inputs.fcAddonMonthly * escalator,
    };
    const grossRevenueTotal = OFFERING_KEYS.reduce((s, k) => s + grossRevenue[k], 0);
    const flexProgramMargin = grossRevenueTotal * inputs.flexShare * inputs.flexProgramMarginPct;
    const netRevenue = grossRevenueTotal - flexProgramMargin;
    netRevenueSeries.push(netRevenue);

    // --- Costs ---
    const advisorLabor = (principals * inputs.principalLoadedCost + seniors * inputs.seniorLoadedCost) / 12;
    const benchCost = benchHours * inputs.benchCostPerHour;
    const fcDeliveryCost = grossRevenue.fcAddon * inputs.fcAddonDeliveryCostPct;
    const directCost = advisorLabor + benchCost + fcDeliveryCost;
    const grossMargin = netRevenue - directCost;
    const grossMarginPct = netRevenue > EPS ? grossMargin / netRevenue : 0;

    const salesOverhead = netRevenue * inputs.salesOverheadPct;
    const travel = netRevenue * inputs.travelPct;
    const contributionMargin = grossMargin - salesOverhead - travel;

    const practiceLead = inputs.practiceLeadAllocation / 12;
    const marketing = (year === 1 ? inputs.marketingYear1 : year === 2 ? inputs.marketingYear2 : inputs.marketingYear3) / 12;
    const training = (advisors * inputs.trainingPerAdvisor) / 12;
    const tooling = inputs.toolingPerYear / 12;
    const insuranceLegal = inputs.insuranceLegalPerYear / 12;
    const fixedOpex = practiceLead + marketing + training + tooling + insuranceLegal;
    const ebitda = contributionMargin - fixedOpex;

    // --- Cash (net-45 on month-end invoices: half next month, half the month after) ---
    const lagMonths = inputs.paymentTermsDays / 30;
    const w2 = Math.max(0, Math.min(1, lagMonths - 1)); // share collected two months out
    const w1 = 1 - w2;
    const collections = at(netRevenueSeries, m - 1) * w1 + at(netRevenueSeries, m - 2) * w2;
    const cashOut = directCost + salesOverhead + travel + fixedOpex;
    const netCash = collections - cashOut;
    cumulativeCash += netCash;

    const revenueLeftOnTable = lost * clv.gross;

    months.push({
      month: m,
      year,
      escalator,
      assessmentsDemand: demand,
      assessmentsAccepted: acceptedNow,
      assessmentsLost: lost,
      sprintStarts: sprintStartNow,
      sprintCompletions,
      retainerStarts: retainerStartNow,
      renewalStarts: renewalStartNow,
      retainersActive,
      boardReadouts,
      fcCustomers,
      demandHours,
      poolHours,
      deliveredHours,
      backlogHours,
      advisorCapacityHours,
      advisorCapacityForProjects,
      benchHours,
      projectPoolHours,
      projectDeliveredHours,
      totalBacklogHours,
      backlogWeeks,
      fulfillment,
      utilization,
      advisors,
      principals,
      seniors,
      hireDecision,
      hireArrival: arrivalsThisMonth,
      grossRevenue,
      grossRevenueTotal,
      flexProgramMargin,
      netRevenue,
      advisorLabor,
      benchCost,
      fcDeliveryCost,
      directCost,
      grossMargin,
      grossMarginPct,
      salesOverhead,
      travel,
      contributionMargin,
      practiceLead,
      marketing,
      training,
      tooling,
      insuranceLegal,
      fixedOpex,
      ebitda,
      collections,
      cashOut,
      netCash,
      cumulativeCash,
      revenueLeftOnTable,
    });
  }

  // --- Annual rollups ---
  const annual: AnnualRow[] = [1, 2, 3].map((year) => {
    const rows = months.filter((r) => r.year === year);
    const sum = (f: (r: MonthRow) => number) => rows.reduce((s, r) => s + f(r), 0);
    const grossRevenue = emptyOffering();
    for (const k of OFFERING_KEYS) grossRevenue[k] = sum((r) => r.grossRevenue[k]);
    const netRevenue = sum((r) => r.netRevenue);
    const grossMargin = sum((r) => r.grossMargin);
    const ebitda = sum((r) => r.ebitda);
    return {
      year,
      grossRevenue,
      grossRevenueTotal: sum((r) => r.grossRevenueTotal),
      flexProgramMargin: sum((r) => r.flexProgramMargin),
      netRevenue,
      directCost: sum((r) => r.directCost),
      grossMargin,
      grossMarginPct: netRevenue > EPS ? grossMargin / netRevenue : 0,
      salesOverhead: sum((r) => r.salesOverhead),
      travel: sum((r) => r.travel),
      contributionMargin: sum((r) => r.contributionMargin),
      fixedOpex: sum((r) => r.fixedOpex),
      ebitda,
      ebitdaPct: netRevenue > EPS ? ebitda / netRevenue : 0,
      endingAdvisors: rows[rows.length - 1].advisors,
      averageUtilization: sum((r) => r.utilization) / rows.length,
      assessmentsAccepted: sum((r) => r.assessmentsAccepted),
      assessmentsLost: sum((r) => r.assessmentsLost),
      revenueLeftOnTable: sum((r) => r.revenueLeftOnTable),
      netCash: sum((r) => r.netCash),
      endingCumulativeCash: rows[rows.length - 1].cumulativeCash,
    };
  });

  // --- Summary ---
  let peak = 0;
  let peakMonth = 1;
  for (const r of months) {
    if (r.cumulativeCash < peak) {
      peak = r.cumulativeCash;
      peakMonth = r.month;
    }
  }
  const peakFundingRequirement = -peak;
  const investmentAsk = Math.ceil((peakFundingRequirement * 1.2) / 25_000) * 25_000;

  let cashBreakEvenMonth: number | null = null;
  for (const r of months) {
    if (r.month > peakMonth && r.cumulativeCash >= 0) {
      cashBreakEvenMonth = r.month;
      break;
    }
  }
  let ebitdaPositiveMonth: number | null = null;
  for (let i = 0; i < months.length; i++) {
    if (months.slice(i).every((r) => r.ebitda > 0)) {
      ebitdaPositiveMonth = months[i].month;
      break;
    }
  }

  const last = months[months.length - 1];
  const backlogValueMonth36 = OFFERING_KEYS.reduce(
    (s, k) => s + last.backlogHours[k] * feePerHour[k] * last.escalator,
    0,
  );

  const summary: Summary = {
    revenueYear1: annual[0].grossRevenueTotal,
    revenueYear2: annual[1].grossRevenueTotal,
    revenueYear3: annual[2].grossRevenueTotal,
    netRevenueYear1: annual[0].netRevenue,
    netRevenueYear2: annual[1].netRevenue,
    netRevenueYear3: annual[2].netRevenue,
    ebitdaYear1: annual[0].ebitda,
    ebitdaYear2: annual[1].ebitda,
    ebitdaYear3: annual[2].ebitda,
    ebitdaPctYear3: annual[2].ebitdaPct,
    grossMarginPctYear3: annual[2].grossMarginPct,
    cashBreakEvenMonth,
    ebitdaPositiveMonth,
    peakFundingRequirement,
    peakFundingMonth: peakMonth,
    investmentAsk,
    endingAdvisors: last.advisors,
    hireMonths: months.filter((r) => r.hireArrival > 0).flatMap((r) => Array(r.hireArrival).fill(r.month) as number[]),
    cumulativeCashMonth36: last.cumulativeCash,
    totalRevenueLeftOnTable: months.reduce((s, r) => s + r.revenueLeftOnTable, 0),
    totalAssessmentsLost: months.reduce((s, r) => s + r.assessmentsLost, 0),
    backlogValueMonth36,
    clv36Gross: clv.gross,
    clv36Net: clv.net,
    costPerBillableHour: costPerBillableHour(inputs),
    capacityBoundMonths: months.filter((r) => r.fulfillment < 1 - EPS).length,
  };

  return { inputs, months, annual, unitEconomics: computeUnitEconomics(inputs), summary };
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

export type ScenarioKey = 'base' | 'downside' | 'upside' | 'priceWar';

export interface ScenarioDefinition {
  key: ScenarioKey;
  label: string;
  description: string;
  apply: (base: ModelInputs) => ModelInputs;
}

export const SCENARIOS: ScenarioDefinition[] = [
  {
    key: 'base',
    label: 'Base',
    description: 'Default inputs as documented in model/ASSUMPTIONS.md.',
    apply: (b) => ({ ...b }),
  },
  {
    key: 'downside',
    label: 'Downside',
    description: 'Attach rates minus 15 points, utilization minus 10 points, one fewer assessment per month.',
    apply: (b) => ({
      ...b,
      attachSprint: Math.max(0, b.attachSprint - 0.15),
      attachRetainer: Math.max(0, b.attachRetainer - 0.15),
      boardAttach: Math.max(0, b.boardAttach - 0.15),
      utilMonths1to3: Math.max(0, b.utilMonths1to3 - 0.1),
      utilMonths4to6: Math.max(0, b.utilMonths4to6 - 0.1),
      utilMonths7to12: Math.max(0, b.utilMonths7to12 - 0.1),
      utilSteadyState: Math.max(0, b.utilSteadyState - 0.1),
      hireUtilThreshold: Math.max(0, b.hireUtilThreshold - 0.1),
      assessmentsMonths1to3: Math.max(0, b.assessmentsMonths1to3 - 1),
      assessmentsMonths4to6: Math.max(0, b.assessmentsMonths4to6 - 1),
      assessmentsMonths7to12: Math.max(0, b.assessmentsMonths7to12 - 1),
    }),
  },
  {
    key: 'upside',
    label: 'Upside',
    description:
      'QuiltWorks enrollment lands in Q1: CrowdStrike co-sell doubles assessment volume from month 7, and Falcon IQ partner tooling cuts assessment and sprint delivery effort by 15%.',
    apply: (b) => ({
      ...b,
      cosellMultiplier: 2,
      cosellStartMonth: 7,
      assessmentHours: b.assessmentHours * 0.85,
      sprintHours: b.sprintHours * 0.85,
    }),
  },
  {
    key: 'priceWar',
    label: 'GSI price war',
    description: 'All prices minus 20%.',
    apply: (b) => ({
      ...b,
      assessmentPrice: b.assessmentPrice * 0.8,
      sprintPrice: b.sprintPrice * 0.8,
      retainerTier1Monthly: b.retainerTier1Monthly * 0.8,
      retainerTier2Monthly: b.retainerTier2Monthly * 0.8,
      retainerTier3Monthly: b.retainerTier3Monthly * 0.8,
      boardReadoutPrice: b.boardReadoutPrice * 0.8,
      fcAddonMonthly: b.fcAddonMonthly * 0.8,
    }),
  },
];

export function computeScenarios(base: ModelInputs): Record<ScenarioKey, ModelOutputs> {
  const out = {} as Record<ScenarioKey, ModelOutputs>;
  for (const s of SCENARIOS) out[s.key] = computeModel(s.apply(base));
  return out;
}

// ---------------------------------------------------------------------------
// Tornado sensitivity on EBITDA Year 2
// ---------------------------------------------------------------------------

export interface TornadoCandidate {
  key: keyof ModelInputs;
  label: string;
  /** 'relative' flexes by +/-20% of the base value; 'points' flexes by +/-0.10 absolute. */
  mode: 'relative' | 'points';
  /** Optional sibling keys flexed together (e.g. the three retainer tiers). */
  group?: Array<keyof ModelInputs>;
}

export const TORNADO_CANDIDATES: TornadoCandidate[] = [
  { key: 'assessmentPrice', label: 'Assessment price', mode: 'relative' },
  { key: 'sprintPrice', label: 'Sprint price', mode: 'relative' },
  {
    key: 'retainerTier2Monthly',
    label: 'Retainer tier pricing (all tiers)',
    mode: 'relative',
    group: ['retainerTier1Monthly', 'retainerTier2Monthly', 'retainerTier3Monthly'],
  },
  { key: 'fcAddonMonthly', label: 'Falcon Complete add-on price', mode: 'relative' },
  { key: 'fcAddonByMonth24', label: 'Falcon Complete add-on customers by month 24', mode: 'relative' },
  { key: 'attachSprint', label: 'Assessment-to-Sprint attach', mode: 'points' },
  { key: 'attachRetainer', label: 'Sprint-to-Retainer attach', mode: 'points' },
  { key: 'renewalRate', label: 'Retainer renewal rate', mode: 'points' },
  { key: 'utilSteadyState', label: 'Steady-state utilization', mode: 'points' },
  { key: 'assessmentsMonths7to12', label: 'Assessments closed per month (months 7-12 base)', mode: 'relative' },
  { key: 'principalLoadedCost', label: 'Principal Advisor loaded cost', mode: 'relative' },
  { key: 'seniorLoadedCost', label: 'Senior Advisor loaded cost', mode: 'relative' },
  { key: 'salesOverheadPct', label: 'Sales/SE overhead % of revenue', mode: 'relative' },
  { key: 'flexProgramMarginPct', label: 'Falcon Flex program margin', mode: 'relative' },
  { key: 'benchMaxHoursPerMonth', label: 'Internal bench hours per month', mode: 'relative' },
  { key: 'maxAdvisors', label: 'Advisor headcount cap', mode: 'relative' },
  { key: 'fcAddonDeliveryCostPct', label: 'Add-on delivery cost share', mode: 'relative' },
  { key: 'hireBacklogWeeks', label: 'Hiring backlog trigger (weeks)', mode: 'relative' },
];

export interface TornadoBar {
  key: keyof ModelInputs;
  label: string;
  baseValue: number;
  lowValue: number;
  highValue: number;
  ebitdaLow: number;
  ebitdaHigh: number;
  swing: number;
}

export function computeTornado(base: ModelInputs, top = 10): { baseEbitdaYear2: number; bars: TornadoBar[] } {
  const baseOut = computeModel(base);
  const baseEbitda = baseOut.summary.ebitdaYear2;
  const bars: TornadoBar[] = TORNADO_CANDIDATES.map((c) => {
    const keys = c.group ?? [c.key];
    const baseValue = base[c.key];
    const flex = (dir: -1 | 1): ModelInputs => {
      const next = { ...base };
      for (const k of keys) {
        const v = base[k];
        let nv = c.mode === 'relative' ? v * (1 + 0.2 * dir) : v + 0.1 * dir;
        if (k === 'maxAdvisors') nv = Math.max(base.startingAdvisors, Math.round(nv));
        if (c.mode === 'points') nv = Math.min(1, Math.max(0, nv));
        next[k] = nv;
      }
      return next;
    };
    const lowInputs = flex(-1);
    const highInputs = flex(1);
    const ebitdaLow = computeModel(lowInputs).summary.ebitdaYear2;
    const ebitdaHigh = computeModel(highInputs).summary.ebitdaYear2;
    return {
      key: c.key,
      label: c.label,
      baseValue,
      lowValue: lowInputs[c.key],
      highValue: highInputs[c.key],
      ebitdaLow,
      ebitdaHigh,
      swing: Math.abs(ebitdaHigh - ebitdaLow),
    };
  });
  bars.sort((a, b) => b.swing - a.swing);
  return { baseEbitdaYear2: baseEbitda, bars: bars.slice(0, top) };
}

// ---------------------------------------------------------------------------
// Validation checks shared by the CLI, VALIDATION.md, and the Vitest suite
// ---------------------------------------------------------------------------

export interface CheckResult {
  name: string;
  passed: boolean;
  detail: string;
}

export function runChecks(out: ModelOutputs): CheckResult[] {
  const { months, inputs } = out;
  const H = inputs.billableHoursPerYear / 12;
  const results: CheckResult[] = [];

  const negGm = months.filter((r) => r.month > 6 && r.grossMargin < 0).map((r) => r.month);
  results.push({
    name: 'No negative gross margin after month 6',
    passed: negGm.length === 0,
    detail: negGm.length ? `Negative gross margin in months ${negGm.join(', ')}` : 'Gross margin positive in every month from month 7 onward',
  });

  const rampCeiling = Math.max(inputs.utilMonths1to3, inputs.utilMonths4to6, inputs.utilMonths7to12, inputs.utilSteadyState, inputs.newHireRampUtil);
  const overCapacity = months.filter(
    (r) =>
      r.projectDeliveredHours > r.advisorCapacityForProjects + r.benchHours + 1e-6 ||
      r.deliveredHours.fcAddon > r.advisorCapacityHours + 1e-6 ||
      r.utilization > rampCeiling + 1e-9,
  );
  results.push({
    name: 'Revenue never exceeds delivery capacity',
    passed: overCapacity.length === 0,
    detail: overCapacity.length
      ? `Delivered hours exceed capacity in months ${overCapacity.map((r) => r.month).join(', ')}`
      : `Delivered hours are within advisor plus bench capacity in all ${months.length} months; utilization never exceeds the ramp ceiling`,
  });

  const badHires: string[] = [];
  for (const r of months) {
    if (!r.hireDecision) continue;
    const trailing = months.slice(r.month - 4, r.month - 1);
    const avgUtil = trailing.reduce((s, t) => s + t.utilization, 0) / trailing.length;
    const prevBacklog = months[r.month - 2]?.backlogWeeks ?? 0;
    if (!(avgUtil >= inputs.hireUtilThreshold - 1e-9 && prevBacklog > inputs.hireBacklogWeeks)) {
      badHires.push(`month ${r.month} (util ${(avgUtil * 100).toFixed(1)}%, backlog ${prevBacklog.toFixed(1)} wks)`);
    }
  }
  const headcountOk = months.every((r) => r.advisors <= inputs.maxAdvisors);
  const decisions = months.filter((r) => r.hireDecision).map((r) => r.month);
  results.push({
    name: 'Hiring rule fires only when both conditions hold',
    passed: badHires.length === 0 && headcountOk,
    detail:
      badHires.length || !headcountOk
        ? `Rule violations: ${badHires.join('; ')}${headcountOk ? '' : '; headcount cap exceeded'}`
        : `${decisions.length} hire decision(s) in month(s) ${decisions.join(', ') || 'none'}, each with trailing utilization at or above ${(inputs.hireUtilThreshold * 100).toFixed(0)}% and backlog above ${inputs.hireBacklogWeeks} weeks; headcount never exceeds ${inputs.maxAdvisors}`,
  });

  const totalEbitda = months.reduce((s, r) => s + r.ebitda, 0);
  const totalNetCash = months.reduce((s, r) => s + r.netCash, 0);
  const totalRevenue = months.reduce((s, r) => s + r.netRevenue, 0);
  const totalCollections = months.reduce((s, r) => s + r.collections, 0);
  const receivables = totalRevenue - totalCollections;
  const diff = Math.abs(totalEbitda - receivables - totalNetCash);
  results.push({
    name: 'Cash flow reconciles to P&L less working-capital timing',
    passed: diff < 0.01,
    detail: `Cumulative EBITDA ${fmt(totalEbitda)} minus uncollected receivables ${fmt(receivables)} equals cumulative net cash ${fmt(totalNetCash)} (difference ${diff.toFixed(4)})`,
  });

  const mixSum = inputs.tierMix1 + inputs.tierMix2 + inputs.tierMix3;
  results.push({
    name: 'Retainer tier mix sums to 100%',
    passed: Math.abs(mixSum - 1) < 1e-9,
    detail: `Tier mix sums to ${(mixSum * 100).toFixed(1)}%`,
  });

  const revSumOk = months.every(
    (r) => Math.abs(OFFERING_KEYS.reduce((s, k) => s + r.grossRevenue[k], 0) - r.grossRevenueTotal) < 1e-6,
  );
  results.push({
    name: 'Revenue by offering sums to total revenue',
    passed: revSumOk,
    detail: revSumOk ? 'Offering revenue lines reconcile to total in every month' : 'Offering lines do not sum to total',
  });

  const utilCeiling = months.every((r) => r.utilization <= rampCeiling + 1e-9 && r.utilization * r.advisors * H <= r.advisorCapacityHours + 1e-6);
  results.push({
    name: 'Utilization never exceeds the planned ramp',
    passed: utilCeiling,
    detail: utilCeiling ? 'Realized utilization stays at or below each advisor\'s ramp ceiling' : 'Utilization exceeds ramp ceiling',
  });

  return results;
}

function fmt(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}
