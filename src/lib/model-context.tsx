import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BASE_INPUTS,
  computeModel,
  computeScenarios,
  computeTornado,
  type ModelInputs,
} from '../../model/fairr-model';
import { INPUT_META } from '../../model/input-meta';
import { ModelContext, type ModelContextValue } from './model-store';

const STORAGE_KEY = 'optiv-fairr-inputs-v1';

function loadStored(): ModelInputs {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...BASE_INPUTS };
    const parsed = JSON.parse(raw) as Partial<Record<keyof ModelInputs, unknown>>;
    const next: ModelInputs = { ...BASE_INPUTS };
    for (const key of Object.keys(BASE_INPUTS) as Array<keyof ModelInputs>) {
      const v = parsed[key];
      if (typeof v === 'number' && Number.isFinite(v)) next[key] = v;
    }
    return next;
  } catch {
    return { ...BASE_INPUTS };
  }
}

function saveStored(inputs: ModelInputs): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {
    // Storage may be unavailable (private mode, blocked site data); the app keeps working in memory.
  }
}

function clearStored(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

function clamp(key: keyof ModelInputs, value: number): number {
  const meta = INPUT_META[key];
  let v = value;
  if (meta.min !== undefined) v = Math.max(meta.min, v);
  if (meta.max !== undefined) v = Math.min(meta.max, v);
  if (meta.format === 'int') v = Math.round(v);
  return v;
}

export function ModelProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<ModelInputs>(() => loadStored());

  useEffect(() => {
    saveStored(inputs);
  }, [inputs]);

  const setInput = useCallback((key: keyof ModelInputs, value: number) => {
    if (!Number.isFinite(value)) return;
    setInputs((prev) => ({ ...prev, [key]: clamp(key, value) }));
  }, []);

  const reset = useCallback(() => {
    clearStored();
    setInputs({ ...BASE_INPUTS });
  }, []);

  const outputs = useMemo(() => computeModel(inputs), [inputs]);
  const scenarios = useMemo(() => computeScenarios(inputs), [inputs]);
  const tornado = useMemo(() => computeTornado(inputs), [inputs]);
  const changedKeys = useMemo(
    () => (Object.keys(BASE_INPUTS) as Array<keyof ModelInputs>).filter((k) => Math.abs(inputs[k] - BASE_INPUTS[k]) > 1e-12),
    [inputs],
  );

  const value = useMemo<ModelContextValue>(
    () => ({ inputs, outputs, scenarios, tornado, setInput, reset, isBaseCase: changedKeys.length === 0, changedKeys }),
    [inputs, outputs, scenarios, tornado, setInput, reset, changedKeys],
  );

  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
}
