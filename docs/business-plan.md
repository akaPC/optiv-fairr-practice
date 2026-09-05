# Optiv Frontier AI Readiness & Resilience (FAIRR) Practice

**Business plan and financial model for a new Optiv service line delivered on CrowdStrike Falcon IQ within the Project QuiltWorks framework**

Prepared by the Partner Architect, CrowdStrike partnership, Optiv. Version 1.0, September 2026. All financial figures are the base case of the model in `model/fairr-model.ts` unless labeled otherwise; inputs the public sources do not support are marked ASSUMPTION and are editable in `model/ASSUMPTIONS.md` and the planning app.

---

## 1. Executive Summary

**The ask.** Approve a two-person launch of the Optiv Frontier AI Readiness & Resilience (FAIRR) practice on 1 October 2026, funded with a $375,000 working-capital allocation, and authorize the Partner Architect to pursue formal Project QuiltWorks enrollment with CrowdStrike's alliances organization in parallel with launch. The $375,000 is the model's peak cumulative cash burn of $311,627 in month 7 plus a 20% contingency, rounded up to the nearest $25,000. It is not incremental headcount budget beyond the two Principal Advisors; the practice self-funds from month 4 on an EBITDA basis and returns to cumulative cash break-even in month 19.

**The opportunity.** On 23 April 2026 CrowdStrike launched Project QuiltWorks, a coalition to assess, prioritize, and remediate the wave of vulnerabilities that frontier AI models are now finding in production code. On 31 August 2026 at Fal.Con it launched Falcon IQ, an agentic engine of more than 50 agents that automates the assessment and prioritization stages of that work and maps every finding to a partner's service catalogue inside a co-branded dashboard. CrowdStrike's own framing is explicit: agents do the heavy lifting, partners scale delivery. The remediation work that Falcon IQ hands to partners is the product this practice sells. CrowdStrike is moving the whole motion onto Falcon Flex, whose ending ARR reached $2.29 billion in Q2 FY27, up 101% year over year, so the procurement rail already exists inside every one of Optiv's CrowdStrike accounts.

**Why Optiv, why now.** Optiv is the number-one seller of CrowdStrike products with more than $1 billion in joint sales, 5,500-plus joint opportunities, 25-plus CrowdStrike certifications, an 80-plus-analyst Threat Management team, and an operating Falcon Complete next-gen MDR, NG-SIEM, Identity Protection, Cloud Security, and Exposure Management practice. Optiv is not, today, a named QuiltWorks partner. Eleven global systems integrators are. The gap is not capability; it is a coalition roster that was assembled around Fortune-100 board relationships. This plan closes that gap in two ways at once: a formal enrollment path with named owners and dates, and a fallback that delivers the identical service on Falcon IQ outputs through Optiv's existing Elite partner status if coalition inclusion lags.

**The launch.** Two Principal Advisors start on month 1: one leads assessment and prioritization, the other leads remediation engineering. The practice sells five offerings that map one-to-one onto Falcon IQ's outputs: a 4-week Readiness Assessment ($85,000), a 6-week Prioritization & Attack Narrative Sprint ($140,000), a 12-month Remediation Program retainer in three tiers ($22,000, $38,000, and $65,000 per month), a Board Readout & Cyber Insurance Attestation package ($24,000), and a continuous-remediation add-on for Optiv's Falcon Complete base ($9,500 per month). Headcount scales only on demonstrated backlog: a third advisor is added when trailing three-month utilization reaches 75% and backlog exceeds eight weeks, which the model fires in months 16, 23, and 30, with advisors arriving in months 18, 25, and 32.

**The numbers (base case).**

| | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Gross revenue | $1,861,165 | $4,228,393 | $7,148,186 |
| Net revenue after Falcon Flex program margin | $1,749,495 | $3,974,689 | $6,719,295 |
| Gross margin | 37.9% | 48.8% | 51.1% |
| EBITDA | $101,686 | $938,591 | $1,872,342 |
| EBITDA margin (on net revenue) | 5.8% | 23.6% | 27.9% |
| Advisors at year end | 2 | 3 | 5 |

Cumulative cash bottoms at negative $311,627 in month 7, turns positive in month 19, and ends month 36 at $1,933,149. Monthly EBITDA is positive from month 4 onward. The Downside scenario still breaks even on cash in month 22 with a $525,000 ask; the GSI price-war scenario breaks even in month 28 with a $500,000 ask.

**The constraint that matters.** The demand assumptions CrowdStrike's coalition framing implies (three assessments a month by month 7, growing 25% a year, plus 50 Falcon Complete add-on customers by month 36) outrun a two-to-six-advisor practice by a wide margin. In the base case the practice accepts 15.5 assessments over 36 months and declines 112.8 because its backlog is already at or above the 12-week ceiling customers will tolerate. Valued at the modeled 36-month lifetime value of an assessment-originated account ($533,593), that is $60.2 million of expected demand left on the table. The financial return of this plan is therefore gated by delivery capacity, not by pipeline, and the single most consequential decision after approval is how quickly leadership is willing to lift the six-advisor cap once the hiring trigger fires.

**Decision requested.** Approve the launch, the $375,000 allocation, and the QuiltWorks enrollment path, with a scheduled review at month 6 (3 add-on customers, 6 signed assessments, enrollment application accepted or fallback active), month 12 ($1.86 million revenue, positive EBITDA, hiring trigger armed), and month 24 ($4.2 million revenue, four advisors, cumulative cash positive).

---

## 2. Market Trigger

### 2.1 Frontier AI collapses the discovery-to-exploit window

CrowdStrike's 2026 Global Threat Report, published 24 February 2026, documents an 89% year-over-year increase in attacks by AI-enabled adversaries, an average eCrime breakout time of 29 minutes (65% faster than 2024), a fastest observed breakout of 27 seconds, and a 42% increase in zero-day vulnerabilities exploited before public disclosure. The 2026 Threat Hunting Report, published 3 August 2026, adds the number that matters most for remediation planning: 88% of CrowdStrike-observed exploitation of vulnerabilities with a public proof-of-concept occurred within 48 hours of the proof-of-concept's release. In one documented case, CVE-2026-31431 was exploited roughly 20 hours after disclosure, and 94% of the first day's events were adversaries testing public exploit code.

