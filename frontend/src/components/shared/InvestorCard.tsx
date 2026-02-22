import React from 'react';
import type { InvestorMatch } from '@/services/investorService';

interface Props {
  investor: InvestorMatch;
}

export const InvestorCard: React.FC<Props> = ({ investor }) => {
  // Convert similarity score to a clean percentage
  const matchPercent = Math.round(investor.match_score * 100);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          {/* Render the real VC Name! */}
          <h3 className="text-xl font-bold text-gray-900 truncate">{investor.name}</h3>
          <p className="text-sm text-gray-500 font-medium mt-1">{investor.type} • {investor.hq}</p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-700">
          {matchPercent}% Match
        </span>
      </div>

      <a 
        href={investor.website} 
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-medium py-2 px-4 rounded-lg transition-colors"
      >
        View Profile
      </a>
    </div>
  );
};