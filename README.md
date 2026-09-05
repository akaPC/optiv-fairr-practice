# Optiv Frontier AI Readiness & Resilience (FAIRR) Practice

Business plan, financial model, and interactive planning app for a proposed Optiv service line delivered as a systems-integrator remediation partner on top of CrowdStrike Falcon IQ within the Project QuiltWorks framework.

## What the practice is

CrowdStrike launched Project QuiltWorks on 23 April 2026 (a coalition to assess, prioritize, and remediate vulnerabilities that frontier AI models find in production code) and Falcon IQ on 31 August 2026 at Fal.Con (more than 50 agents that automate assessment and prioritization and map every finding to a partner's service catalogue in a co-branded dashboard). The remediation work Falcon IQ hands to partners is the product this practice sells.

FAIRR launches with two Principal Advisors and five offerings that consume Falcon IQ outputs: a Readiness Assessment, a Prioritization & Attack Narrative Sprint, a tiered 12-month Remediation Program retainer, a Board Readout & Cyber Insurance Attestation package, and a continuous-remediation add-on for Optiv's Falcon Complete base. Headcount scales only on demonstrated backlog. Optiv is not currently a named QuiltWorks partner, so enrollment is treated as a gating milestone with a documented fallback.

The full plan is in [docs/business-plan.md](docs/business-plan.md). Decisions made during the build are in [docs/DECISIONS.md](docs/DECISIONS.md).

## Repository layout

| Path | Contents |
|---|---|
| `docs/business-plan.md` | The 12-section business plan (rendered at `/plan` in the app) |
| `docs/DECISIONS.md` | Decision log with rationale |
| `research/SOURCES.md`, `research/sources/` | Every source with URL, retrieval date, contribution, and a cleaned extract |
| `model/fairr-model.ts` | The pure TypeScript model: `computeModel(inputs)`, scenarios, tornado, checks |
| `model/input-meta.ts` | Label, unit, basis (source or `ASSUMPTION`), and bounds for every input |
| `model/ASSUMPTIONS.md` | Generated assumptions register with sensitivity ranks |
| `model/VALIDATION.md` | Generated validation results, including Excel reconciliation |
| `model/fairr-model.xlsx` | Excel workbook with live formulas mirroring the model |
| `model/fairr-model.csv` | Base-case 36-month snapshot |
| `model/scenarios.json` | Base, Downside, Upside, and GSI price-war summaries plus the tornado |
| `src/` | Vite + React + TypeScript app (hash routing, Tailwind, Recharts) |

## Run the app locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (the app uses hash routes, so `/#/model` and similar work without server configuration). Other scripts:

```bash
npm run build       # typecheck + production build to dist/
npm run typecheck   # tsc for the app and the node scripts
npm run lint        # eslint
npm test            # vitest suite for computeModel and the scenarios
npm run model       # CLI: base case, checks, CSV, scenarios.json, ASSUMPTIONS.md
npm run model:xlsx  # rebuild model/fairr-model.xlsx
npm run model:validate  # checks per scenario + Excel reconciliation, writes VALIDATION.md
```

## Change assumptions

Three equivalent places, in order of convenience:

1. **In the app**, open `/model`. The left rail groups every input (People, Overhead, Pricing, Delivery, Demand, Scenario). Edits persist in the browser's local storage; "Reset to base case" clears them. Amber "A" badges mark inputs the sources do not support.
2. **In Excel**, edit the `Inputs` sheet of `model/fairr-model.xlsx`. Every other sheet except `Scenarios` and `Tornado` (value snapshots) recalculates from live formulas.
3. **In code**, edit `BASE_INPUTS` in `model/fairr-model.ts`, then run `npm run model && npm run model:xlsx && npm run model:validate` to regenerate the CSV, JSON, assumptions register, workbook, and validation report. If you add an input, add its metadata to `model/input-meta.ts` and a row formula to `model/build-xlsx.ts`.

## How the model is structured

`computeModel(inputs)` walks 36 months. Each month it:

1. Applies pending hires and evaluates the hiring rule using only prior months (trailing three-month utilization at or above the threshold, backlog above the threshold, headroom under the cap, cooldown elapsed). Hires arrive after the recruiting lag.
2. Computes advisor capacity from each advisor's planned utilization (founders follow the practice ramp; hires follow a short new-hire ramp).
3. Runs the demand funnel: assessments demanded and accepted (declined while backlog exceeds the cap), sprint starts one month after an assessment, retainer starts one month after a sprint ends, renewals twelve months later, board readouts after sprints and renewals, and the Falcon Complete add-on customer ramp.
4. Allocates capacity: add-on oversight hours take first call; the remaining advisor hours plus any internal bench hours deliver the project work pool (backlog plus new demand) pro-rata across offerings. Undelivered hours carry forward as backlog.
5. Recognizes revenue on delivered hours at each offering's fee-per-hour (escalated by practice year), computes direct cost (advisor labor, bench, add-on delivery transfer), gross margin, variable overhead, fixed opex, EBITDA, and cash (net-45 collections split across the following two months).

Annual rollups, unit economics, a 36-month customer lifetime value, four scenarios, a tornado on Year 2 EBITDA, and seven validation checks are computed from the same monthly rows. The Excel workbook reproduces the monthly logic with formulas and is reconciled cell-by-cell against the TypeScript output by `model/validate.ts` using the HyperFormula engine.

## Deployment

Pushes to `main` build with Node 20 and deploy `dist/` to GitHub Pages through `.github/workflows/deploy.yml`. The Vite `base` is `/optiv-fairr-practice/`; set `VITE_BASE` to override.