The QuiltWorks program page states the consequence plainly: the window between vulnerability discovery and exploitation has collapsed from weeks to minutes, and in 2025 alone more than 48,000 CVEs were documented, a 20% year-over-year increase. CrowdStrike's April 2026 analysis, "Frontier AI Is Collapsing the Exploit Window," goes further, describing the gap between discovery and exploitation as "in some cases approaching real time," and reframes the defender's question from how many vulnerabilities exist to which ones can actually be used against the organization.

What is new is not the volume of findings. It is the discoverer. Frontier models from OpenAI and Anthropic, applied to an enterprise's own code, dependencies, and configuration, uncover logic bugs, design flaws, misconfigurations, and novel exploit paths that signature scanners and manual code review were never built to see. Those same model capabilities are available to adversaries. An organization that runs a frontier-model scan therefore learns, in one pass, both what it must fix and what an attacker with the same tooling already knows.

### 2.2 Boards are asking one question

George Kurtz framed the launch of QuiltWorks around it: "As frontier AI accelerates vulnerability discovery, every board in the world is asking their CISO the same question: are we exposed and are we protected?" Kroll's Dave Burg reported that over 90% of Kroll's clients say they are dealing with cyber incidents related to the use of AI. Cyber insurers have joined the coalition (Coalition, Liberty Mutual, Lockton, Resilience, and Marsh) precisely because the exposure question now feeds underwriting. When a board asks the question, it wants an answer it can defend to an insurer, a regulator, and an audit committee, which means the answer has to be produced by a named firm with a repeatable method, not by a dashboard alone.

### 2.3 Remediation capacity, not detection, is the bottleneck

Every public description of QuiltWorks places the constraint in the same place. The launch release describes the coalition's partner network of 10,000-plus certified professionals "driving remediation at the code level, inside the enterprise." Accenture's Harpreet Sidhu described the SI role as "the operational muscle to remediate code-level issues." SiliconANGLE's launch coverage and Security Boulevard's Falcon IQ coverage both identify manual remediation that cannot keep pace with AI-discovered findings as the problem the platform targets. CrowdStrike's own frontier-AI analysis contrasts the legacy "scan-triage-ticket-wait" loop with the required "scan-validate-remediate" loop.

Falcon IQ attacks the middle of that loop. Its agents validate and prioritize, correlate telemetry with threat intelligence and OverWatch findings, and generate playbooks. What they cannot do is stand up a remediation program inside a customer's engineering organization, refactor an authorization path, negotiate a maintenance window with a plant manager, prove to an insurer that a control now works, or tell a board what the residual risk means. That work is measured in senior consultant hours, and the 48-hour exploitation statistic means the customer needs it in weeks, not quarters.

That is the market. It is a capacity market, and the model in this plan behaves like one: demand exceeds supply in all 36 months of the base case, and the practice's financial outcome is determined by how much certified remediation capacity Optiv chooses to bring to it.

---

## 3. What CrowdStrike Ships vs. What Optiv Sells

### 3.1 Division of labor

Falcon IQ is a CrowdStrike product, sold by CrowdStrike, running on the Falcon platform on AWS. Per the 31 August 2026 release it:

- integrates the entire QuiltWorks assessment process inside the Falcon platform;
- correlates customer telemetry, CrowdStrike threat intelligence, and Falcon OverWatch findings automatically;
- runs more than 50 agents (NVIDIA Nemotron plus OpenAI and Anthropic frontier models, built on Falcon Foundry and Charlotte AI AgentWorks) to automate the most time-intensive workflows in assessment, prioritization, and remediation;
- lets partners load their services catalogue directly into the platform, after which agents produce actionable playbooks mapping findings to partner services: attack narratives, investment priorities, and remediation roadmaps;
- surfaces recommended actions from Falcon platform tuning and additional modules to services from the partner's own catalogue; and
- delivers findings through a co-branded, customer-facing dashboard in the partner's language, reflecting the partner's brand, tied to the partner's services, where customers track progress against their remediation plan in real time.

CrowdStrike's Amanda Adams, SVP Global Alliances, described the operating model on 2 September 2026: QuiltWorks partners "leverage our platform" and Falcon IQ "allows a partner to essentially drive an assessment and highlight the opportunities, the priorities." The partner drives. The platform accelerates.

Optiv therefore does not sell scanning, correlation, or prioritization as products; Falcon IQ does those and Optiv's advisors operate it. Optiv sells the human-led, accountable work that Falcon IQ explicitly maps its findings to: remediation program design, code- and configuration-level remediation, control validation, board-level risk narrative, and 12-month resilience management. The 31 August release's own disclaimer applies to Falcon IQ ("still in development and subject to change"), and Section 10 treats product change as a named risk.

### 3.2 Mapping Falcon IQ outputs to billable Optiv activity

