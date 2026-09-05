import type { ModelInputs, OfferingKey } from '../../model/fairr-model';

/** Service catalog specifications. Prices and hours come from the model inputs at render time. */
export interface ServiceSpec {
  key: OfferingKey;
  code: string;
  name: string;
  tagline: string;
  scope: string[];
  deliverables: string[];
  staffing: string;
  duration: string;
  priceKey: keyof ModelInputs | Array<keyof ModelInputs>;
  hoursKey: keyof ModelInputs | Array<keyof ModelInputs>;
  priceBasis: string;
  flex: string;
  falconIqInputs: string[];
  attachNote?: string;
}

export const SERVICES: ServiceSpec[] = [
  {
    key: 'assessment',
    code: 'FAIRR-01',
    name: 'FAIRR Readiness Assessment',
    tagline: 'Where the customer stands, and whether it can fix what Falcon IQ will find.',
    scope: [
      'Expert review of the vulnerability management program, remediation capacity, identity and privilege posture, and cloud and application attack surface against the five frontier AI readiness requirements CrowdStrike published in April 2026.',
      'Operates Falcon IQ assessment agents against the customer\'s Falcon telemetry and OverWatch history.',
      'Establishes the baseline the Sprint and Retainer measure against.',
    ],
    deliverables: ['Readiness scorecard across the five requirements', 'Remediation capacity assessment (people, tooling, change velocity)', 'Validated exposure inventory from Falcon IQ', 'Executive briefing', 'Sprint recommendation and pricing'],
    staffing: 'Assessment lead 70%, remediation lead 30%',
    duration: '4 weeks',
    priceKey: 'assessmentPrice',
    hoursKey: 'assessmentHours',
    priceBasis: 'fixed fee',
    flex: 'Eligible',
    falconIqInputs: ['Assessment correlation (telemetry, threat intelligence, OverWatch)', 'Investment priorities'],
  },
  {
    key: 'sprint',
    code: 'FAIRR-02',
    name: 'FAIRR Prioritization & Attack Narrative Sprint',
    tagline: 'The ranked, evidenced, board-ready case for what to fix first.',
    scope: [
      'Validates Falcon IQ attack narratives against the customer\'s real environment, including targeted manual verification of the highest-impact paths with Optiv Threat Management and AppSec where needed.',
      'Designs the remediation program the Retainer will execute: workstreams, owners, sequencing, effort, controls to validate.',
      'Produces the 12-month roadmap with budget and the Retainer tier recommendation.',
    ],
    deliverables: ['Prioritized exposure register (exploitability, adversary activity, business impact)', 'Validated attack narratives with evidence', 'Remediation program design', '12-month roadmap with budget', 'Retainer tier recommendation'],
    staffing: 'Assessment lead 50%, remediation lead 50%',
    duration: '6 weeks',
    priceKey: 'sprintPrice',
    hoursKey: 'sprintHours',
    priceBasis: 'fixed fee',
    flex: 'Eligible',
    falconIqInputs: ['Attack narratives', 'Investment priorities', 'Remediation roadmap'],
    attachNote: 'attachSprint',
  },
  {
    key: 'retainer',
    code: 'FAIRR-03',
    name: 'FAIRR Remediation Program',
    tagline: 'Twelve months of accountable remediation inside the customer\'s engineering organization.',
    scope: [
      'Optiv advisors lead remediation workstreams: code-level fixes for validated findings, configuration and identity hardening, privilege reduction, cloud control implementation, control validation and re-test against Falcon IQ.',
      'Progress tracked in the co-branded Falcon IQ dashboard; monthly resilience report and quarterly executive review included.',
      'Tiered by validated findings in scope per quarter: Tier 1 up to 25, Tier 2 26 to 75, Tier 3 76 or more or multi-business-unit.',
    ],
    deliverables: ['Remediated and validated findings with evidence', 'Updated exposure register', 'Monthly resilience report', 'Quarterly executive review', 'Renewal recommendation'],
    staffing: 'Remediation lead with internal bench under FAIRR playbooks; assessment lead for re-validation',
    duration: '12-month term, renewable',
    priceKey: ['retainerTier1Monthly', 'retainerTier2Monthly', 'retainerTier3Monthly'],
    hoursKey: ['retainerTier1Hours', 'retainerTier2Hours', 'retainerTier3Hours'],
    priceBasis: 'per month',
    flex: 'Eligible; mirrors the 12-month renewable structure of CrowdStrike\'s own Frontier AI Readiness and Resilience Service',
    falconIqInputs: ['Remediation roadmap', 'Partner dashboard'],
    attachNote: 'attachRetainer',
  },
  {
    key: 'board',
    code: 'FAIRR-04',
    name: 'FAIRR Board Readout & Cyber Insurance Attestation',
    tagline: 'The two documents a board and an underwriter need.',
    scope: [
      'Board risk narrative: exposure, what was fixed, residual risk, what the next twelve months buy.',
      'Attestation package structured to the control and evidence expectations of the QuiltWorks insurance partners (Coalition, Marsh, Resilience, Lockton, Liberty Mutual).',
      'Optiv attests to work Optiv performed and validated; it does not underwrite.',
    ],
    deliverables: ['Board deck and narrative', 'Attestation package with control evidence index', '60-minute board or audit committee session', 'Broker-ready summary'],
    staffing: 'Assessment lead owns the narrative; remediation lead owns the control evidence',
    duration: '3 weeks; delivered after the Sprint and at each Retainer renewal',
    priceKey: 'boardReadoutPrice',
    hoursKey: 'boardReadoutHours',
    priceBasis: 'fixed fee add-on',
    flex: 'Eligible',
    falconIqInputs: ['Attack narratives', 'Partner dashboard progress record'],
    attachNote: 'boardAttach',
  },
  {
    key: 'fcAddon',
    code: 'FAIRR-05',
    name: 'FAIRR for Falcon Complete',
    tagline: 'Continuous remediation bundled into the MDR Optiv already operates. No GSI can offer it.',
    scope: [
      'Falcon IQ runs continuously against the customer\'s Falcon telemetry; validated findings flow into the Optiv operating rhythm that already handles the customer\'s detections.',
      'Falcon Complete and Threat Management teams execute routine remediation under FAIRR playbooks; a FAIRR advisor provides oversight, monthly prioritization, and escalation of program-level findings into a Sprint or Retainer.',
    ],
    deliverables: ['Continuous validated-finding queue in the co-branded dashboard', 'Monthly prioritized remediation summary', 'Quarterly resilience trend for the existing Optiv business review'],
    staffing: 'Falcon Complete and Threat Management analysts; FAIRR advisor oversight',
    duration: 'Month to month on the Falcon Complete contract',
    priceKey: 'fcAddonMonthly',
    hoursKey: 'fcAddonAdvisorHours',
    priceBasis: 'per month',
    flex: 'Eligible where the customer\'s Falcon Complete is on Flex; otherwise Optiv paper',
    falconIqInputs: ['Continuous assessment correlation', 'Remediation roadmap', 'Partner dashboard'],
  },
];

