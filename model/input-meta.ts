/**
 * Metadata for every model input: label, group, unit, formatting, and the basis
 * (source citation or the literal ASSUMPTION label). Used by the Excel builder,
 * ASSUMPTIONS.md generator, and the web app's input rail and assumption badges.
 */
import type { ModelInputs } from './fairr-model.ts';

export type InputGroup = 'People' | 'Overhead' | 'Pricing' | 'Delivery' | 'Demand' | 'Scenario';
export type InputFormat = 'money' | 'pct' | 'int' | 'num';

export interface InputMeta {
  label: string;
  group: InputGroup;
  unit: string;
  format: InputFormat;
  /** Either a citation to research/SOURCES.md or the word ASSUMPTION with context. */
  basis: string;
  assumption: boolean;
  min?: number;
  max?: number;
  step?: number;
  note?: string;
}

const A = (text: string) => `ASSUMPTION: ${text}`;

export const INPUT_META: Record<keyof ModelInputs, InputMeta> = {
  principalLoadedCost: { label: 'Principal Advisor fully loaded cost', group: 'People', unit: '$/yr', format: 'money', basis: 'Brief default; bounded by Glassdoor Principal Security Consultant total pay (~$262K) plus BLS 30.1% benefits load (sources 16A, 16D)', assumption: false, min: 150000, max: 400000, step: 5000 },
  seniorLoadedCost: { label: 'Senior Advisor fully loaded cost', group: 'People', unit: '$/yr', format: 'money', basis: 'Brief default; consistent with Glassdoor Principal Cyber Security Consultant average (~$233K) less bonus tier (source 16A)', assumption: false, min: 120000, max: 350000, step: 5000 },
  startingAdvisors: { label: 'Advisors at launch', group: 'People', unit: 'people', format: 'int', basis: 'Brief: two Principal Advisors on month 1', assumption: false, min: 1, max: 6, step: 1 },
  billableHoursPerYear: { label: 'Billable hours per advisor per year', group: 'People', unit: 'hours', format: 'int', basis: 'Brief default (1,880)', assumption: false, min: 1500, max: 2080, step: 10 },
  utilMonths1to3: { label: 'Utilization, months 1-3', group: 'People', unit: '%', format: 'pct', basis: 'Brief default', assumption: false, min: 0, max: 1, step: 0.05 },
  utilMonths4to6: { label: 'Utilization, months 4-6', group: 'People', unit: '%', format: 'pct', basis: 'Brief default', assumption: false, min: 0, max: 1, step: 0.05 },
  utilMonths7to12: { label: 'Utilization, months 7-12', group: 'People', unit: '%', format: 'pct', basis: 'Brief default', assumption: false, min: 0, max: 1, step: 0.05 },
  utilSteadyState: { label: 'Utilization, steady state', group: 'People', unit: '%', format: 'pct', basis: 'Brief default', assumption: false, min: 0, max: 1, step: 0.05 },
  hireUtilThreshold: { label: 'Hiring trigger: trailing 3-month utilization at or above', group: 'People', unit: '%', format: 'pct', basis: 'Brief default (75%); implemented as an inclusive threshold (DECISIONS #8)', assumption: false, min: 0, max: 1, step: 0.05 },
  hireBacklogWeeks: { label: 'Hiring trigger: backlog above', group: 'People', unit: 'weeks', format: 'num', basis: 'Brief default (8 weeks)', assumption: false, min: 0, max: 26, step: 1 },
  maxAdvisors: { label: 'Advisor headcount cap', group: 'People', unit: 'people', format: 'int', basis: 'Brief default (6 by end of Year 3)', assumption: false, min: 1, max: 8, step: 1 },
  hireLagMonths: { label: 'Recruiting lag from decision to start', group: 'People', unit: 'months', format: 'int', basis: A('2 months, typical time-to-fill for senior security consultants (DECISIONS #9)'), assumption: true, min: 1, max: 6, step: 1 },
  hireCooldownMonths: { label: 'Cooldown between hire decisions', group: 'People', unit: 'months', format: 'int', basis: A('3 months so one backlog spike does not trigger serial hires (DECISIONS #9)'), assumption: true, min: 0, max: 12, step: 1 },
  newHireRampMonths: { label: 'New-hire ramp length', group: 'People', unit: 'months', format: 'int', basis: A('Hires joining an existing backlog ramp in 2 months (DECISIONS #7)'), assumption: true, min: 0, max: 12, step: 1 },
  newHireRampUtil: { label: 'New-hire utilization during ramp', group: 'People', unit: '%', format: 'pct', basis: A('50% during the new-hire ramp (DECISIONS #7)'), assumption: true, min: 0, max: 1, step: 0.05 },
  practiceLeadAllocation: { label: 'Practice lead allocation (Partner Architect at 25%)', group: 'People', unit: '$/yr', format: 'money', basis: 'Brief default ($70,000)', assumption: false, min: 0, max: 200000, step: 5000 },
  benchMaxHoursPerMonth: { label: 'Internal bench capacity for surge', group: 'People', unit: 'hours/month', format: 'num', basis: A('240 hours/month from Optiv AppSec and Cyber Strategy bench (DECISIONS #11)'), assumption: true, min: 0, max: 1000, step: 20 },
  benchCostPerHour: { label: 'Internal bench transfer cost', group: 'People', unit: '$/hour', format: 'money', basis: A('$165/hour internal transfer rate (DECISIONS #11)'), assumption: true, min: 0, max: 400, step: 5 },
  benchStartMonth: { label: 'Bench available from month', group: 'People', unit: 'month', format: 'int', basis: A('Month 4, after playbooks exist for bench consultants to follow'), assumption: true, min: 1, max: 36, step: 1 },
  benchTriggerBacklogWeeks: { label: 'Bench engaged when backlog exceeds', group: 'People', unit: 'weeks', format: 'num', basis: A('2 weeks of backlog'), assumption: true, min: 0, max: 26, step: 1 },

  salesOverheadPct: { label: 'Sales/SE overhead allocation', group: 'Overhead', unit: '% of net revenue', format: 'pct', basis: 'Brief default (12%)', assumption: false, min: 0, max: 0.5, step: 0.01 },
  marketingYear1: { label: 'Marketing / MDF, Year 1', group: 'Overhead', unit: '$', format: 'money', basis: 'Brief default', assumption: false, min: 0, max: 500000, step: 5000 },
  marketingYear2: { label: 'Marketing / MDF, Year 2', group: 'Overhead', unit: '$', format: 'money', basis: 'Brief default', assumption: false, min: 0, max: 500000, step: 5000 },
  marketingYear3: { label: 'Marketing / MDF, Year 3', group: 'Overhead', unit: '$', format: 'money', basis: 'Brief default', assumption: false, min: 0, max: 500000, step: 5000 },
  trainingPerAdvisor: { label: 'Training and certification per advisor', group: 'Overhead', unit: '$/yr', format: 'money', basis: 'Brief default ($18,000)', assumption: false, min: 0, max: 60000, step: 1000 },
  travelPct: { label: 'Travel', group: 'Overhead', unit: '% of net revenue', format: 'pct', basis: 'Brief default (6%)', assumption: false, min: 0, max: 0.3, step: 0.01 },
  toolingPerYear: { label: 'Tooling, lab, Falcon IQ partner sandbox', group: 'Overhead', unit: '$/yr', format: 'money', basis: 'Brief default ($36,000); CrowdStrike has not published sandbox pricing', assumption: false, min: 0, max: 200000, step: 1000 },
  insuranceLegalPerYear: { label: 'Insurance / legal for remediation liability', group: 'Overhead', unit: '$/yr', format: 'money', basis: 'Brief default ($45,000)', assumption: false, min: 0, max: 200000, step: 1000 },

  assessmentPrice: { label: 'Readiness Assessment fixed fee', group: 'Pricing', unit: '$', format: 'money', basis: 'Brief default; sits inside the $40K-$120K red-team and $15K-$50K gap-assessment bands (source 15B) at a 4-week, principal-led scope', assumption: false, min: 20000, max: 250000, step: 5000 },
  sprintPrice: { label: 'Prioritization & Attack Narrative Sprint fixed fee', group: 'Pricing', unit: '$', format: 'money', basis: 'Brief default; 430 hours at ~$325/hr (source 15A upper band)', assumption: false, min: 40000, max: 400000, step: 5000 },
  retainerTier1Monthly: { label: 'Remediation Program retainer, Tier 1', group: 'Pricing', unit: '$/month', format: 'money', basis: 'Brief default; comparable to the $9K-$30K vCISO retainer band (source 15B) with engineering scope', assumption: false, min: 5000, max: 100000, step: 1000 },
  retainerTier2Monthly: { label: 'Remediation Program retainer, Tier 2', group: 'Pricing', unit: '$/month', format: 'money', basis: 'Brief default', assumption: false, min: 5000, max: 150000, step: 1000 },
  retainerTier3Monthly: { label: 'Remediation Program retainer, Tier 3', group: 'Pricing', unit: '$/month', format: 'money', basis: 'Brief default', assumption: false, min: 5000, max: 250000, step: 1000 },
  boardReadoutPrice: { label: 'Board Readout & Insurance Attestation fee', group: 'Pricing', unit: '$', format: 'money', basis: 'Brief default', assumption: false, min: 5000, max: 100000, step: 1000 },
  fcAddonMonthly: { label: 'Falcon Complete continuous-remediation add-on', group: 'Pricing', unit: '$/month', format: 'money', basis: 'Brief default', assumption: false, min: 1000, max: 50000, step: 500 },
  priceEscalator: { label: 'Annual price escalator', group: 'Pricing', unit: '%', format: 'pct', basis: 'Brief default (4%); applied to all billings by practice year (DECISIONS #13)', assumption: false, min: 0, max: 0.15, step: 0.01 },
  flexShare: { label: 'Share of deals transacted through Falcon Flex', group: 'Pricing', unit: '%', format: 'pct', basis: A('60% of deals transact through Flex; CrowdStrike has not published partner economics (source 14)'), assumption: true, min: 0, max: 1, step: 0.05 },
  flexProgramMarginPct: { label: 'Falcon Flex program margin retained by CrowdStrike', group: 'Pricing', unit: '% of Flex deal value', format: 'pct', basis: A('10% program margin on Flex-transacted value; set negative to model a net incentive to Optiv (DECISIONS #6)'), assumption: true, min: -0.3, max: 0.5, step: 0.01 },
  blendedRate: { label: 'Effective blended bill rate (reference)', group: 'Pricing', unit: '$/hour', format: 'money', basis: 'Brief default; bounded by $185-$325 general security and $200-$425 AppSec bands (sources 15A, 15B). Used to derive delivery hours, not revenue', assumption: false, min: 150, max: 600, step: 5 },

  assessmentHours: { label: 'Readiness Assessment delivery hours', group: 'Delivery', unit: 'hours', format: 'num', basis: A('Price / blended rate, rounded (DECISIONS #5)'), assumption: true, min: 40, max: 1000, step: 10 },
  sprintHours: { label: 'Prioritization Sprint delivery hours', group: 'Delivery', unit: 'hours', format: 'num', basis: A('Price / blended rate, rounded (DECISIONS #5)'), assumption: true, min: 80, max: 1500, step: 10 },
  retainerTier1Hours: { label: 'Retainer Tier 1 hours per month', group: 'Delivery', unit: 'hours/month', format: 'num', basis: A('Fee / blended rate, rounded'), assumption: true, min: 10, max: 400, step: 1 },
  retainerTier2Hours: { label: 'Retainer Tier 2 hours per month', group: 'Delivery', unit: 'hours/month', format: 'num', basis: A('Fee / blended rate, rounded'), assumption: true, min: 10, max: 600, step: 1 },
  retainerTier3Hours: { label: 'Retainer Tier 3 hours per month', group: 'Delivery', unit: 'hours/month', format: 'num', basis: A('Fee / blended rate, rounded'), assumption: true, min: 10, max: 800, step: 1 },
  boardReadoutHours: { label: 'Board Readout delivery hours', group: 'Delivery', unit: 'hours', format: 'num', basis: A('Price / blended rate, rounded'), assumption: true, min: 10, max: 300, step: 1 },
  fcAddonAdvisorHours: { label: 'FC add-on advisor oversight hours per customer-month', group: 'Delivery', unit: 'hours/month', format: 'num', basis: A('6 hours; the add-on is delivered mainly by the existing Falcon Complete team (DECISIONS #5)'), assumption: true, min: 0, max: 40, step: 1 },
  fcAddonDeliveryCostPct: { label: 'FC add-on delivery cost transfer to Falcon Complete team', group: 'Delivery', unit: '% of add-on revenue', format: 'pct', basis: A('35% internal transfer for analyst delivery (DECISIONS #5)'), assumption: true, min: 0, max: 0.9, step: 0.05 },

  attachSprint: { label: 'Attach: Assessment to Sprint', group: 'Demand', unit: '%', format: 'pct', basis: 'Brief default (65%)', assumption: false, min: 0, max: 1, step: 0.05 },
  attachRetainer: { label: 'Attach: Sprint to Retainer', group: 'Demand', unit: '%', format: 'pct', basis: 'Brief default (55%)', assumption: false, min: 0, max: 1, step: 0.05 },
  tierMix1: { label: 'Retainer tier mix: Tier 1', group: 'Demand', unit: '%', format: 'pct', basis: 'Brief default (50/35/15)', assumption: false, min: 0, max: 1, step: 0.05 },
  tierMix2: { label: 'Retainer tier mix: Tier 2', group: 'Demand', unit: '%', format: 'pct', basis: 'Brief default', assumption: false, min: 0, max: 1, step: 0.05 },
  tierMix3: { label: 'Retainer tier mix: Tier 3', group: 'Demand', unit: '%', format: 'pct', basis: 'Brief default', assumption: false, min: 0, max: 1, step: 0.05 },
  boardAttach: { label: 'Board readout attach', group: 'Demand', unit: '%', format: 'pct', basis: 'Brief default (40%); applied to sprint completions and renewals (DECISIONS #16)', assumption: false, min: 0, max: 1, step: 0.05 },
  renewalRate: { label: 'Retainer renewal rate', group: 'Demand', unit: '%', format: 'pct', basis: 'Brief default (80%)', assumption: false, min: 0, max: 1, step: 0.05 },
  assessmentsMonths1to3: { label: 'Assessments closed per month, months 1-3', group: 'Demand', unit: 'per month', format: 'num', basis: 'Brief default', assumption: false, min: 0, max: 10, step: 0.5 },
  assessmentsMonths4to6: { label: 'Assessments closed per month, months 4-6', group: 'Demand', unit: 'per month', format: 'num', basis: 'Brief default', assumption: false, min: 0, max: 10, step: 0.5 },
  assessmentsMonths7to12: { label: 'Assessments closed per month, months 7-12', group: 'Demand', unit: 'per month', format: 'num', basis: 'Brief default', assumption: false, min: 0, max: 10, step: 0.5 },
  assessmentGrowthPerYear: { label: 'Assessment demand growth per year (Years 2-3)', group: 'Demand', unit: '%', format: 'pct', basis: 'Brief default (25%)', assumption: false, min: 0, max: 1, step: 0.05 },
  maxBacklogWeeks: { label: 'Backlog at which new assessments are declined', group: 'Demand', unit: 'weeks', format: 'num', basis: A('12 weeks; customers will not wait longer to start (DECISIONS #10)'), assumption: true, min: 1, max: 52, step: 1 },
  fcAddonByMonth6: { label: 'FC add-on customers by month 6', group: 'Demand', unit: 'customers', format: 'num', basis: 'Brief default', assumption: false, min: 0, max: 100, step: 1 },
  fcAddonByMonth12: { label: 'FC add-on customers by month 12', group: 'Demand', unit: 'customers', format: 'num', basis: 'Brief default', assumption: false, min: 0, max: 200, step: 1 },
  fcAddonByMonth24: { label: 'FC add-on customers by month 24', group: 'Demand', unit: 'customers', format: 'num', basis: 'Brief default', assumption: false, min: 0, max: 300, step: 1 },
  fcAddonByMonth36: { label: 'FC add-on customers by month 36', group: 'Demand', unit: 'customers', format: 'num', basis: 'Brief default', assumption: false, min: 0, max: 500, step: 1 },
  salesCycleDays: { label: 'Sales cycle, first meeting to signature', group: 'Demand', unit: 'days', format: 'int', basis: 'Brief default (60 days); drives the pipeline plan, not the monthly P&L', assumption: false, min: 15, max: 365, step: 5 },
  paymentTermsDays: { label: 'Payment terms', group: 'Demand', unit: 'days', format: 'int', basis: 'Brief default (net 45); collections split across the following two months (DECISIONS #14)', assumption: false, min: 0, max: 120, step: 5 },

  cosellMultiplier: { label: 'CrowdStrike co-sell demand multiplier', group: 'Scenario', unit: 'x', format: 'num', basis: 'Scenario lever (1.0 in Base; 2.0 in Upside)', assumption: false, min: 0.5, max: 4, step: 0.1 },
  cosellStartMonth: { label: 'Co-sell multiplier starts in month', group: 'Scenario', unit: 'month', format: 'int', basis: 'Scenario lever (month 7 in Upside)', assumption: false, min: 1, max: 36, step: 1 },
};

export const INPUT_GROUPS: InputGroup[] = ['People', 'Overhead', 'Pricing', 'Delivery', 'Demand', 'Scenario'];
