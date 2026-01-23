import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getScenarioById } from '@/services/scenario.service';
import type { Scenario as _Scenario } from '@/types/scenario.types';
import { 
  Loader2, 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  DollarSign, 
  Users, 
  TrendingDown,
  Calendar,
  Target,
  Trash2 as _Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Icon mapping based on scenario type
const typeIcons: Record<string, React.ElementType> = {
  hire: Users,
  hiring: Users,
  pricing: DollarSign,
  'cut_expense': TrendingDown,
  'cost-cutting': TrendingDown,
  investment: Target,
  custom: BarChart3,
  default: BarChart3,
};

export function ScenarioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: scenario, isLoading, isError } = useQuery({
    queryKey: ['scenario', id],
    queryFn: async () => {
      if (!id) return null;
      const scenario = await getScenarioById(id);
      return scenario;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (isError || !scenario) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate('/scenarios')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Scenarios
        </button>
        <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-xl">
          Scenario not found or failed to load.
        </div>
      </div>
    );
  }

  const { name, type, result, modifications } = scenario;
  const isPositive = result.runwayDelta >= 0;
  const DeltaIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const TypeIcon = typeIcons[type] || typeIcons.default;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/scenarios')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Scenarios
      </button>

      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50">
              <TypeIcon className="h-7 w-7 text-primary-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              <p className="text-sm text-gray-500 capitalize mt-1">{type.replace('_', ' ')} scenario</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
          }`}>
            <DeltaIcon className="h-5 w-5" />
            <span className="text-lg font-bold">
              {isPositive ? '+' : ''}{result.runwayDelta.toFixed(1)} months
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* New Runway */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50">
              <Target className="h-5 w-5 text-primary-500" />
            </div>
            <span className="text-sm text-gray-500">New Runway</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(result.newRunway ?? result.newRunwayMonths).toFixed(1)} months</p>
        </div>

        {/* Runway Change */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isPositive ? 'bg-success/10' : 'bg-danger/10'
            }`}>
              <DeltaIcon className={`h-5 w-5 ${isPositive ? 'text-success' : 'text-danger'}`} />
            </div>
            <span className="text-sm text-gray-500">Runway Impact</span>
          </div>
          <p className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
            {isPositive ? '+' : ''}{result.runwayDelta.toFixed(1)} months
          </p>
        </div>

        {/* New Burn Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
              <TrendingDown className="h-5 w-5 text-warning" />
            </div>
            <span className="text-sm text-gray-500">New Burn Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${(result.newBurnRate ?? 0).toLocaleString()}/mo</p>
        </div>

        {/* Created Date */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Calendar className="h-5 w-5 text-gray-500" />
            </div>
            <span className="text-sm text-gray-500">Created</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {scenario.createdAt ? new Date(scenario.createdAt).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      {/* Modifications Details */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Scenario Modifications</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Monthly Expense Change</p>
            <p className={`text-xl font-bold ${
              modifications.expenseChange > 0 ? 'text-danger' : 
              modifications.expenseChange < 0 ? 'text-success' : 'text-gray-900'
            }`}>
              {modifications.expenseChange > 0 ? '+' : ''}
              ${modifications.expenseChange.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Monthly Revenue Change</p>
            <p className={`text-xl font-bold ${
              modifications.revenueChange > 0 ? 'text-success' : 
              modifications.revenueChange < 0 ? 'text-danger' : 'text-gray-900'
            }`}>
              {modifications.revenueChange > 0 ? '+' : ''}
              ${modifications.revenueChange.toLocaleString()}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">One-time Cash Impact</p>
            <p className={`text-xl font-bold ${
              modifications.oneTimeCashChange > 0 ? 'text-success' : 
              modifications.oneTimeCashChange < 0 ? 'text-danger' : 'text-gray-900'
            }`}>
              {modifications.oneTimeCashChange > 0 ? '+' : ''}
              ${modifications.oneTimeCashChange.toLocaleString()}
            </p>
          </div>
        </div>
        {modifications.description && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-1">Description</p>
            <p className="text-gray-900">{modifications.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => navigate('/scenarios')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scenarios
        </Button>
      </div>
    </div>
  );
}
