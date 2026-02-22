import { useDashboard } from '@/hooks/useDashboard';
import { StatCard } from '@/components/shared/StatCard';
import { InvestorMatchList }from '@/components/shared/InvestorMatchList';
import { CashFlowChart } from '@/components/charts/CashFlowChart';
import { ExpenseBreakdown } from '@/components/charts/ExpenseBreakdown';
import { RevenueComparison } from '@/components/charts/RevenueComparison';
import { Loader2, TrendingUp, PieChart, BarChart3, FileText, Calendar, Target, CheckCircle } from 'lucide-react';
import { useUiStore } from '@/stores/ui.store';
import { generateReport, type ReportType } from '@/services/dashboard.service';
import { useState } from 'react';
import { CfoChatWidget } from '@/components/layout/CfoChatWidget';

export function DashboardPage() {
  const { data, isLoading, isError, error } = useDashboard();
  const { activeTab } = useUiStore();
  const [generatingReport, setGeneratingReport] = useState<ReportType | null>(null);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const handleGenerateReport = async (reportType: ReportType) => {
    setGeneratingReport(reportType);
    setReportError(null);
    setReportSuccess(null);
    
    try {
      await generateReport(reportType);
      setReportSuccess(`Report downloaded successfully!`);
      setTimeout(() => setReportSuccess(null), 3000);
    } catch (err) {
      setReportError('Failed to generate report. Please try again.');
      setTimeout(() => setReportError(null), 5000);
    } finally {
      setGeneratingReport(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-danger/10 border border-danger text-danger px-4 py-3 rounded-xl" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline ml-2">{error.message}</span>
      </div>
    );
  }

  const renderTabContent = () => {
    // Overview Tab Content
    if (activeTab === 'Overview') {
      console.log('Rendering Dashboard with metrics:', data?.metrics);
      
      return (
        <div className="space-y-6 pb-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {data?.metrics.map(metric => (
              <StatCard key={metric.id} metric={metric} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {data?.cashFlow && <CashFlowChart data={data.cashFlow} />}
            </div>
            <div className="lg:col-span-1">
              <ExpenseBreakdown 
                data={data?.expenseBreakdown} 
                totalExpenses={data?.metrics.find(m => m.id === 'expenses')?.value ? 
                  parseFloat(data.metrics.find(m => m.id === 'expenses')!.value.replace(/[$,]/g, '')) : 
                  undefined
                } 
              />
            </div>
          </div>

          <RevenueComparison 
            data={data?.revenueComparison} 
            currentYearLabel="Recurring Revenue"
            previousYearLabel="One-Time Revenue"
          />

          {/* --- AI INVESTOR MATCH SECTION --- */}
          <div className="pt-8 mt-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-6 px-2">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Startify AI Matchmaker</h3>
                <p className="text-sm text-gray-500 mt-1">Top VC matches based on your current metrics</p>
              </div>
            </div>
            
            <InvestorMatchList startupId={123} />
          </div>
        </div>
      );
    }

    // Analytics Tab Content
    if (activeTab === 'Analytics') {
      const hasData = data?.cashFlow && data.cashFlow.length > 0 && 
        data.cashFlow.some(d => d.balance > 0 || (d.income && d.income > 0) || (d.expenses && d.expenses > 0));

      const cashFlow = data?.cashFlow || [];
      const latestMonth = cashFlow[cashFlow.length - 1];
      const previousMonth = cashFlow.length > 1 ? cashFlow[cashFlow.length - 2] : null;
      
      const revenueGrowth = previousMonth && previousMonth.income && latestMonth?.income
        ? ((latestMonth.income - previousMonth.income) / previousMonth.income) * 100
        : 0;
      
      const expenseChange = previousMonth && previousMonth.expenses && latestMonth?.expenses
        ? ((latestMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
        : 0;
      
      const latestBurn = latestMonth ? (latestMonth.expenses || 0) - (latestMonth.income || 0) : 0;
      const previousBurn = previousMonth ? (previousMonth.expenses || 0) - (previousMonth.income || 0) : 0;
      const burnChange = previousBurn !== 0 ? ((latestBurn - previousBurn) / Math.abs(previousBurn)) * 100 : 0;
      
      const latestMRR = latestMonth?.income || 0;
      const totalRevenue = cashFlow.reduce((sum, m) => sum + (m.income || 0), 0);
      const avgExpenses = cashFlow.length > 0 
        ? cashFlow.reduce((sum, m) => sum + (m.expenses || 0), 0) / cashFlow.length 
        : 0;
      
      const runwayMetric = data?.metrics.find(m => m.id === 'runway');
      const runwayMonths = runwayMetric?.change?.match(/[\d.]+/)?.[0] || '0';

      const formatPercent = (val: number) => {
        const sign = val >= 0 ? '+' : '';
        return `${sign}${val.toFixed(1)}%`;
      };
      
      const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      };

      return (
        <div className="space-y-6 pb-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {data?.metrics.map(metric => (
              <StatCard key={metric.id} metric={metric} />
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Trends Analysis Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
                  <p className="text-sm text-gray-500">Month-over-month performance</p>
                </div>
              </div>
              {!hasData ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <TrendingUp className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No trend data available</p>
                  <p className="text-xs text-gray-400 mt-1">Import financial data to see trends</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Revenue Growth</span>
                    <span className={`text-sm font-semibold ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(revenueGrowth)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Expense Change</span>
                    <span className={`text-sm font-semibold ${expenseChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(expenseChange)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Current Runway</span>
                    <span className="text-sm font-semibold text-primary-600">
                      {runwayMonths} months
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-600">Burn Rate Change</span>
                    <span className={`text-sm font-semibold ${burnChange <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(burnChange)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Key Metrics Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-accent-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Key Metrics</h3>
                  <p className="text-sm text-gray-500">Performance indicators</p>
                </div>
              </div>
              {!hasData ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Target className="h-10 w-10 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500">No metrics available</p>
                  <p className="text-xs text-gray-400 mt-1">Import financial data to see key metrics</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Monthly Recurring Revenue</span>
                      <span className="text-sm font-semibold text-primary-600">{formatCurrency(latestMRR)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${Math.min((latestMRR / 50000) * 100, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Target: $50,000</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Total Revenue (All Time)</span>
                      <span className="text-sm font-semibold text-green-600">{formatCurrency(totalRevenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((totalRevenue / 200000) * 100, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Target: $200,000</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Avg. Monthly Expenses</span>
                      <span className="text-sm font-semibold text-orange-600">{formatCurrency(avgExpenses)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min((avgExpenses / 100000) * 100, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Budget: $100,000</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Reports Tab Content
    if (activeTab === 'Reports') {
      return (
        <div className="space-y-6 pb-12">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Financial Reports</h3>
                  <p className="text-sm text-gray-500">Generate and download detailed reports</p>
                </div>
              </div>
            </div>
          </div>

          {reportSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              {reportSuccess}
            </div>
          )}
          {reportError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {reportError}
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Monthly Summary Report */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Monthly Summary</h4>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Complete overview of your monthly financial performance including revenue, expenses, and cash flow.
              </p>
              <button 
                onClick={() => handleGenerateReport('monthly-summary')}
                disabled={generatingReport !== null}
                className="w-full py-2.5 px-4 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generatingReport === 'monthly-summary' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
                ) : ('Generate Report')}
              </button>
            </div>

            {/* Cash Flow Report */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Cash Flow Statement</h4>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Detailed breakdown of cash inflows and outflows with projections for upcoming months.
              </p>
              <button 
                onClick={() => handleGenerateReport('cash-flow')}
                disabled={generatingReport !== null}
                className="w-full py-2.5 px-4 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generatingReport === 'cash-flow' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
                ) : ('Generate Report')}
              </button>
            </div>

            {/* Expense Report */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-orange-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Expense Breakdown</h4>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Categorized analysis of all expenses with trends and optimization recommendations.
              </p>
              <button 
                onClick={() => handleGenerateReport('expense-breakdown')}
                disabled={generatingReport !== null}
                className="w-full py-2.5 px-4 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generatingReport === 'expense-breakdown' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
                ) : ('Generate Report')}
              </button>
            </div>

            {/* Runway Report */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Runway Analysis</h4>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Detailed runway projections with scenario analysis and recommendations for extension.
              </p>
              <button 
                onClick={() => handleGenerateReport('runway-analysis')}
                disabled={generatingReport !== null}
                className="w-full py-2.5 px-4 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generatingReport === 'runway-analysis' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
                ) : ('Generate Report')}
              </button>
            </div>

            {/* Revenue Report */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-teal-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Revenue Analysis</h4>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Revenue streams breakdown, growth trends, and forecasts based on historical data.
              </p>
              <button 
                onClick={() => handleGenerateReport('revenue-analysis')}
                disabled={generatingReport !== null}
                className="w-full py-2.5 px-4 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generatingReport === 'revenue-analysis' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
                ) : ('Generate Report')}
              </button>
            </div>

            {/* Investor Report */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Investor Update</h4>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Professional investor-ready report with key metrics, milestones, and growth highlights.
              </p>
              <button 
                onClick={() => handleGenerateReport('investor-update')}
                disabled={generatingReport !== null}
                className="w-full py-2.5 px-4 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generatingReport === 'investor-update' ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
                ) : ('Generate Report')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {renderTabContent()}
      <CfoChatWidget />
    </>
  );
}