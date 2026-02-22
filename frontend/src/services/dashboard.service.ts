import type { DashboardData } from '@/types/dashboard.types';
import { apiClient } from './api.client';

interface RunwayResponse {
  current_month: string;
  cash_balance: number;
  monthly_burn_rate: number;
  runway_months: number;
  status: string;
}

interface FinancialRecord {
  id: string;
  month: string;
  revenue_recurring: number;
  revenue_one_time: number;
  expenses_salaries: number;
  expenses_marketing: number;
  expenses_infrastructure: number;
  expenses_other: number;
  cash_balance: number;
  total_revenue: number;
  total_expenses: number;
  net_burn: number;
}

// Helper to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to format month name (short format for x-axis labels)
const formatMonthName = (monthStr: string): string => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  // Include year in short format: "Jan '24"
  const shortYear = year.slice(-2);
  return `${date.toLocaleString('default', { month: 'short' })} '${shortYear}`;
};

export const getDashboardData = async (): Promise<DashboardData> => {
  console.log('Fetching dashboard data from API...');

  try {
    // Fetch runway data
    const runway = await apiClient.get<RunwayResponse>('/financials/runway');
    
    // Fetch all financial records for historical data (API returns array or wrapped { data: [] })
    const exportResponse = await apiClient.get<FinancialRecord[] | { data?: FinancialRecord[]; records?: FinancialRecord[] }>('/financials/export');
    const records: FinancialRecord[] = Array.isArray(exportResponse)
      ? exportResponse
      : (exportResponse?.data ?? exportResponse?.records ?? []);
    
    // Sort records by month
    const sortedRecords = [...records].sort((a, b) => a.month.localeCompare(b.month));
    const latestRecords = sortedRecords.slice(-6); // Last 6 months
    
    // Calculate metrics
    const latestRecord = sortedRecords[sortedRecords.length - 1];
    const previousRecord = sortedRecords[sortedRecords.length - 2];
    
    // Calculate changes (if we have previous data)
    let balanceChange = '0%';
    let burnChange = '0%';
    let revenueChange = '0%';
    
    if (previousRecord && latestRecord) {
      const balanceDiff = ((latestRecord.cash_balance - previousRecord.cash_balance) / previousRecord.cash_balance) * 100;
      balanceChange = `${balanceDiff >= 0 ? '+' : ''}${balanceDiff.toFixed(1)}%`;
      
      const burnDiff = ((latestRecord.net_burn - previousRecord.net_burn) / Math.abs(previousRecord.net_burn || 1)) * 100;
      burnChange = `${burnDiff >= 0 ? '+' : ''}${burnDiff.toFixed(1)}%`;
      
      const revDiff = ((latestRecord.total_revenue - previousRecord.total_revenue) / (previousRecord.total_revenue || 1)) * 100;
      revenueChange = `${revDiff >= 0 ? '+' : ''}${revDiff.toFixed(1)}%`;
    }

    // Calculate expense breakdown from latest record
    const expenseBreakdown = latestRecord ? [
      { 
        name: 'Salaries', 
        value: latestRecord.expenses_salaries, 
        percentage: latestRecord.total_expenses > 0 ? (latestRecord.expenses_salaries / latestRecord.total_expenses) * 100 : 0,
        color: '#6366f1' // indigo
      },
      { 
        name: 'Marketing', 
        value: latestRecord.expenses_marketing, 
        percentage: latestRecord.total_expenses > 0 ? (latestRecord.expenses_marketing / latestRecord.total_expenses) * 100 : 0,
        color: '#8b5cf6' // violet
      },
      { 
        name: 'Infrastructure', 
        value: latestRecord.expenses_infrastructure, 
        percentage: latestRecord.total_expenses > 0 ? (latestRecord.expenses_infrastructure / latestRecord.total_expenses) * 100 : 0,
        color: '#06b6d4' // cyan
      },
      { 
        name: 'Other', 
        value: latestRecord.expenses_other, 
        percentage: latestRecord.total_expenses > 0 ? (latestRecord.expenses_other / latestRecord.total_expenses) * 100 : 0,
        color: '#f59e0b' // amber
      },
    ].filter(item => item.value > 0) : [];

    // Calculate revenue comparison (recurring vs one-time per month)
    // Note: We're using currentYear/previousYear fields to represent Recurring/One-Time revenue
    const revenueComparison = latestRecords.map(record => ({
      month: formatMonthName(record.month),
      currentYear: record.revenue_recurring,   // Will be labeled as "Recurring"
      previousYear: record.revenue_one_time,   // Will be labeled as "One-Time"
    }));

    const dashboardData: DashboardData = {
      runwayMonths: runway.runway_months > 100 ? 999 : runway.runway_months, // Cap at 999 for "profitable"
      metrics: [
        { 
          id: 'balance', 
          label: 'Cash Balance', 
          value: formatCurrency(runway.cash_balance), 
          change: balanceChange, 
          changeType: runway.cash_balance >= (previousRecord?.cash_balance || 0) ? 'positive' : 'negative' 
        },
        { 
          id: 'burn', 
          label: 'Net Monthly Burn', 
          value: formatCurrency(Math.abs(runway.monthly_burn_rate)), 
          change: burnChange, 
          changeType: runway.monthly_burn_rate <= 0 ? 'positive' : 'negative' // Negative burn is good (profitable)
        },
        { 
          id: 'revenue', 
          label: 'Monthly Revenue', 
          value: formatCurrency(latestRecord?.total_revenue || 0), 
          change: revenueChange, 
          changeType: revenueChange.startsWith('+') ? 'positive' : 'negative' 
        },
        { 
          id: 'runway', 
          label: 'Runway Status', 
          value: runway.status, 
          change: `${runway.runway_months > 100 ? '∞' : runway.runway_months.toFixed(1)} months`, 
          changeType: runway.status === 'Healthy' ? 'positive' : runway.status === 'Warning' ? 'neutral' : 'negative' 
        },
      ],
      cashFlow: latestRecords.map(record => ({
        month: formatMonthName(record.month),
        balance: record.cash_balance,
        income: record.total_revenue,
        expenses: record.total_expenses,
        net: record.total_revenue - record.total_expenses,
      })),
      expenseBreakdown,
      revenueComparison,
    };

    console.log('Dashboard data fetched from API.');
    console.log('Metrics:', dashboardData.metrics);
    console.log('Cash Balance from API:', runway.cash_balance);
    console.log('Latest Record:', latestRecord);
    return dashboardData;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    // Return empty/default data on error
    return {
      runwayMonths: 0,
      metrics: [
        { id: 'balance', label: 'Cash Balance', value: '$0', change: '0%', changeType: 'neutral' },
        { id: 'burn', label: 'Net Monthly Burn', value: '$0', change: '0%', changeType: 'neutral' },
        { id: 'revenue', label: 'Monthly Revenue', value: '$0', change: '0%', changeType: 'neutral' },
        { id: 'runway', label: 'Runway Status', value: 'No Data', change: 'Add financial data', changeType: 'neutral' },
      ],
      cashFlow: [],
    };
  }
};