export interface Risk {
  id: number;
  risk: string;
  likelihood: 'Low' | 'Medium' | 'High';
  impact: 'Low' | 'Medium' | 'High';
  owner: string;
  mitigation: string;
  status: string;
}

export const RISKS: Risk[] = [
  { id: 1, risk: 'QuiltWorks enrollment timing: coalition inclusion is deferred or declined, slowing co-sell and denying the coalition brand', likelihood: 'Medium', impact: 'Medium', owner: 'Optiv VP Alliances', mitigation: 'Fallback delivery on Falcon IQ outputs through Elite status; the model does not depend on listing; re-application on a fixed date', status: 'Open; application due 30 Sep 2026' },
  { id: 2, risk: 'Channel conflict: CrowdStrike field prioritizes the named GSIs in accounts Optiv targets', likelihood: 'Medium', impact: 'High', owner: 'Partner Architect; CrowdStrike alliance manager', mitigation: 'Target list built jointly with CrowdStrike; lead with installed-base accounts where Optiv operates Falcon; Falcon Complete add-on as the differentiator; escalate through the alliance executive sponsor', status: 'Open' },
  { id: 3, risk: 'Falcon IQ product change: the 31 Aug 2026 release states unreleased features are "still in development and subject to change"', likelihood: 'High', impact: 'Medium', owner: 'Assessment lead', mitigation: 'Playbooks written against Falcon IQ outputs, not its interface; monthly product-change review; fallback reporting path; no modeled revenue depends on an unreleased feature', status: 'Open; standing monthly review' },
  { id: 4, risk: 'Utilization risk with a two-person team: demand arrives unevenly or a customer slips', likelihood: 'Medium', impact: 'Medium', owner: 'Practice lead', mitigation: 'EBITDA-positive early at ramp utilization; internal bench absorbs surge; Downside scenario still reaches cash break-even', status: 'Mitigated by design' },
  { id: 5, risk: 'Key-person dependency: loss of either advisor stalls delivery', likelihood: 'Medium', impact: 'High', owner: 'Practice lead', mitigation: 'Cross-training by month 6; playbooks by month 3; bench trained on delivery; retention terms tied to milestones; recruiting pipeline opened at month 12 regardless of trigger', status: 'Open' },
  { id: 6, risk: 'Pricing pressure from agentic automation: Falcon IQ makes assessment cheaper and GSIs or CrowdStrike discount', likelihood: 'Medium', impact: 'Medium', owner: 'Partner Architect', mitigation: 'Value anchored on remediation execution and attestation; the GSI price-war scenario stays EBITDA-positive; hours per offering reviewed quarterly as agents absorb work', status: 'Open' },
  { id: 7, risk: 'Liability exposure for remediation work: a change causes an outage, or a missed finding is later exploited', likelihood: 'Low', impact: 'High', owner: 'Optiv legal; remediation lead', mitigation: 'Change authority and customer sign-off in every SOW; Gate 3 evidence standard; attestation limited to work Optiv performed or validated; insurance and legal budget; professional liability review before the first Retainer', status: 'Open; legal review due month 2' },
  { id: 8, risk: 'Capacity constraint understates the plan\'s own opportunity: the practice declines most assessment demand', likelihood: 'High', impact: 'High', owner: 'Optiv practice leadership', mitigation: 'Month 12 decision on the headcount cap and hiring lag; Upside scenario quantifies what co-sell adds if capacity follows', status: 'Open; decision at month 12' },
  { id: 9, risk: 'Falcon Complete add-on economics unproven: the offering dominates Year 3 revenue and its price and delivery-cost share are the most sensitive inputs', likelihood: 'Medium', impact: 'High', owner: 'Falcon Complete practice lead; remediation lead', mitigation: 'Validate the delivery-cost transfer and oversight-hour assumptions with the first customers by month 6; reprice or re-scope before the month 12 ramp', status: 'Open; validation by month 6' },
  { id: 10, risk: 'Falcon Flex economics: CrowdStrike\'s actual program margin or incentive differs from the assumption', likelihood: 'High', impact: 'Medium', owner: 'Optiv VP Alliances', mitigation: 'Input is editable; obtain written Flex for Services partner terms before the first Flex-transacted deal', status: 'Open' },
];

