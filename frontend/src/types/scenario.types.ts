export interface ScenarioModifications {
  expenseChange: number;
  revenueChange: number;
  oneTimeCashChange: number;
  description?: string;
}

export interface ScenarioResult {
  newRunwayMonths: number;
  runwayDelta: number;
  newRunway?: number;
  newBurnRate?: number;
}

export interface Scenario {
  id: string;
  name: string;
  type: 'hire' | 'cut_expense' | 'pricing' | 'investment' | 'custom';
  createdAt: string;
  modifications: ScenarioModifications;
  result: ScenarioResult;
}

export type CreateScenarioInput = Omit<Scenario, 'id' | 'createdAt' | 'result'>;