// Report types
export type ReportType = 'monthly-summary' | 'cash-flow' | 'expense-breakdown' | 'runway-analysis' | 'revenue-analysis' | 'investor-update';

// Generate and download report
export const generateReport = async (reportType: ReportType): Promise<void> => {
  try {
    // Fetch financial data with fallback for empty data
    let runway: RunwayResponse;
    let records: FinancialRecord[];
    
    try {
      runway = await apiClient.get<RunwayResponse>('/financials/runway');
    } catch {
      // Default runway data if API fails
      runway = {
        current_month: new Date().toISOString().slice(0, 7),
        cash_balance: 0,
        monthly_burn_rate: 0,
        runway_months: 0,
        status: 'No Data',
      };
    }
    
    try {
      const exportResponse = await apiClient.get<FinancialRecord[] | { data?: FinancialRecord[] }>('/financials/export');
      records = Array.isArray(exportResponse) ? exportResponse : (exportResponse?.data ?? []);
    } catch {
      records = [];
    }
    
    const sortedRecords = [...records].sort((a, b) => a.month.localeCompare(b.month));
    
    // Generate report content based on type
    let reportContent: object;
    let reportTitle: string;
    const generatedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    switch (reportType) {
      case 'monthly-summary':
        reportTitle = 'Monthly Financial Summary';
        const latestRecord = sortedRecords[sortedRecords.length - 1];
        const previousRecord = sortedRecords[sortedRecords.length - 2];
        reportContent = {
          title: reportTitle,
          generatedDate,
          period: latestRecord?.month || 'N/A',
          summary: {
            cashBalance: formatCurrency(runway.cash_balance),
            monthlyBurnRate: formatCurrency(runway.monthly_burn_rate),
            runwayMonths: runway.runway_months.toFixed(1),
            status: runway.status,
          },
          currentMonth: latestRecord ? {
            totalRevenue: formatCurrency(latestRecord.total_revenue),
            recurringRevenue: formatCurrency(latestRecord.revenue_recurring),
            oneTimeRevenue: formatCurrency(latestRecord.revenue_one_time),
            totalExpenses: formatCurrency(latestRecord.total_expenses),
            netBurn: formatCurrency(latestRecord.net_burn),
          } : null,
          previousMonth: previousRecord ? {
            totalRevenue: formatCurrency(previousRecord.total_revenue),
            totalExpenses: formatCurrency(previousRecord.total_expenses),
            netBurn: formatCurrency(previousRecord.net_burn),
          } : null,
        };
        break;

      case 'cash-flow':
        reportTitle = 'Cash Flow Statement';
        reportContent = {
          title: reportTitle,
          generatedDate,
          currentCashBalance: formatCurrency(runway.cash_balance),
          monthlyBurnRate: formatCurrency(runway.monthly_burn_rate),
          runwayMonths: runway.runway_months.toFixed(1),
          monthlyData: sortedRecords.map(record => ({
            month: record.month,
            cashBalance: formatCurrency(record.cash_balance),
            totalInflows: formatCurrency(record.total_revenue),
            totalOutflows: formatCurrency(record.total_expenses),
            netCashFlow: formatCurrency(record.total_revenue - record.total_expenses),
          })),
        };
        break;

      case 'expense-breakdown':
        reportTitle = 'Expense Breakdown Report';
        const expenseRecords = sortedRecords.slice(-6);
        const expenseCount = expenseRecords.length || 1; // Prevent division by zero
        const avgExpenses = {
          salaries: expenseRecords.reduce((sum, r) => sum + r.expenses_salaries, 0) / expenseCount,
          marketing: expenseRecords.reduce((sum, r) => sum + r.expenses_marketing, 0) / expenseCount,
          infrastructure: expenseRecords.reduce((sum, r) => sum + r.expenses_infrastructure, 0) / expenseCount,
          other: expenseRecords.reduce((sum, r) => sum + r.expenses_other, 0) / expenseCount,
        };
        const totalAvgExpenses = avgExpenses.salaries + avgExpenses.marketing + avgExpenses.infrastructure + avgExpenses.other || 1; // Prevent division by zero
        reportContent = {
          title: reportTitle,
          generatedDate,
          period: expenseRecords.length > 0 ? `Last ${expenseRecords.length} months` : 'No data available',
          averageMonthlyExpenses: formatCurrency(totalAvgExpenses === 1 ? 0 : totalAvgExpenses),
          breakdown: {
            salaries: { amount: formatCurrency(avgExpenses.salaries), percentage: ((avgExpenses.salaries / totalAvgExpenses) * 100).toFixed(1) + '%' },
            marketing: { amount: formatCurrency(avgExpenses.marketing), percentage: ((avgExpenses.marketing / totalAvgExpenses) * 100).toFixed(1) + '%' },
            infrastructure: { amount: formatCurrency(avgExpenses.infrastructure), percentage: ((avgExpenses.infrastructure / totalAvgExpenses) * 100).toFixed(1) + '%' },
            other: { amount: formatCurrency(avgExpenses.other), percentage: ((avgExpenses.other / totalAvgExpenses) * 100).toFixed(1) + '%' },
          },
          monthlyDetails: expenseRecords.map(record => ({
            month: record.month,
            total: formatCurrency(record.total_expenses),
            salaries: formatCurrency(record.expenses_salaries),
            marketing: formatCurrency(record.expenses_marketing),
            infrastructure: formatCurrency(record.expenses_infrastructure),
            other: formatCurrency(record.expenses_other),
          })),
        };
        break;

      case 'runway-analysis':
        reportTitle = 'Runway Analysis Report';
        reportContent = {
          title: reportTitle,
          generatedDate,
          currentStatus: {
            cashBalance: formatCurrency(runway.cash_balance),
            monthlyBurnRate: formatCurrency(runway.monthly_burn_rate),
            runwayMonths: runway.runway_months > 100 ? 'Profitable (∞)' : runway.runway_months.toFixed(1) + ' months',
            status: runway.status,
          },
          projections: {
            atCurrentBurn: runway.runway_months > 100 ? 'N/A - Profitable' : `Cash depleted in ${runway.runway_months.toFixed(1)} months`,
            with10PercentReduction: runway.monthly_burn_rate > 0 
              ? `${(runway.cash_balance / (runway.monthly_burn_rate * 0.9)).toFixed(1)} months`
              : 'N/A',
            with20PercentReduction: runway.monthly_burn_rate > 0 
              ? `${(runway.cash_balance / (runway.monthly_burn_rate * 0.8)).toFixed(1)} months`
              : 'N/A',
          },
          historicalBurn: sortedRecords.slice(-6).map(record => ({
            month: record.month,
            burnRate: formatCurrency(record.net_burn),
            cashBalance: formatCurrency(record.cash_balance),
          })),
        };
        break;

      case 'revenue-analysis':
        reportTitle = 'Revenue Analysis Report';
        const revenueRecords = sortedRecords.slice(-12);
        const revenueCount = revenueRecords.length || 1; // Prevent division by zero
        const totalRevenue = revenueRecords.reduce((sum, r) => sum + r.total_revenue, 0);
        const avgRevenue = totalRevenue / revenueCount;
        const totalRecurring = revenueRecords.reduce((sum, r) => sum + r.revenue_recurring, 0);
        reportContent = {
          title: reportTitle,
          generatedDate,
          period: revenueRecords.length > 0 ? `Last ${revenueRecords.length} months` : 'No data available',
          summary: {
            totalRevenue: formatCurrency(totalRevenue),
            averageMonthlyRevenue: formatCurrency(avgRevenue),
            recurringRevenueRatio: totalRevenue > 0 
              ? ((totalRecurring / totalRevenue) * 100).toFixed(1) + '%'
              : 'N/A',
          },
          monthlyData: revenueRecords.map(record => ({
            month: record.month,
            totalRevenue: formatCurrency(record.total_revenue),
            recurringRevenue: formatCurrency(record.revenue_recurring),
            oneTimeRevenue: formatCurrency(record.revenue_one_time),
          })),
        };
        break;

      case 'investor-update':
        reportTitle = 'Investor Update Report';
        const last3Months = sortedRecords.slice(-3);
        const recentRevenue = last3Months.reduce((sum, r) => sum + r.total_revenue, 0);
        const recentExpenses = last3Months.reduce((sum, r) => sum + r.total_expenses, 0);
        reportContent = {
          title: reportTitle,
          generatedDate,
          executiveSummary: {
            cashPosition: formatCurrency(runway.cash_balance),
            runway: runway.runway_months > 100 ? 'Profitable' : `${runway.runway_months.toFixed(1)} months`,
            status: runway.status,
          },
          keyMetrics: {
            last3MonthsRevenue: formatCurrency(recentRevenue),
            last3MonthsExpenses: formatCurrency(recentExpenses),
            averageMonthlyBurn: formatCurrency(runway.monthly_burn_rate),
          },
          financialHighlights: sortedRecords.slice(-6).map(record => ({
            month: record.month,
            revenue: formatCurrency(record.total_revenue),
            expenses: formatCurrency(record.total_expenses),
            cashBalance: formatCurrency(record.cash_balance),
          })),
        };
        break;

      default:
        throw new Error('Unknown report type');
    }

    // Convert report to CSV format
    const csvContent = convertToCSV(reportType, reportContent, reportTitle, generatedDate);
    
    // Create and download the CSV report
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Failed to generate report:', error);
    throw error;
  }
};