export interface EnrollmentStep {
  step: string;
  owner: string;
  date: string;
  exit: string;
}

export const ENROLLMENT_STEPS: EnrollmentStep[] = [
  { step: 'Executive sponsor alignment: Optiv CRO office and CrowdStrike Global Alliances agree to pursue Optiv\'s inclusion as a QuiltWorks services partner', owner: 'Optiv VP Alliances; Partner Architect', date: '19 Sep 2026', exit: 'Written intent from both sides' },
  { step: 'Formal application through the CrowdStrike partner program with this plan, the catalogue, and the certification roster attached', owner: 'Partner Architect', date: '30 Sep 2026', exit: 'Application acknowledged' },
  { step: 'Falcon IQ partner onboarding and sandbox access; Optiv catalogue loaded', owner: 'Partner Architect; CrowdStrike partner enablement', date: '31 Oct 2026', exit: 'Optiv offerings visible in a sandbox dashboard' },
  { step: 'First co-branded Falcon IQ assessment delivered to an installed-base customer', owner: 'Assessment lead', date: '15 Dec 2026', exit: 'Customer-facing dashboard live in Optiv\'s brand' },
  { step: 'Coalition inclusion decision from CrowdStrike', owner: 'CrowdStrike Global Alliances', date: '31 Jan 2027', exit: 'Optiv listed on the QuiltWorks page, or written deferral with conditions' },
  { step: 'If deferred: fallback confirmed and re-application scheduled', owner: 'Optiv VP Alliances', date: '15 Feb 2027', exit: 'Fallback operating; re-application date set' },
];

export interface PipelineActivity {
  week: string;
  activity: string;
  owner: string;
  output: string;
}

export const PIPELINE_90: PipelineActivity[] = [
  { week: 'Wk 1–2 · 8–19 Sep', activity: 'Confirm the two Principal Advisors; finalize catalogue; brief Optiv CrowdStrike sales specialists and SEs', owner: 'Partner Architect', output: 'Enablement deck; catalogue v1' },
  { week: 'Wk 2 · 15–19 Sep', activity: 'Executive sponsor alignment on QuiltWorks enrollment', owner: 'VP Alliances', output: 'Written intent' },
  { week: 'Wk 3 · 22–26 Sep', activity: '40-account target list with the CrowdStrike alliance manager; identify 8 accounts with an active board or insurance trigger', owner: 'Partner Architect; alliance manager', output: 'Ranked list; 8 first-meeting requests' },
  { week: 'Wk 4 · 29 Sep–3 Oct', activity: 'Submit QuiltWorks application; open Falcon IQ sandbox request', owner: 'Partner Architect', output: 'Application filed' },
  { week: 'Wk 5–6 · 6–17 Oct', activity: 'First meetings at the 8 trigger accounts; offer a scoped Readiness Assessment', owner: 'Assessment lead; account managers', output: '8 meetings; 4 proposals' },
  { week: 'Wk 7–8 · 20–31 Oct', activity: 'Falcon IQ onboarding; catalogue loaded; internal playbooks v1', owner: 'Both advisors', output: 'Sandbox live' },
  { week: 'Wk 9 · 3–7 Nov', activity: 'Joint webinar with the CrowdStrike alliance team', owner: 'Marketing; alliance manager', output: '12 qualified installed-base leads' },
  { week: 'Wk 10–11 · 10–21 Nov', activity: 'Second wave of 12 first meetings; Falcon Complete add-on offered to 10 existing MDR customers at business reviews', owner: 'Assessment lead; Falcon Complete client managers', output: '6 proposals; 3 add-on commitments' },
  { week: 'Wk 12 · 24–28 Nov', activity: 'First Readiness Assessment signed and started', owner: 'Assessment lead', output: 'First engagement live' },
  { week: 'Wk 13 · 1–5 Dec', activity: '90-day review: pipeline coverage against month 4–6 demand, enrollment status, add-on count against the month 6 target', owner: 'Practice lead; finance', output: 'Go, adjust, or hold on the hiring plan' },
];

