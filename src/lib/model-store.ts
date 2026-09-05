import { createContext, useContext } from 'react';
import type { ModelInputs, ModelOutputs, ScenarioKey, TornadoBar } from '../../model/fairr-model';

export interface ModelContextValue {
  inputs: ModelInputs;
  outputs: ModelOutputs;
  scenarios: Record<ScenarioKey, ModelOutputs>;
  tornado: { baseEbitdaYear2: number; bars: TornadoBar[] };
  setInput: (key: keyof ModelInputs, value: number) => void;
  reset: () => void;
  isBaseCase: boolean;
  changedKeys: Array<keyof ModelInputs>;
}

export const ModelContext = createContext<ModelContextValue | null>(null);

export function useModel(): ModelContextValue {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error('useModel must be used inside ModelProvider');
  return ctx;
}
