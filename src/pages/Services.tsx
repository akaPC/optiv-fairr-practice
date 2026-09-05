import type { ModelInputs, OfferingKey } from '../../model/fairr-model';
import { INPUT_META } from '../../model/input-meta';
import { useModel } from '../lib/model-store';
import { money, num, pct } from '../lib/format';
import { ABadge, PageHeader, Panel, SectionLabel, Table, Tag } from '../components/ui';
import { FALCON_IQ_MAPPING, SERVICES } from '../data/content';
import { OFFERING_SHORT } from '../lib/charts';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="text-xs leading-5 text-slate-bright">{children}</div>
    </div>
  );
}

export default function Services() {
  const { inputs, outputs } = useModel();
  const ue = Object.fromEntries(outputs.unitEconomics.map((u) => [u.key, u])) as Record<OfferingKey, (typeof outputs.unitEconomics)[number]>;
  const keys = (k: keyof ModelInputs | Array<keyof ModelInputs>) => (Array.isArray(k) ? k : [k]);
  const assumptionKeys = (k: keyof ModelInputs | Array<keyof ModelInputs>) => keys(k).filter((x) => INPUT_META[x].assumption);

  return (
    <div>
      <PageHeader
        eyebrow="Service catalog · five offerings that consume Falcon IQ outputs"
        title="What Optiv sells"
        lede={`Fixed fee unless noted, ${pct(inputs.priceEscalator, 0)} annual escalator, Falcon Flex eligible. Delivery hours derive from the ${money(inputs.blendedRate)}/hour blended rate; delivery cost uses ${money(outputs.summary.costPerBillableHour)} per billable advisor-hour.`}
      />

      <div className="space-y-4 mb-8">
        {SERVICES.map((svc) => {
          const priceKeys = keys(svc.priceKey);
          const hourKeys = keys(svc.hoursKey);
          const u = ue[svc.key];
          const attach = svc.attachNote ? inputs[svc.attachNote as keyof ModelInputs] : undefined;
          return (
            <Panel key={svc.code} className="p-0">
              <div className="grid lg:grid-cols-[1fr_320px]">
                <div className="p-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
                    <span className="font-mono text-2xs text-slate-dim">{svc.code}</span>
                    <h2 className="font-head text-2xl uppercase tracking-wide text-paper leading-none">{svc.name}</h2>
                    <Tag tone="cyan">Flex</Tag>
                  </div>
                  <p className="text-sm text-slate mb-4">{svc.tagline}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Scope">
                      <ul className="list-[square] pl-4 space-y-1">
                        {svc.scope.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </Field>
                    <Field label="Deliverables">
                      <ul className="list-[square] pl-4 space-y-1">
                        {svc.deliverables.map((d) => (
                          <li key={d}>{d}</li>
                        ))}
                      </ul>
                    </Field>
                    <Field label="Staffing">{svc.staffing}</Field>
                    <Field label="Duration">{svc.duration}</Field>
                    <Field label="Falcon IQ outputs consumed">
                      <div className="flex flex-wrap gap-1">
                        {svc.falconIqInputs.map((f) => (
                          <Tag key={f}>{f}</Tag>
                        ))}
                      </div>
                    </Field>
                    <Field label="Falcon Flex eligibility">{svc.flex}</Field>
                  </div>
                </div>
                <div className="panel-2 border-0 border-t lg:border-t-0 lg:border-l border-line p-4">
                  <div className="label">Price · {svc.priceBasis}</div>
                  {priceKeys.length === 1 ? (
                    <div className="kpi text-4xl text-cyan">{money(inputs[priceKeys[0]])}</div>
                  ) : (
                    <div className="space-y-0.5">
                      {priceKeys.map((k, i) => (
                        <div key={k} className="flex items-baseline gap-2">
                          <span className="font-mono text-2xs text-slate-dim w-10">Tier {i + 1}</span>
                          <span className="kpi text-2xl text-cyan">{money(inputs[k])}</span>
                          <span className="font-mono text-2xs text-slate-dim">/mo · {num(inputs[hourKeys[i]], 0)} h</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
                    <div>
                      <div className="label">
                        Delivery hours
                        <ABadge inputs={hourKeys} />
                      </div>
                      <div className="num text-sm text-paper">
                        {num(u.deliveryHours, 0)} {u.revenueBasis === 'per month' ? 'h/mo' : 'h'}
                      </div>
                    </div>
                    <div>
                      <div className="label">Effective rate</div>
                      <div className="num text-sm text-paper">{money(u.effectiveRate)}/h</div>
                    </div>
                    <div>
                      <div className="label">
                        Delivery cost
                        <ABadge inputs={svc.key === 'fcAddon' ? ['fcAddonDeliveryCostPct', 'fcAddonAdvisorHours'] : hourKeys} />
                      </div>
                      <div className="num text-sm text-paper">{money(u.deliveryCost)}</div>
                    </div>
                    <div>
                      <div className="label">Gross margin</div>
                      <div className="num text-sm text-cyan">
                        {money(u.grossMargin)} · {pct(u.grossMarginPct, 1)}
                      </div>
                    </div>
                    <div>
                      <div className="label">Margin / advisor-hour</div>
                      <div className="num text-sm text-paper">{money(u.marginPerAdvisorHour)}</div>
                    </div>
                    {attach !== undefined && (
                      <div>
                        <div className="label">Modeled attach</div>
                        <div className="num text-sm text-paper">{pct(attach, 0)}</div>
                      </div>
                    )}
                    {svc.key === 'retainer' && (
                      <div className="col-span-2">
                        <div className="label">Tier mix · renewal</div>
                        <div className="num text-sm text-paper">
                          {pct(inputs.tierMix1, 0)} / {pct(inputs.tierMix2, 0)} / {pct(inputs.tierMix3, 0)} · {pct(inputs.renewalRate, 0)} renew
                        </div>
                      </div>
                    )}
                    {svc.key === 'fcAddon' && (
                      <div className="col-span-2">
                        <div className="label">Customer ramp</div>
                        <div className="num text-sm text-paper">
                          {inputs.fcAddonByMonth6} by M6 · {inputs.fcAddonByMonth12} by M12 · {inputs.fcAddonByMonth24} by M24 · {inputs.fcAddonByMonth36} by M36
                        </div>
                      </div>
                    )}
                  </div>
                  {assumptionKeys(svc.priceKey).length > 0 && (
                    <div className="mt-2 font-mono text-2xs text-amber">Price is an assumption input.</div>
                  )}
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      <SectionLabel>Division of labor · Falcon IQ output to billable Optiv activity</SectionLabel>
      <Table minWidth={860}>
        <thead>
          <tr>
            <th>Falcon IQ output</th>
            <th>What it contains</th>
            <th>Billable Optiv activity</th>
            <th>Offering</th>
          </tr>
        </thead>
        <tbody>
          {FALCON_IQ_MAPPING.map((m) => (
            <tr key={m.output}>
              <td className="text-cyan whitespace-nowrap">{m.output}</td>
              <td className="text-slate-bright font-body text-xs">{m.contains}</td>
              <td className="text-slate-bright font-body text-xs">{m.activity}</td>
              <td>
                <div className="flex flex-wrap gap-1">
                  {m.offerings.map((o) => (
                    <Tag key={o} tone="cyan">
                      {OFFERING_SHORT[o]}
                    </Tag>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <p className="mt-3 text-xs text-slate max-w-3xl">
        Source: CrowdStrike Falcon IQ press release, 31 August 2026 (agents produce "attack narratives, investment priorities, and remediation roadmaps" mapped to the
        partner's loaded service catalogue, delivered through a co-branded partner dashboard). See Sources 01 and 10.
      </p>
    </div>
  );
}
