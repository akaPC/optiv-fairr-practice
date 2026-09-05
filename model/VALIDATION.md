# Model Validation

Generated 2026-09-05 by `npm run model:validate`. Every check below is re-run by the Vitest suite (`npm test`).

## Model checks by scenario

### Base

| Check | Result | Detail |
|---|---|---|
| No negative gross margin after month 6 | PASS | Gross margin positive in every month from month 7 onward |
| Revenue never exceeds delivery capacity | PASS | Delivered hours are within advisor plus bench capacity in all 36 months; utilization never exceeds the ramp ceiling |
| Hiring rule fires only when both conditions hold | PASS | 3 hire decision(s) in month(s) 16, 23, 30, each with trailing utilization at or above 75% and backlog above 8 weeks; headcount never exceeds 6 |
| Cash flow reconciles to P&L less working-capital timing | PASS | Cumulative EBITDA $2,912,619 minus uncollected receivables $979,470 equals cumulative net cash $1,933,149 (difference 0.0000) |
| Retainer tier mix sums to 100% | PASS | Tier mix sums to 100.0% |
| Revenue by offering sums to total revenue | PASS | Offering revenue lines reconcile to total in every month |
| Utilization never exceeds the planned ramp | PASS | Realized utilization stays at or below each advisor's ramp ceiling |

Headline: Y1 $1,861,165 / Y2 $4,228,393 / Y3 $7,148,186 gross revenue; EBITDA Y2 $938,591; cash break-even month 19; peak funding $311,627; investment ask $375,000; ending headcount 5.

### Downside

| Check | Result | Detail |
|---|---|---|
| No negative gross margin after month 6 | PASS | Gross margin positive in every month from month 7 onward |
| Revenue never exceeds delivery capacity | PASS | Delivered hours are within advisor plus bench capacity in all 36 months; utilization never exceeds the ramp ceiling |
| Hiring rule fires only when both conditions hold | PASS | 3 hire decision(s) in month(s) 16, 23, 30, each with trailing utilization at or above 65% and backlog above 8 weeks; headcount never exceeds 6 |
| Cash flow reconciles to P&L less working-capital timing | PASS | Cumulative EBITDA $2,419,483 minus uncollected receivables $940,832 equals cumulative net cash $1,478,650 (difference 0.0000) |
| Retainer tier mix sums to 100% | PASS | Tier mix sums to 100.0% |
| Revenue by offering sums to total revenue | PASS | Offering revenue lines reconcile to total in every month |
| Utilization never exceeds the planned ramp | PASS | Realized utilization stays at or below each advisor's ramp ceiling |

Headline: Y1 $1,590,552 / Y2 $4,076,253 / Y3 $6,879,793 gross revenue; EBITDA Y2 $821,321; cash break-even month 22; peak funding $432,418; investment ask $525,000; ending headcount 5.

### Upside

| Check | Result | Detail |
|---|---|---|
| No negative gross margin after month 6 | PASS | Gross margin positive in every month from month 7 onward |
| Revenue never exceeds delivery capacity | PASS | Delivered hours are within advisor plus bench capacity in all 36 months; utilization never exceeds the ramp ceiling |
| Hiring rule fires only when both conditions hold | PASS | 3 hire decision(s) in month(s) 16, 23, 30, each with trailing utilization at or above 75% and backlog above 8 weeks; headcount never exceeds 6 |
| Cash flow reconciles to P&L less working-capital timing | PASS | Cumulative EBITDA $3,170,167 minus uncollected receivables $996,892 equals cumulative net cash $2,173,275 (difference 0.0000) |
| Retainer tier mix sums to 100% | PASS | Tier mix sums to 100.0% |
| Revenue by offering sums to total revenue | PASS | Offering revenue lines reconcile to total in every month |
| Utilization never exceeds the planned ramp | PASS | Realized utilization stays at or below each advisor's ramp ceiling |

Headline: Y1 $2,039,612 / Y2 $4,338,412 / Y3 $7,193,851 gross revenue; EBITDA Y2 $1,023,394; cash break-even month 15; peak funding $291,796; investment ask $375,000; ending headcount 5.

### GSI price war

| Check | Result | Detail |
|---|---|---|
| No negative gross margin after month 6 | PASS | Gross margin positive in every month from month 7 onward |
| Revenue never exceeds delivery capacity | PASS | Delivered hours are within advisor plus bench capacity in all 36 months; utilization never exceeds the ramp ceiling |
| Hiring rule fires only when both conditions hold | PASS | 3 hire decision(s) in month(s) 16, 23, 30, each with trailing utilization at or above 75% and backlog above 8 weeks; headcount never exceeds 6 |
| Cash flow reconciles to P&L less working-capital timing | PASS | Cumulative EBITDA $1,444,735 minus uncollected receivables $783,576 equals cumulative net cash $661,159 (difference 0.0000) |
| Retainer tier mix sums to 100% | PASS | Tier mix sums to 100.0% |
| Revenue by offering sums to total revenue | PASS | Offering revenue lines reconcile to total in every month |
| Utilization never exceeds the planned ramp | PASS | Realized utilization stays at or below each advisor's ramp ceiling |

Headline: Y1 $1,488,932 / Y2 $3,382,714 / Y3 $5,718,549 gross revenue; EBITDA Y2 $467,249; cash break-even month 28; peak funding $415,853; investment ask $500,000; ending headcount 5.

## Excel workbook reconciliation (HyperFormula recalculation)

Monthly sheet: 1152 formula cells across 32 line items compared to the TypeScript model at a tolerance of $0.01 or 1e-7 relative. Mismatches: 0.

| Summary metric | TypeScript | Excel (recalculated) | Match |
|---|---|---|---|
| Year 1 gross revenue | $1,861,165 | $1,861,165 | PASS |
| Year 2 gross revenue | $4,228,393 | $4,228,393 | PASS |
| Year 3 gross revenue | $7,148,186 | $7,148,186 | PASS |
| Year 1 EBITDA | $101,686 | $101,686 | PASS |
| Year 2 EBITDA | $938,591 | $938,591 | PASS |
| Year 3 EBITDA | $1,872,342 | $1,872,342 | PASS |
| Peak funding requirement | $311,627 | $311,627 | PASS |
| Peak funding month | 7 | 7 | PASS |
| Investment ask | $375,000 | $375,000 | PASS |
| Cash break-even month | 19 | 19 | PASS |
| Ending advisors | 5 | 5 | PASS |
| Total hires | 3 | 3 | PASS |
| Assessments declined | 112.8 | 112.8 | PASS |
| Revenue left on the table | $60,195,950 | $60,195,950 | PASS |
| Cumulative cash at month 36 | 1933148.7 | 1933148.7 | PASS |

CLV sheet: TypeScript $533,593 vs Excel $533,593: PASS.

Checks sheet (formulas evaluated in the workbook):

| Check | Result |
|---|---|
| No negative gross margin after month 6 | PASS |
| Delivered project hours never exceed advisor plus bench capacity | PASS |
| Utilization never exceeds steady-state ceiling | PASS |
| Headcount never exceeds cap | PASS |
| Cash reconciles to EBITDA less receivables | PASS |
| Tier mix sums to 100% | PASS |

## Overall: ALL CHECKS PASSED
