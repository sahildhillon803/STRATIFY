import React, { useEffect, useState } from 'react';
import { fetchMatchedInvestors, type InvestorMatch } from '@/services/investorService';
import { InvestorCard } from '@/components/shared/InvestorCard';

// THIS LINE is what TypeScript is looking for!
export const InvestorMatchList: React.FC<{ startupId: number }> = ({ startupId }) => {
  const [investors, setInvestors] = useState<InvestorMatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Inside your InvestorMatchList.tsx component...

  useEffect(() => {
    const getMatches = async () => {
      try {
        setLoading(true);
        
        // 1. Define the startup's current profile for the AI to analyze
        const startupPitch = "We are an AI-driven SaaS platform that automates financial reporting and matches startup founders with venture capital investors using machine learning.";
        const raisingAmount = 250000; // Looking for $250k
        const currentStage = "Early Revenue"; // Match this to OpenVC stages
        
        // 2. Send it to the backend
        const results = await fetchMatchedInvestors(startupPitch, raisingAmount, currentStage);
        setInvestors(results.top_investors);
      } catch (error) {
        console.error("Failed to load matches", error);
      } finally {
        setLoading(false);
      }
    };

    getMatches();
  }, [startupId]);

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500 font-medium animate-pulse">
        Running Startify AI Engine...
      </div>
    );
  }

  return (
    <div className="w-full mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investors.map((inv) => (
          <InvestorCard key={inv.investor_id} investor={inv} />
        ))}
      </div>
    </div>
  );
};