// Helper function to convert report data to CSV format
function convertToCSV(reportType: ReportType, data: object, title: string, generatedDate: string): string {
  const lines: string[] = [];
  
  // Add header
  lines.push(`"${title}"`);
  lines.push(`"Generated on: ${generatedDate}"`);
  lines.push(''); // Empty line
  
  switch (reportType) {
    case 'monthly-summary': {
      const report = data as {
        period: string;
        summary: { cashBalance: string; monthlyBurnRate: string; runwayMonths: string; status: string };
        currentMonth: { totalRevenue: string; recurringRevenue: string; oneTimeRevenue: string; totalExpenses: string; netBurn: string } | null;
        previousMonth: { totalRevenue: string; totalExpenses: string; netBurn: string } | null;
      };
      
      lines.push('"SUMMARY"');
      lines.push('"Period","Cash Balance","Monthly Burn Rate","Runway (Months)","Status"');
      lines.push(`"${report.period}","${report.summary.cashBalance}","${report.summary.monthlyBurnRate}","${report.summary.runwayMonths}","${report.summary.status}"`);
      lines.push('');
      
      if (report.currentMonth) {
        lines.push('"CURRENT MONTH DETAILS"');
        lines.push('"Total Revenue","Recurring Revenue","One-Time Revenue","Total Expenses","Net Burn"');
        lines.push(`"${report.currentMonth.totalRevenue}","${report.currentMonth.recurringRevenue}","${report.currentMonth.oneTimeRevenue}","${report.currentMonth.totalExpenses}","${report.currentMonth.netBurn}"`);
      }
      break;
    }
    
    case 'cash-flow': {
      const report = data as {
        currentCashBalance: string;
        monthlyBurnRate: string;
        runwayMonths: string;
        monthlyData: Array<{ month: string; cashBalance: string; totalInflows: string; totalOutflows: string; netCashFlow: string }>;
      };
      
      lines.push('"CASH FLOW SUMMARY"');
      lines.push('"Current Cash Balance","Monthly Burn Rate","Runway (Months)"');
      lines.push(`"${report.currentCashBalance}","${report.monthlyBurnRate}","${report.runwayMonths}"`);
      lines.push('');
      
      lines.push('"MONTHLY CASH FLOW"');
      lines.push('"Month","Cash Balance","Total Inflows","Total Outflows","Net Cash Flow"');
      report.monthlyData.forEach(row => {
        lines.push(`"${row.month}","${row.cashBalance}","${row.totalInflows}","${row.totalOutflows}","${row.netCashFlow}"`);
      });
      break;
    }
    
    case 'expense-breakdown': {
      const report = data as {
        period: string;
        averageMonthlyExpenses: string;
        breakdown: {
          salaries: { amount: string; percentage: string };
          marketing: { amount: string; percentage: string };
          infrastructure: { amount: string; percentage: string };
          other: { amount: string; percentage: string };
        };
        monthlyDetails: Array<{ month: string; total: string; salaries: string; marketing: string; infrastructure: string; other: string }>;
      };
      
      lines.push('"EXPENSE SUMMARY"');
      lines.push(`"Period","${report.period}"`);
      lines.push(`"Average Monthly Expenses","${report.averageMonthlyExpenses}"`);
      lines.push('');
      
      lines.push('"EXPENSE BREAKDOWN"');
      lines.push('"Category","Amount","Percentage"');
      lines.push(`"Salaries","${report.breakdown.salaries.amount}","${report.breakdown.salaries.percentage}"`);
      lines.push(`"Marketing","${report.breakdown.marketing.amount}","${report.breakdown.marketing.percentage}"`);
      lines.push(`"Infrastructure","${report.breakdown.infrastructure.amount}","${report.breakdown.infrastructure.percentage}"`);
      lines.push(`"Other","${report.breakdown.other.amount}","${report.breakdown.other.percentage}"`);
      lines.push('');
      
      lines.push('"MONTHLY DETAILS"');
      lines.push('"Month","Total","Salaries","Marketing","Infrastructure","Other"');
      report.monthlyDetails.forEach(row => {
        lines.push(`"${row.month}","${row.total}","${row.salaries}","${row.marketing}","${row.infrastructure}","${row.other}"`);
      });
      break;
    }
    
    case 'runway-analysis': {
      const report = data as {
        currentStatus: { cashBalance: string; monthlyBurnRate: string; runwayMonths: string; status: string };
        projections: { atCurrentBurn: string; with10PercentReduction: string; with20PercentReduction: string };
        historicalBurn: Array<{ month: string; burnRate: string; cashBalance: string }>;
      };
      
      lines.push('"CURRENT STATUS"');
      lines.push('"Cash Balance","Monthly Burn Rate","Runway","Status"');
      lines.push(`"${report.currentStatus.cashBalance}","${report.currentStatus.monthlyBurnRate}","${report.currentStatus.runwayMonths}","${report.currentStatus.status}"`);
      lines.push('');
      
      lines.push('"RUNWAY PROJECTIONS"');
      lines.push('"Scenario","Projection"');
      lines.push(`"At Current Burn Rate","${report.projections.atCurrentBurn}"`);
      lines.push(`"With 10% Burn Reduction","${report.projections.with10PercentReduction}"`);
      lines.push(`"With 20% Burn Reduction","${report.projections.with20PercentReduction}"`);
      lines.push('');
      
      lines.push('"HISTORICAL BURN RATE"');
      lines.push('"Month","Burn Rate","Cash Balance"');
      report.historicalBurn.forEach(row => {
        lines.push(`"${row.month}","${row.burnRate}","${row.cashBalance}"`);
      });
      break;
    }
    
    case 'revenue-analysis': {
      const report = data as {
        period: string;
        summary: { totalRevenue: string; averageMonthlyRevenue: string; recurringRevenueRatio: string };
        monthlyData: Array<{ month: string; totalRevenue: string; recurringRevenue: string; oneTimeRevenue: string }>;
      };
      
      lines.push('"REVENUE SUMMARY"');
      lines.push(`"Period","${report.period}"`);
      lines.push(`"Total Revenue","${report.summary.totalRevenue}"`);
      lines.push(`"Average Monthly Revenue","${report.summary.averageMonthlyRevenue}"`);
      lines.push(`"Recurring Revenue Ratio","${report.summary.recurringRevenueRatio}"`);
      lines.push('');
      
      lines.push('"MONTHLY REVENUE"');
      lines.push('"Month","Total Revenue","Recurring Revenue","One-Time Revenue"');
      report.monthlyData.forEach(row => {
        lines.push(`"${row.month}","${row.totalRevenue}","${row.recurringRevenue}","${row.oneTimeRevenue}"`);
      });
      break;
    }
    
    case 'investor-update': {
      const report = data as {
        executiveSummary: { cashPosition: string; runway: string; status: string };
        keyMetrics: { last3MonthsRevenue: string; last3MonthsExpenses: string; averageMonthlyBurn: string };
        financialHighlights: Array<{ month: string; revenue: string; expenses: string; cashBalance: string }>;
      };
      
      lines.push('"EXECUTIVE SUMMARY"');
      lines.push('"Cash Position","Runway","Status"');
      lines.push(`"${report.executiveSummary.cashPosition}","${report.executiveSummary.runway}","${report.executiveSummary.status}"`);
      lines.push('');
      
      lines.push('"KEY METRICS (Last 3 Months)"');
      lines.push('"Metric","Value"');
      lines.push(`"Total Revenue","${report.keyMetrics.last3MonthsRevenue}"`);
      lines.push(`"Total Expenses","${report.keyMetrics.last3MonthsExpenses}"`);
      lines.push(`"Average Monthly Burn","${report.keyMetrics.averageMonthlyBurn}"`);
      lines.push('');
      
      lines.push('"FINANCIAL HIGHLIGHTS"');
      lines.push('"Month","Revenue","Expenses","Cash Balance"');
      report.financialHighlights.forEach(row => {
        lines.push(`"${row.month}","${row.revenue}","${row.expenses}","${row.cashBalance}"`);
      });
      break;
    }
  }
  
  return lines.join('\n');
}
