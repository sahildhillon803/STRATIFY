import type { Scenario, CreateScenarioInput } from '@/types/scenario.types';
import { apiClient } from './api.client';

interface ScenarioSimulateResponse {
  scenario_name: string;
  scenario_type: string;
  baseline: {
    cash_balance: number;
    monthly_revenue: number;
    monthly_expenses: number;
    burn_rate: number;
    runway_months: number;
    risk_level: string;
  };
  projected: {
    cash_balance: number;
    monthly_revenue: number;
    monthly_expenses: number;
    burn_rate: number;
    runway_months: number;
    risk_level: string;
  };
  runway_change: number;
  burn_rate_change: number;
  risk_change: string;
  summary: string;
  recommendation: string;
}

interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  example_use: string;
}

// Local storage for created scenarios (since backend doesn't persist them)
const scenariosDB: Scenario[] = [];

// GET all scenarios (from local storage since API is stateless)
export const getScenarios = async (): Promise<Scenario[]> => {
  console.log('Fetching scenarios...');
  return [...scenariosDB];
};

// GET a single scenario by ID
export const getScenarioById = async (id: string): Promise<Scenario | null> => {
  console.log('Fetching scenario by ID:', id);
  const scenario = scenariosDB.find(s => s.id === id);
  return scenario || null;
};

// GET scenario templates from API
export const getScenarioTemplates = async (): Promise<ScenarioTemplate[]> => {
  try {
    const response = await apiClient.get<{ templates: ScenarioTemplate[] }>('/scenarios/templates');
    return response.templates;
  } catch (error) {
    console.error('Failed to fetch scenario templates:', error);
    return [];
  }
};

// POST a new scenario - simulate using the API
export const createScenario = async (input: CreateScenarioInput): Promise<Scenario> => {
  console.log('Creating new scenario...', input);

  try {
    // Get baseline from API
    const baseline = await apiClient.get<{
      cash_balance: number;
      monthly_revenue: number;
      monthly_expenses: number;
      burn_rate: number;
      runway_months: number;
    }>('/scenarios/baseline');

    // Map input type to API scenario type
    const scenarioTypeMap: Record<string, string> = {
      'hire': 'hire_employee',
      'marketing': 'change_marketing',
      'pricing': 'change_pricing',
      'investment': 'receive_investment',
      'custom': 'custom',
    };

    // Build API request
    const apiRequest = {
      scenario_type: scenarioTypeMap[input.type] || 'custom',
      name: input.name,
      parameters: {
        salary: input.modifications.expenseChange,
        count: 1,
        custom_expense_change: input.modifications.expenseChange,
        custom_revenue_change: input.modifications.revenueChange,
        custom_cash_change: input.modifications.oneTimeCashChange,
      },
      baseline: {
        monthly_revenue: baseline.monthly_revenue,
        monthly_expenses: baseline.monthly_expenses,
        cash_balance: baseline.cash_balance,
      },
    };

    const response = await apiClient.post<ScenarioSimulateResponse>('/scenarios/simulate', apiRequest);

    const newScenario: Scenario = {
      id: `scn_${Date.now()}`,
      name: input.name,
      type: input.type,
      createdAt: new Date().toISOString(),
      modifications: input.modifications,
      result: {
        newRunwayMonths: response.projected.runway_months > 100 ? 999 : response.projected.runway_months,
        runwayDelta: response.runway_change,
      },
    };

    scenariosDB.push(newScenario);
    return newScenario;
  } catch (error) {
    console.error('Failed to create scenario:', error);
    
    // Fallback to local calculation
    const newScenario: Scenario = {
      id: `scn_${Date.now()}`,
      ...input,
      createdAt: new Date().toISOString(),
      result: {
        newRunwayMonths: 0,
        runwayDelta: 0,
      },
    };
    scenariosDB.push(newScenario);
    return newScenario;
  }
};