| Falcon IQ output | What it contains | Billable Optiv activity | Offering |
|---|---|---|---|
| Attack narrative | Agent-generated chain from an exploitable finding through reachable paths to business impact, correlated with adversary activity and OverWatch data | Validation by a Principal Advisor (exploitability confirmed against the customer's real architecture and identity context), enrichment with business context the platform cannot see, translation into an executive narrative a board and an insurer will accept | Prioritization & Attack Narrative Sprint; Board Readout |
| Investment priority | Ranked recommendation of Falcon platform tuning, additional modules, and partner services against the customer's exposure | Independent advisory on sequencing and budget, control design for the recommended changes, alignment with the customer's existing Optiv program (Falcon Complete, NG-SIEM, Identity, Cloud, Exposure Management), a funded 12-month roadmap the CISO can defend | Readiness Assessment; Remediation Program |
| Remediation roadmap | Playbooks mapping each finding to an action or to a service in the partner's loaded catalogue | Program design, engineering execution (code fixes, configuration hardening, identity and privilege changes), change management with application owners, control validation, re-test against the platform's own findings | Remediation Program (tiered by finding volume); Falcon Complete add-on |
| Co-branded partner dashboard | Customer-facing view of findings, recommended actions, and progress in Optiv's brand | Optiv-owned operating rhythm: weekly progress reviews, monthly resilience reporting, quarterly board and insurer attestation, renewal decisions | Remediation Program; Board Readout & Insurance Attestation |

Two implications follow. First, Optiv's service catalogue must be loaded into Falcon IQ in exactly the shape of Section 4, so that the agents recommend Optiv's offerings by name inside the customer's dashboard. Second, every Optiv deliverable should reference the Falcon IQ artifact it validates or acts on, so the customer sees one continuous program rather than a vendor report followed by a consulting proposal.

---

## 4. Service Catalog

All prices are fixed fee in U.S. dollars, escalate 4% annually, and are eligible for Falcon Flex where the customer's Flex agreement covers partner services. The model assumes 60% of deals transact through Flex and that CrowdStrike retains a 10% program margin on Flex-transacted value (ASSUMPTION; CrowdStrike has not published partner economics for Flex for Services). Delivery hours are derived from the $325 per hour effective blended rate, which sits at the top of the $185 to $325 general security consulting band and inside the $200 to $425 AppSec and $250 to $450 vCISO bands published in the two 2026 rate guides cited in `research/SOURCES.md`. Unit economics use a fully loaded cost of $188 per billable advisor-hour ($265,000 loaded cost over 1,880 hours at 75% utilization).

### 4.1 FAIRR Readiness Assessment

- **Scope.** Expert review of the customer's vulnerability management program, remediation capacity, identity and privilege posture, and cloud and application attack surface against the five readiness requirements CrowdStrike published in April 2026 (exploitability over severity, continuous inside-out and outside-in validation, zero standing privileges, machine-speed detection and response, governed AI). Operates Falcon IQ's assessment agents against the customer's Falcon telemetry and OverWatch history. Establishes the baseline the rest of the program measures against.
- **Duration.** 4 weeks. Fixed fee: $85,000. Delivery effort: 260 hours, Principal Advisor (assessment lead) 70%, remediation lead 30%.
- **Deliverables.** Readiness scorecard across the five requirements; remediation capacity assessment (people, tooling, change velocity); validated exposure inventory from Falcon IQ; executive briefing; recommendation and pricing for the Sprint.
- **Falcon IQ inputs consumed.** Assessment correlation, investment priorities.
- **Unit economics.** Delivery cost $48,865; gross margin $36,135 (42.5%); $139 margin per advisor-hour.
- **Flex eligibility.** Yes.

### 4.2 FAIRR Prioritization & Attack Narrative Sprint

- **Scope.** Takes the validated exposure inventory and Falcon IQ's attack narratives and produces the ranked, evidenced, board-ready case for what to fix first. The assessment lead validates exploitability of the top narratives against the customer's real environment (including a targeted manual verification of the highest-impact paths, drawing on Optiv's Threat Management and AppSec practices where needed); the remediation lead designs the remediation program the Retainer will execute.
- **Duration.** 6 weeks. Fixed fee: $140,000. Delivery effort: 430 hours, split evenly between the two leads.
- **Deliverables.** Prioritized exposure register ranked by exploitability, adversary activity, and business impact; validated attack narratives with evidence; remediation program design (workstreams, owners, sequencing, effort, controls to validate); a 12-month roadmap with budget; Retainer tier recommendation.
- **Falcon IQ inputs consumed.** Attack narratives, investment priorities, remediation roadmap.
- **Unit economics.** Delivery cost $80,816; gross margin $59,184 (42.3%); $138 margin per advisor-hour.
- **Flex eligibility.** Yes.

### 4.3 FAIRR Remediation Program (12-month retainer, tiered)

- **Scope.** Execution of the program designed in the Sprint. Optiv advisors lead remediation workstreams inside the customer's engineering and infrastructure teams: code-level fixes for validated findings, configuration and identity hardening, privilege reduction, cloud control implementation, and control validation and re-test against Falcon IQ. Progress is tracked in the co-branded Falcon IQ dashboard. Monthly resilience report and quarterly executive review included.
- **Term and pricing.** 12 months, renewable. Tier 1 (up to 25 validated findings in scope per quarter): $22,000 per month, 68 hours. Tier 2 (26 to 75): $38,000 per month, 117 hours. Tier 3 (76 or more, or multi-business-unit): $65,000 per month, 200 hours. Modeled mix 50/35/15, blended $34,050 per month for 105 hours.
- **Deliverables.** Remediated and validated findings with evidence; updated exposure register; monthly resilience report; quarterly executive review; renewal recommendation.
- **Falcon IQ inputs consumed.** Remediation roadmap, partner dashboard.
- **Unit economics (blended).** Delivery cost $19,725 per month; gross margin $14,325 (42.1%); $136 margin per advisor-hour. Modeled renewal rate 80%.
- **Flex eligibility.** Yes; the 12-month renewable structure mirrors CrowdStrike's own Frontier AI Readiness and Resilience Service subscription.

### 4.4 FAIRR Board Readout & Cyber Insurance Attestation

- **Scope.** A fixed-fee add-on, delivered after the Sprint and again at each Retainer renewal, that converts the program's evidence into the two documents a board and an underwriter need: a board risk narrative (exposure, what was fixed, residual risk, what the next twelve months buy) and an attestation package structured to the control and evidence expectations of the QuiltWorks insurance partners (Coalition, Marsh, Resilience, Lockton, Liberty Mutual). Optiv attests to work Optiv performed and validated; it does not underwrite.
- **Duration.** 3 weeks. Fixed fee: $24,000. Delivery effort: 74 hours.
- **Deliverables.** Board deck and narrative; attestation package with control evidence index; 60-minute board or audit committee session; broker-ready summary.
- **Falcon IQ inputs consumed.** Attack narratives, partner dashboard progress record.
- **Unit economics.** Delivery cost $13,908; gross margin $10,092 (42.1%). Modeled attach 40% of Sprints and of renewals.
- **Flex eligibility.** Yes.

### 4.5 FAIRR for Falcon Complete customers (continuous-remediation add-on)

- **Scope.** A bundled monthly add-on for Optiv's existing Falcon Complete NG-MDR customers. Falcon IQ runs continuously against the customer's Falcon telemetry; validated findings flow into the same Optiv operating rhythm that already handles the customer's detections. The Falcon Complete and Threat Management teams execute routine remediation actions under FAIRR playbooks; a FAIRR advisor provides oversight, monthly prioritization, and escalation of findings that need program-level remediation (which converts into a Sprint or Retainer).
- **Term and pricing.** Month to month on the Falcon Complete contract, $9,500 per month. Modeled ramp: 3 customers by month 6, 12 by month 12, 30 by month 24, 50 by month 36.
- **Delivery.** 6 FAIRR advisor hours per customer-month (ASSUMPTION), with 35% of add-on revenue transferred to the Falcon Complete and Threat Management teams for analyst delivery (ASSUMPTION).
- **Deliverables.** Continuous validated-finding queue in the co-branded dashboard; monthly prioritized remediation summary; quarterly resilience trend for the customer's existing Optiv business review.
- **Unit economics.** Delivery cost $4,453 per month; gross margin $5,047 (53.1%).
- **Flex eligibility.** Yes, where the customer's Falcon Complete is on Flex; otherwise on Optiv paper.

This is the offering no GSI can replicate, because no GSI operates the customer's Falcon Complete. It is also the practice's volume engine: in Year 3 it contributes $5.03 million of $7.15 million gross revenue, and the tornado analysis in Section 12 ranks its price and its delivery-cost share as the two inputs with the largest effect on Year 2 EBITDA. Those two assumptions deserve the earliest validation with the Falcon Complete practice leadership.

---

## 5. Ideal Customer Profile & Segmentation

### 5.1 Profile

The ideal FAIRR customer runs the Falcon platform, has an engineering organization that ships its own software or operates a meaningful cloud estate, has a board or audit committee that has asked the exposure question, and carries or is renewing a cyber insurance policy. It has a CISO who wants a named partner accountable for fixing what the platform finds, not a report. Mid-enterprise (roughly $500 million to $10 billion revenue) is the sweet spot: large enough to fund a $140,000 Sprint and a $38,000-per-month retainer, small enough that a Fortune-100 GSI program is oversized and overpriced.

### 5.2 Segments, in order of attack

**Segment 1: Existing Optiv CrowdStrike customers (installed-base motion).** Optiv holds the paper, the relationship, and often the operating role on the customer's Falcon deployment. This is the launch segment and the source of the first assessments. Public data supports the size of the pool (Optiv reports more than $1 billion in joint CrowdStrike sales and 5,500-plus joint opportunities); the precise count of accounts where Optiv both sells and operates Falcon is internal and is treated here as an ASSUMPTION. The model's demand schedule (one assessment a month in months 1 to 3, two in months 4 to 6, three in months 7 to 12) and the Falcon Complete add-on ramp are both installed-base numbers. Sizing signal: the add-on alone reaches an annualized $5.7 million run rate at 50 customers, before escalation, without a single net-new logo.

**Segment 2: Net-new via CrowdStrike co-sell.** CrowdStrike's field is being compensated to drive platform adoption through QuiltWorks and Falcon IQ; Security Boulevard reports $400 million of pipeline attributed to the QuiltWorks ecosystem by August 2026. Once Optiv's catalogue is loaded into Falcon IQ, the platform itself recommends Optiv services inside the dashboard of any customer whose assessment Optiv drives. The Upside scenario models co-sell doubling assessment demand from month 7. It raises Year 1 revenue to $2.04 million and pulls cash break-even forward to month 15, but the practice still declines 226 assessments over 36 months because capacity, not demand, binds. Co-sell is therefore a reason to raise the headcount cap, not a reason to expect more revenue from the same team.

**Segment 3: Mid-market via Optiv's channel and CrowdStrike's SMB coalition.** CrowdStrike extended QuiltWorks to SMBs on 13 August 2026 through Arrow, Pax8, TD SYNNEX, Westcon-Comstor, Ignition, Nord Security, and Zip Security. Optiv's fit here is the Falcon Complete add-on and a packaged Readiness Assessment at Tier 1 scope, sold through Optiv's own mid-market coverage and, selectively, alongside distributors where Optiv already transacts. This segment is not in the base-case demand numbers; it is the Year 3 expansion lever once the practice has playbooks that bench consultants can run.

### 5.3 Anti-profile

Organizations with no first-party code and no cloud estate (a QuiltWorks assessment will find little to remediate), organizations already inside an Accenture, EY, IBM, or KPMG QuiltWorks program (Section 6), and organizations that want remediation outsourced without giving Optiv change authority (the liability exposure in Section 10 is unacceptable without it).

---

## 6. Competitive Positioning

### 6.1 The named coalition

The QuiltWorks program page lists twelve global systems integrators: Accenture, EY, IBM, Kroll, Cognizant, HCLTech, Infosys, KPMG, NTT DATA, Tata Consultancy Services, Wipro, and Armadin. Optiv will compete with them in every account where the customer's board has heard of QuiltWorks, and will co-exist with them in accounts where a GSI holds the transformation program but Optiv runs the security operation.

### 6.2 Where the GSIs win

Honesty here is a selling tool. Accenture, EY, IBM, and KPMG win when the buyer is a Fortune-100 board that already retains them, when the remediation program spans dozens of countries and thousands of developers, when the engagement is bundled into a broader transformation or audit relationship, and when the customer wants the coalition brand on the cover page. Kroll wins when the engagement starts as an incident. The Indian-headquartered integrators win on price for large, long-duration code-remediation factories. Optiv should not chase any of those deals as prime.

### 6.3 Where Optiv wins

- **Speed to start.** Two Principal Advisors who already hold CrowdStrike certifications and already know the customer's Falcon deployment can start a Readiness Assessment within the 60-day sales cycle. A GSI program has a 90-to-180-day mobilization.
- **CrowdStrike-native depth.** Optiv is the number-one seller of CrowdStrike, with 10-plus years of partnership, 25-plus certifications, and a Threat Management team that lives in the Falcon console. Falcon IQ's outputs (platform tuning, module recommendations, OverWatch-correlated narratives) are Optiv's native language.
- **Installed-base intimacy.** The customer's Falcon Complete detections, NG-SIEM data, identity posture, and cloud configuration are already in Optiv's operating view. The assessment starts from evidence, not discovery.
- **Mid-enterprise price point.** A $85,000 assessment and a $22,000-to-$65,000-per-month retainer are sized for the mid-enterprise CISO's budget authority. The model's unit economics hold at a 42% gross margin at those prices; the GSI price-war scenario (all prices minus 20%) still produces $467,249 of Year 2 EBITDA.
- **A Falcon Complete bundle no GSI can offer.** Continuous remediation on top of the customer's existing Optiv-operated MDR is structurally unavailable to any integrator that does not run Falcon Complete for that customer.

### 6.4 Positioning statement

For CrowdStrike customers whose boards are asking whether they are exposed to frontier-AI-discovered vulnerabilities, Optiv FAIRR is the remediation partner that starts in weeks, works inside the Falcon platform the customer already runs, and is accountable for fixing what Falcon IQ finds. Unlike the global integrators in the QuiltWorks coalition, Optiv brings the customer's own security operation to the program, at a mid-enterprise price, with a continuous-remediation bundle only the customer's Falcon Complete operator can deliver.

---

## 7. Go-to-Market

### 7.1 CrowdStrike co-sell mechanics

CrowdStrike sells Falcon IQ and the platform modules the assessment recommends; Optiv sells the services the assessment maps to. The co-sell motion has four moving parts: (1) Optiv's catalogue loaded into Falcon IQ so recommendations name Optiv offerings; (2) joint account planning with the CrowdStrike regional alliance and account teams for the installed-base target list; (3) the co-branded dashboard as the shared artifact both field teams review with the customer; and (4) CrowdStrike's partner program incentives for services attached to platform expansion, which the model does not count as revenue because CrowdStrike has not published them (ASSUMPTION, held at zero).

### 7.2 Falcon Flex packaging

Every FAIRR offering is packaged as a Flex-consumable SKU where the customer's Flex agreement covers partner services, in line with Flex for Services (launched 24 March 2026), which explicitly lists readiness assessments and AI advisory and explicitly names system integrators as participants. CrowdStrike's own Frontier AI Readiness and Resilience Service is a 12-month renewable subscription purchasable with Flex dollars; Optiv's Remediation Program mirrors that structure so the customer's procurement sees one pattern. The model's 60% Flex share and 10% program margin are both ASSUMPTION inputs; the alliance team's first commercial task is to replace them with CrowdStrike's actual terms.

### 7.3 Alliance MDF and launch marketing

Marketing and MDF spend is $60,000 in Year 1, $90,000 in Year 2, and $120,000 in Year 3. Year 1 allocation: a launch brief and offering one-pagers in Optiv's voice (September); a joint webinar with the CrowdStrike alliance team on "what Falcon IQ finds and what it takes to fix it" (November); two executive roundtables for installed-base CISOs, one east and one west (December and February); a Fal.Con 2027 presence with a co-branded case study from the first Sprint; and a quarterly board-readiness briefing series aligned to the insurance partners' renewal calendar. MDF requests go through the CrowdStrike alliance manager against the co-sell target list.

### 7.4 Joint account planning

The Partner Architect and the CrowdStrike alliance manager build a 40-account installed-base target list by 30 September 2026, ranked by first-party code footprint, cloud estate, insurance renewal date, and board activity. Each account gets an Optiv owner, a CrowdStrike owner, a target first-meeting date, and a Falcon IQ assessment readiness check. The list is reviewed every two weeks through month 6 and monthly thereafter.

### 7.5 QuiltWorks enrollment path (gating milestone)

Optiv is not a named QuiltWorks partner, and the program page offers no published enrollment criteria beyond a "Partner with us" call to action. Enrollment is therefore a milestone with owners and dates, not an assumption in the model.

| Step | Owner | Date | Exit criterion |
|---|---|---|---|
| Executive sponsor alignment: Optiv CRO office and CrowdStrike Global Alliances (Amanda Adams's organization) agree to pursue Optiv's inclusion as a QuiltWorks services partner | Optiv VP Alliances; Partner Architect | 19 September 2026 | Written intent from both sides |
| Formal application submitted through the CrowdStrike partner program, with this plan, the service catalogue, and certification roster attached | Partner Architect | 30 September 2026 | Application acknowledged |
| Falcon IQ partner onboarding and sandbox access; Optiv catalogue loaded | Partner Architect; CrowdStrike partner enablement | 31 October 2026 | Optiv offerings visible in a sandbox dashboard |
| First co-branded Falcon IQ assessment delivered to an installed-base customer | Principal Advisor (assessment lead) | 15 December 2026 | Customer-facing dashboard live in Optiv's brand |
| Coalition inclusion decision from CrowdStrike | CrowdStrike Global Alliances | 31 January 2027 | Optiv listed on the QuiltWorks program page, or written deferral with conditions |
| If deferred: fallback confirmed and re-application scheduled | Optiv VP Alliances | 15 February 2027 | Fallback operating; re-application date set |

**Fallback.** If coalition inclusion lags, Optiv delivers the identical five offerings on Falcon IQ outputs through its existing Elite partner status: Optiv's advisors operate Falcon IQ in customer tenants where Optiv already holds administrative access as the Falcon Complete or platform operator, consume the same attack narratives, priorities, and roadmaps, and deliver through Optiv's own reporting rather than the coalition's co-branded dashboard. The economics in the model do not depend on coalition listing; the Upside scenario is the only case that assumes it. What the listing changes is co-sell velocity and the coalition brand on the proposal cover, which is why it remains the first commercial priority.

### 7.6 90-day pipeline plan

Sales cycle is modeled at 60 days from first meeting to signature, so the first month's assessment must come from a customer already in conversation. Named activities:

| Week | Activity | Owner | Output |
|---|---|---|---|
| 1 to 2 (8 to 19 September) | Confirm the two Principal Advisors; finalize catalogue; brief the Optiv CrowdStrike sales specialists and SEs | Partner Architect | Enablement deck; catalogue v1 |
| 2 (15 to 19 September) | Executive sponsor alignment on QuiltWorks enrollment (Section 7.5) | VP Alliances | Written intent |
| 3 (22 to 26 September) | 40-account target list with CrowdStrike alliance manager; identify 8 accounts with an active board or insurance trigger | Partner Architect; alliance manager | Ranked list; 8 first-meeting requests sent |
| 4 (29 September to 3 October) | Submit QuiltWorks application; open Falcon IQ sandbox request | Partner Architect | Application filed |
| 5 to 6 (6 to 17 October) | First meetings at the 8 trigger accounts; offer a scoped Readiness Assessment | Assessment lead; account managers | 8 meetings; 4 proposals |
| 7 to 8 (20 to 31 October) | Falcon IQ onboarding; catalogue loaded; internal playbooks v1 complete | Both advisors | Sandbox live |
| 9 (3 to 7 November) | Joint webinar with CrowdStrike alliance team | Marketing; alliance manager | 12 qualified installed-base leads |
| 10 to 11 (10 to 21 November) | Second wave of 12 first meetings; Falcon Complete add-on offered to 10 existing MDR customers at their business reviews | Assessment lead; Falcon Complete client managers | 6 proposals; 3 add-on commitments |
| 12 (24 to 28 November) | First Readiness Assessment signed and started (model month 1 at 1 assessment per month is met if one of the first four proposals closes inside 60 days) | Assessment lead | First engagement live |
| 13 (1 to 5 December) | 90-day review: pipeline coverage against the month 4 to 6 demand of two assessments per month, enrollment status, add-on count against the month 6 target of three | Practice lead; finance | Go, adjust, or hold on the hiring plan |

---

## 8. Delivery Model & Operating Rhythm

### 8.1 The two Principal Advisors

**Advisor 1, assessment and prioritization lead.** Owns the Readiness Assessment and the Sprint. Profile: senior security architect or offensive-security lead with CrowdStrike Falcon administration and threat-hunting credentials, comfortable in front of a CISO and an audit committee, able to validate an agent-generated attack narrative against a real environment and say which half of it is wrong. Owns Optiv's Falcon IQ tenant configuration and the catalogue. Fully loaded cost $265,000.

**Advisor 2, remediation and engineering lead.** Owns the Remediation Program and the Falcon Complete add-on's escalation path. Profile: application security or cloud security engineer with hands-on remediation history (code, identity, configuration), experienced in running remediation inside someone else's engineering organization, able to write the playbooks the bench and the Falcon Complete team will follow. Fully loaded cost $265,000.

Both share the Board Readout, with Advisor 1 owning the narrative and Advisor 2 owning the control evidence. The Partner Architect allocates 25% of time ($70,000 per year charged to the practice) to alliance management, QuiltWorks enrollment, catalogue governance, and quality gates.

### 8.2 How the advisors use the Falcon IQ partner dashboard

Every engagement lives in the customer's co-branded dashboard from day one of the assessment. The dashboard is the single record of findings, recommended actions, and progress that the customer, the CrowdStrike account team, and Optiv all see. Optiv's deliverables cite dashboard artifacts by identifier. Weekly, the responsible advisor reviews new agent findings, marks validated and rejected narratives, and updates remediation status; monthly, the resilience report is generated from the dashboard's progress record; quarterly, the executive review and (where sold) the attestation package are built from the same record. When Falcon IQ's agents recommend an Optiv service, the advisor either scopes it or records why not, so the recommendation history is auditable. Under the fallback (Section 7.5), the same rhythm runs against Falcon IQ outputs exported into Optiv's reporting.

### 8.3 Quality gates

- **Gate 0, intake.** Falcon IQ assessment readiness confirmed (telemetry coverage, OverWatch history, admin access), change authority for remediation agreed in the statement of work, liability terms per Section 10 accepted.
- **Gate 1, assessment exit.** Scorecard reviewed by the second advisor; every scored requirement has evidence; capacity assessment names the customer's remediation owners.
- **Gate 2, sprint exit.** Every top-ten attack narrative has been validated or rejected with a written reason; the roadmap has an owner and an estimate for every workstream; the Partner Architect signs the tier recommendation.
- **Gate 3, retainer monthly.** Remediation evidence for every closed finding is attached in the dashboard; re-test results recorded; slipped items carry a reason and a new date.
- **Gate 4, board and attestation.** Second-advisor review of every claim; Optiv attests only to work Optiv performed or validated; legal review of the attestation template before first use and at every insurer-driven change.

### 8.4 Subcontract and bench strategy for surge

The model engages an internal bench of up to 240 hours per month from Optiv's Application Security and Cyber Strategy & Transformation practices from month 4, at a $165 per hour internal transfer cost, whenever backlog exceeds two weeks (all three parameters are ASSUMPTION inputs). The bench works to FAIRR playbooks under the remediation lead's supervision and does not count toward advisor utilization. The bench is a surge mechanism, not a substitute for hiring: in the base case backlog runs between 17 and 27 weeks from month 6 onward even with the bench fully engaged, which is exactly the condition the hiring rule is designed to catch. External subcontracting is reserved for specialist remediation (for example, mainframe or embedded code) and is priced into the affected Retainer tier case by case.

### 8.5 Hiring trigger rules

Add one Senior Advisor (fully loaded $215,000) whenever trailing three-month realized utilization is at or above 75% and backlog exceeds eight weeks of advisor capacity, subject to a six-advisor cap by the end of Year 3, a two-month recruiting lag, and a three-month cooldown between hire decisions. Because the founding team's utilization ramp reaches 75% only in month 13, the rule cannot fire before month 16; in the base case it fires in months 16, 23, and 30, and advisors arrive in months 18, 25, and 32, ending Year 3 at five. New hires ramp at 50% for two months and then run at steady state, because they join into an existing backlog with playbooks already written.

The rule is deliberately conservative, and its conservatism has a price: every month the cap holds, the practice declines demand worth roughly $1.7 million of expected lifetime value (3.1 assessments a month at $533,593 each in the base case). Leadership should treat the month 12 review as the point to decide whether to raise the cap, shorten the lag, or accept the constraint.

### 8.6 Operating rhythm

Daily: advisor stand-up on active engagements (15 minutes). Weekly: dashboard review per engagement; pipeline review with the CrowdStrike alliance manager (first six months) and the Optiv CrowdStrike sales specialists. Monthly: practice P&L against the model, utilization and backlog against the hiring trigger, resilience reports issued, Falcon IQ product-change review. Quarterly: executive reviews delivered, catalogue and pricing review, QuiltWorks and Flex terms review with CrowdStrike, board reporting to Optiv practice leadership against the metrics in Section 12.

---

## 9. Enablement & Certification Plan

### 9.1 Required CrowdStrike certifications and onboarding

Both advisors hold, or obtain within 90 days, the CrowdStrike Certified Falcon Administrator and Falcon Responder credentials, plus the Falcon Hunter credential for the assessment lead and the relevant cloud security and identity protection specializations for the remediation lead. Both complete Falcon IQ partner onboarding and Charlotte AI AgentWorks training as CrowdStrike makes it available, so Optiv can build and tune custom agents for its own catalogue, which the 31 August release names as a partner capability. The training and certification budget is $18,000 per advisor per year, with the Falcon IQ partner sandbox, lab, and tooling budgeted at $36,000 per year for the practice.

### 9.2 Internal playbooks

By the end of month 3 the practice publishes: the Readiness Assessment scoring guide (five requirements, evidence standards); the attack-narrative validation procedure (what an advisor checks before accepting an agent narrative, and how rejections are recorded); the remediation workstream templates by finding class (code, configuration, identity, cloud, third-party); the control-validation and re-test standard; the Board Readout and attestation templates (after legal review); and the Falcon Complete add-on runbook for the Threat Management team. These are the artifacts that let the bench and future hires deliver at the 50% ramp the model assumes.

### 9.3 30/60/90 for the two advisors

| | Assessment and prioritization lead | Remediation and engineering lead |
|---|---|---|
| Days 1 to 30 | Falcon IQ onboarding; catalogue loaded; assessment scoring guide drafted; joins all first meetings; first Readiness Assessment scoped | Falcon IQ onboarding; remediation workstream templates drafted; Falcon Complete add-on runbook drafted with the Threat Management lead; liability terms drafted with legal |
| Days 31 to 60 | First Readiness Assessment delivered through Gate 1; attack-narrative validation procedure published; webinar delivered with the alliance team | Bench engagement model agreed with AppSec and Cyber Strategy leads; first add-on customers onboarded; control-validation standard published |
| Days 61 to 90 | First Sprint started; Board Readout template through legal review; two certifications complete | First remediation program designed; first bench consultant trained on playbooks; two certifications complete; 90-day review inputs on backlog and hiring |

---

## 10. Risks & Mitigations

| # | Risk | Likelihood | Impact | Owner | Mitigation | Status |
|---|---|---|---|---|---|---|
| 1 | QuiltWorks enrollment timing: coalition inclusion is deferred or declined, slowing co-sell and denying the coalition brand | Medium | Medium | Optiv VP Alliances | Fallback delivery on Falcon IQ outputs through Elite status (Section 7.5); model does not depend on listing; re-application on a fixed date | Open; application due 30 September 2026 |
| 2 | Channel conflict: CrowdStrike field prioritizes the named GSIs in accounts Optiv targets | Medium | High | Partner Architect; CrowdStrike alliance manager | Target list built jointly with CrowdStrike; lead with installed-base accounts where Optiv already operates Falcon; Falcon Complete add-on as the differentiator; escalate conflicts through the alliance executive sponsor | Open |
| 3 | Falcon IQ product change: the 31 August release states unreleased features are "still in development and subject to change" | High | Medium | Assessment lead | Playbooks written against Falcon IQ outputs, not its interface; monthly product-change review; fallback reporting path; no revenue in the model depends on any unreleased feature | Open; standing review |
| 4 | Utilization risk with a two-person team: demand arrives unevenly, or a customer slips | Medium | Medium | Practice lead | EBITDA turns positive in month 4 at 55% utilization; bench absorbs surge; Downside scenario (utilization minus 10 points) still breaks even on cash in month 22 | Mitigated by design |
| 5 | Key-person dependency: loss of either advisor stalls delivery | Medium | High | Practice lead | Cross-training on both roles by month 6; playbooks by month 3; bench consultants trained on delivery; retention terms tied to practice milestones; recruiting pipeline opened at month 12 regardless of trigger | Open |
| 6 | Pricing pressure from agentic automation: Falcon IQ makes assessment cheaper, and GSIs or CrowdStrike discount | Medium | Medium | Partner Architect | Value anchored on remediation execution and attestation, which agents do not replace; GSI price-war scenario (all prices minus 20%) remains EBITDA-positive from month 9; hours per offering reviewed quarterly as agents absorb work | Open |
| 7 | Liability exposure for remediation work: a change Optiv makes causes an outage or a missed finding is later exploited | Low | High | Optiv legal; remediation lead | Change authority and customer sign-off in every statement of work; Gate 3 evidence standard; attestation limited to work Optiv performed or validated; $45,000 per year insurance and legal budget; professional liability coverage reviewed before first Retainer | Open; legal review due month 2 |
| 8 | Capacity constraint understates the plan's own opportunity: base case declines 112.8 assessments in 36 months | High | High | Optiv practice leadership | Month 12 decision on headcount cap and hiring lag; Upside scenario quantifies what co-sell adds if capacity follows | Open; decision at month 12 |
| 9 | Falcon Complete add-on economics unproven: the offering is 70% of Year 3 revenue and its price and delivery-cost share are the two most sensitive inputs | Medium | High | Falcon Complete practice lead; remediation lead | Validate the 35% delivery-cost transfer and the 6-hour oversight assumption with the first three customers by month 6; reprice or re-scope before the month 12 ramp | Open; validation by month 6 |
| 10 | Falcon Flex economics: CrowdStrike's actual program margin or incentive differs from the 10% assumption | High | Medium | Optiv VP Alliances | Input is editable; net revenue effect is 6% at the assumed terms; obtain written Flex for Services partner terms before the first Flex-transacted deal | Open |

---

## 11. Roadmap (12 quarters)

Model month 1 is October 2026; quarters below are calendar quarters.

| Quarter | Model months | Milestones | Model markers (base case) |
|---|---|---|---|
| Q4 2026 | 1 to 3 | Practice launch with two Principal Advisors; QuiltWorks application filed; Falcon IQ onboarding and catalogue load; first Readiness Assessment; playbooks v1 | 3 assessments accepted; cumulative cash negative $168,612 at month 3 |
| Q1 2027 | 4 to 6 | Coalition decision or fallback; bench engaged; first Sprint and first Retainer; first Falcon Complete add-on customers; legal review of attestation | 3 add-on customers by month 6; EBITDA positive from month 4; peak cash burn approaches |
| Q2 2027 | 7 to 9 | Peak funding month (month 7, negative $311,627); first Board Readout; Fal.Con 2027 case study; certification targets met | Utilization 70%; first retainers active |
| Q3 2027 | 10 to 12 | Year 1 close; month 12 review of headcount cap and hiring lag; 12 add-on customers | Year 1 revenue $1,861,165; EBITDA $101,686; backlog above the 8-week trigger |
| Q4 2027 | 13 to 15 | Founders at steady-state 75% utilization; first Retainer renewals approach; second-year pricing (4% escalator) | Hiring trigger arms in month 13 |
| Q1 2028 | 16 to 18 | Hire decision month 16; Senior Advisor 1 arrives month 18; first renewals and renewal-cycle Board Readouts | Cumulative cash break-even month 19 (early Q2) |
| Q2 2028 | 19 to 21 | Cash positive; mid-market packaging designed for Segment 3; QuiltWorks re-review with CrowdStrike | 3 advisors |
| Q3 2028 | 22 to 24 | Year 2 close; hire decision month 23; 30 add-on customers | Year 2 revenue $4,228,393; EBITDA $938,591 |
| Q4 2028 | 25 to 27 | Senior Advisor 2 arrives month 25; Segment 3 launch through Optiv mid-market coverage | 4 advisors |
| Q1 2029 | 28 to 30 | Second renewal cycle; hire decision month 30; third-year pricing | Retainers active above 4 |
| Q2 2029 | 31 to 33 | Senior Advisor 3 arrives month 32; practice at five advisors | 5 advisors |
| Q3 2029 | 34 to 36 | Year 3 close; 50 add-on customers; decision on the practice's next phase (cap lift, regional expansion, or fold into a broader AI risk practice) | Year 3 revenue $7,148,186; EBITDA $1,872,342; cumulative cash $1,933,149 |

---

## 12. Decision Requested & Investment Ask

### 12.1 The ask

1. **Headcount.** Two Principal Advisors, fully loaded $265,000 each, starting 1 October 2026. Authority for the practice lead to add Senior Advisors ($215,000 loaded) when the hiring trigger fires, up to six advisors by the end of Year 3.
2. **Dollars.** A $375,000 working-capital allocation, being the peak cumulative cash burn of $311,627 (month 7) plus 20% contingency, rounded up to $25,000. Year 1 opex outside advisor labor is $247,000 (practice lead allocation $70,000, marketing $60,000, training $36,000, tooling $36,000, insurance and legal $45,000), plus sales overhead at 12% and travel at 6% of net revenue.
3. **Timeline.** Launch 1 October 2026; QuiltWorks application by 30 September 2026; coalition decision or fallback by 31 January 2027; reviews at months 6, 12, and 24.
4. **Alliance actions.** Executive sponsorship of the QuiltWorks enrollment; written Flex for Services partner terms before the first Flex-transacted deal.

### 12.2 What the money buys

| Base case | Year 1 | Year 2 | Year 3 | 36 months |
|---|---|---|---|---|
| Gross revenue | $1,861,165 | $4,228,393 | $7,148,186 | $13,237,744 |
| EBITDA | $101,686 | $938,591 | $1,872,342 | $2,912,619 |
| Ending cumulative cash | ($231,415) | $431,301 | $1,933,149 | |

### 12.3 Scenarios

| | Base | Downside | Upside | GSI price war |
|---|---|---|---|---|
| Definition | Documented inputs | Attach minus 15 pts, utilization minus 10 pts, one fewer assessment per month | QuiltWorks in Q1; co-sell doubles assessments from month 7; Falcon IQ tooling cuts assessment and sprint effort 15% | All prices minus 20% |
| Year 1 revenue | $1,861,165 | $1,590,552 | $2,039,612 | $1,488,932 |
| Year 2 revenue | $4,228,393 | $4,076,253 | $4,338,412 | $3,382,714 |
| Year 3 revenue | $7,148,186 | $6,879,793 | $7,193,851 | $5,718,549 |
| Year 2 EBITDA | $938,591 | $821,321 | $1,023,394 | $467,249 |
| Cash break-even month | 19 | 22 | 15 | 28 |
| Peak funding | $311,627 | $432,418 | $291,796 | $415,853 |
| Investment ask | $375,000 | $525,000 | $375,000 | $500,000 |

The recommended allocation is the base-case $375,000. If leadership prefers to fund the Downside, the ask is $525,000; the difference is the cost of a two-quarter slower ramp.

### 12.4 Sensitivity

The tornado analysis on Year 2 EBITDA (base $938,591) ranks the ten highest-impact inputs, each flexed plus and minus 20% (rates by 10 points):

| Rank | Input | Year 2 EBITDA range | Swing |
|---|---|---|---|
| 1 | Falcon Complete add-on price | $721,569 to $1,155,612 | $434,043 |
| 2 | Add-on delivery-cost share | $758,083 to $1,119,098 | $361,015 |
| 3 | Steady-state utilization | $781,876 to $1,137,065 | $355,189 |
| 4 | Retainer tier pricing | $796,333 to $1,080,848 | $284,515 |
| 5 | Principal Advisor loaded cost | $832,591 to $1,044,591 | $212,000 |
| 6 | Add-on customers by month 24 | $837,439 to $1,039,661 | $202,222 |
| 7 | Sales/SE overhead share | $843,198 to $1,033,983 | $190,785 |
| 8 | Sprint price | $882,800 to $994,381 | $111,580 |
| 9 | Internal bench hours per month | $883,374 to $993,509 | $110,136 |
| 10 | Assessment price | $888,294 to $988,888 | $100,594 |

No single input flexed by 20% takes Year 2 EBITDA below $720,000. The two add-on inputs at the top of the list are internal to Optiv and can be validated with the Falcon Complete practice before month 6.

### 12.5 Success metrics

| At | Metric | Target (base case) |
|---|---|---|
| 6 months | QuiltWorks enrollment | Application accepted and Falcon IQ catalogue live, or fallback operating with a re-application date |
| | Falcon Complete add-on customers | 3 |
| | Assessments signed since launch | 6 or more |
| | Cumulative cash burn | No worse than $325,000 (model: $307,155 at month 6) |
| | Certifications | Both advisors at the Section 9 baseline |
| 12 months | Gross revenue | $1,861,165 |
| | EBITDA | Positive (model: $101,686) |
| | Add-on customers | 12 |
| | Active retainers | 2.5 (model) |
| | Backlog | At or above the 8-week hiring trigger, with a leadership decision on the headcount cap recorded |
| 24 months | Gross revenue | $4,228,393 |
| | EBITDA | $938,591 |
| | Advisors | 3, with the fourth arriving in month 25 |
| | Add-on customers | 30 |
| | Cumulative cash | Positive since month 19 (model: $431,301 at month 24) |
| | Retainer renewal rate | 80% or better on the first cohort |

### 12.6 Recommendation

Approve. The practice is cash-light, EBITDA-positive from its fourth month, built on a product motion CrowdStrike is funding and marketing on Optiv's behalf, and differentiated by an asset no coalition GSI has: Optiv's own operation of the customer's Falcon platform. The risk that matters is not that demand fails to appear; it is that Optiv declines it. The month 12 review should be scheduled now, with the headcount cap on the agenda.