export interface RoadmapQuarter {
  quarter: string;
  months: [number, number];
  milestones: string[];
}

export const ROADMAP: RoadmapQuarter[] = [
  { quarter: 'Q4 2026', months: [1, 3], milestones: ['Practice launch with two Principal Advisors', 'QuiltWorks application filed', 'Falcon IQ onboarding and catalogue load', 'First Readiness Assessment', 'Playbooks v1'] },
  { quarter: 'Q1 2027', months: [4, 6], milestones: ['Coalition decision or fallback', 'Internal bench engaged', 'First Sprint and first Retainer', 'First Falcon Complete add-on customers', 'Legal review of attestation template'] },
  { quarter: 'Q2 2027', months: [7, 9], milestones: ['Peak funding month', 'First Board Readout', 'Fal.Con 2027 case study', 'Certification targets met'] },
  { quarter: 'Q3 2027', months: [10, 12], milestones: ['Year 1 close', 'Month 12 review of headcount cap and hiring lag', 'Add-on ramp milestone'] },
  { quarter: 'Q4 2027', months: [13, 15], milestones: ['Founders at steady-state utilization', 'Second-year pricing (escalator)', 'Hiring trigger arms'] },
  { quarter: 'Q1 2028', months: [16, 18], milestones: ['First hire decision and arrival', 'First Retainer renewals and renewal-cycle Board Readouts'] },
  { quarter: 'Q2 2028', months: [19, 21], milestones: ['Cumulative cash break-even', 'Mid-market packaging designed for Segment 3', 'QuiltWorks re-review with CrowdStrike'] },
  { quarter: 'Q3 2028', months: [22, 24], milestones: ['Year 2 close', 'Second hire decision', 'Add-on ramp milestone'] },
  { quarter: 'Q4 2028', months: [25, 27], milestones: ['Second Senior Advisor arrives', 'Segment 3 launch through Optiv mid-market coverage'] },
  { quarter: 'Q1 2029', months: [28, 30], milestones: ['Second renewal cycle', 'Third hire decision', 'Third-year pricing'] },
  { quarter: 'Q2 2029', months: [31, 33], milestones: ['Third Senior Advisor arrives'] },
  { quarter: 'Q3 2029', months: [34, 36], milestones: ['Year 3 close', 'Add-on ramp complete', 'Decision on the practice\'s next phase: cap lift, regional expansion, or fold into a broader AI risk practice'] },
];

export const FALCON_IQ_MAPPING = [
  { output: 'Attack narrative', contains: 'Agent-generated chain from an exploitable finding through reachable paths to business impact, correlated with adversary activity and OverWatch data', activity: 'Validation by a Principal Advisor against the real architecture and identity context; enrichment with business context; translation into a narrative a board and an insurer accept', offerings: ['sprint', 'board'] as OfferingKey[] },
  { output: 'Investment priority', contains: 'Ranked recommendation of Falcon platform tuning, additional modules, and partner services against the customer\'s exposure', activity: 'Independent advisory on sequencing and budget; control design; alignment with the customer\'s existing Optiv program; a funded 12-month roadmap', offerings: ['assessment', 'retainer'] as OfferingKey[] },
  { output: 'Remediation roadmap', contains: 'Playbooks mapping each finding to an action or to a service in the partner\'s loaded catalogue', activity: 'Program design; engineering execution (code, configuration, identity); change management; control validation and re-test', offerings: ['retainer', 'fcAddon'] as OfferingKey[] },
  { output: 'Co-branded partner dashboard', contains: 'Customer-facing view of findings, recommended actions, and progress in Optiv\'s brand', activity: 'Optiv-owned operating rhythm: weekly progress reviews, monthly resilience reporting, quarterly board and insurer attestation, renewal decisions', offerings: ['retainer', 'board'] as OfferingKey[] },
];
