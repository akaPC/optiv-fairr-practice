import { useEffect } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useModel } from './lib/model-store';
import Executive from './pages/Executive';
import Plan from './pages/Plan';
import Services from './pages/Services';
import Model from './pages/Model';
import Scenarios from './pages/Scenarios';
import Gtm from './pages/Gtm';
import Risks from './pages/Risks';
import Sources from './pages/Sources';

const NAV: Array<{ to: string; label: string; code: string }> = [
  { to: '/', label: 'Executive Summary', code: '00' },
  { to: '/plan', label: 'Business Plan', code: '01' },
  { to: '/services', label: 'Service Catalog', code: '02' },
  { to: '/model', label: 'Financial Model', code: '03' },
  { to: '/scenarios', label: 'Scenarios', code: '04' },
  { to: '/gtm', label: 'GTM & Roadmap', code: '05' },
  { to: '/risks', label: 'Risk Register', code: '06' },
  { to: '/sources', label: 'Sources & Assumptions', code: '07' },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function App() {
  const { isBaseCase, changedKeys, reset } = useModel();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-ink/95 backdrop-blur border-b border-line">
        <div className="max-w-[1600px] mx-auto px-3 md:px-5">
          <div className="flex items-center justify-between h-12 gap-3">
            <NavLink to="/" className="flex items-center gap-2 min-w-0">
              <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
                <path d="M6 24 16 8l10 16H6z" fill="none" stroke="#22D3EE" strokeWidth="2" />
                <path d="M11 24l5-8 5 8" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
              </svg>
              <span className="font-head font-semibold uppercase tracking-[0.12em] text-lg leading-none text-paper truncate">
                Optiv <span className="text-cyan">FAIRR</span> Practice
              </span>
              <span className="hidden md:inline label mb-0 ml-2">CrowdStrike Falcon IQ · Project QuiltWorks</span>
            </NavLink>
            <div className="flex items-center gap-2 shrink-0">
              {isBaseCase ? (
                <span className="font-mono text-2xs uppercase tracking-[0.14em] text-cyan border border-cyan/50 px-1.5 py-0.5">Base case</span>
              ) : (
                <button
                  type="button"
                  onClick={reset}
                  title={`Inputs changed: ${changedKeys.join(', ')}`}
                  className="font-mono text-2xs uppercase tracking-[0.14em] text-amber border border-amber/60 px-1.5 py-0.5 hover:bg-amber/10"
                >
                  {changedKeys.length} input{changedKeys.length === 1 ? '' : 's'} modified · reset
                </button>
              )}
            </div>
          </div>
          <nav className="flex gap-0 overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0" aria-label="Primary">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `shrink-0 font-mono text-2xs uppercase tracking-[0.16em] px-3 py-2 border-b-2 whitespace-nowrap ${
                    isActive ? 'border-cyan text-cyan' : 'border-transparent text-slate hover:text-paper'
                  }`
                }
              >
                <span className="text-slate-dim mr-1.5">{n.code}</span>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-3 md:px-5 py-5">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Executive />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/services" element={<Services />} />
          <Route path="/model" element={<Model />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/gtm" element={<Gtm />} />
          <Route path="/risks" element={<Risks />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="*" element={<Executive />} />
        </Routes>
      </main>
      <footer className="border-t border-line mt-8">
        <div className="max-w-[1600px] mx-auto px-3 md:px-5 py-4 flex flex-wrap gap-x-6 gap-y-1 label mb-0">
          <span>Optiv Frontier AI Readiness & Resilience practice plan</span>
          <span>Model: model/fairr-model.ts · runs in the browser · inputs persist locally</span>
          <span>Amber A marks figures that depend on labeled assumptions</span>
        </div>
      </footer>
    </div>
  );
}
