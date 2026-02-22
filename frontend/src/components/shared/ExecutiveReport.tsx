import React, { useEffect } from 'react';
import { useCfoStore } from '../../stores/cfo.store';

export const ExecutiveReport = () => {
  const { monthlyReport, isGeneratingReport, fetchExecutiveReport } = useCfoStore();

  useEffect(() => {
    // Automatically compile the report if it doesn't exist on load
    if (!monthlyReport && !isGeneratingReport) {
      fetchExecutiveReport();
    }
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Monthly Board Update</h2>
        <button 
          onClick={fetchExecutiveReport}
          disabled={isGeneratingReport}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          {isGeneratingReport ? 'Compiling...' : '↻ Refresh Report'}
        </button>
      </div>

      <div className="prose prose-sm max-w-none text-gray-600">
        {isGeneratingReport ? (
          <div className="animate-pulse flex flex-col gap-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : monthlyReport ? (
          <div className="whitespace-pre-wrap">{monthlyReport}</div>
        ) : (
          <p>No financial data available for the summary.</p>
        )}
      </div>
    </div>
  );
};