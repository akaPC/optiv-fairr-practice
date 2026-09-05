# CrowdStrike 2026 Threat Hunting Report: Exploitation Window Closes as AI Use Accelerates

- **URL:** https://www.crowdstrike.com/en-us/blog/crowdstrike-2026-threat-hunting-report/
- **Publisher:** CrowdStrike (blog summary of the report)
- **Date:** August 3, 2026
- **Retrieved:** 2026-09-04

## Quantitative findings extracted

- 88% of CrowdStrike-observed exploitation of vulnerabilities with a public proof-of-concept occurred within 48 hours of the PoC's release.
- China-nexus adversaries (VAULT PANDA, GENESIS PANDA) launched deliberate attacks within 24 hours of public disclosure of a critical web application vulnerability.
- React2Shell: OverWatch responded to 800+ hunting leads across more than 80 victims in four days.
- CVE-2026-31431: exploited approximately 20 hours after public disclosure; ~94% of first-24-hour events were testing behavior based on public PoC code.
- AI agent-triggered detection leads surface 2.5x more threat leads than manually driven activity.
- Supply chain: 87% of identified software registry threats in H1 2026 involved npm packages; one actor compromised more than 300 software dependencies in one day; malicious dependency injected into at least 131 Mastra AI framework packages.
- One LLMJacking campaign generated nearly 200,000 API requests in two minutes.

## What it contributes to the plan
The 48-hour PoC-to-exploitation figure is the single most useful number for the "remediation capacity is the bottleneck" argument: if 88% of exploitation happens inside two days, a patch cycle measured in weeks is structurally late. Supports Section 2.
