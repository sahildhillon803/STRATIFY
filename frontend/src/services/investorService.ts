export interface InvestorMatch {
  investor_id: number;
  name: string;
  match_score: number;
  website: string;
  hq: string;
  type: string;
}

export interface MatchResults {
  status: string;
  top_investors: InvestorMatch[];
}

export interface FilterOptions {
  hqs: string[];
  stages: string[];
}

export const fetchMatchedInvestors = async (
  description: string, 
  raiseAmount: number, 
  stage: string
): Promise<MatchResults> => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    
    // We now send a JSON body instead of URL query parameters
    const response = await fetch(`${baseUrl}/api/v1/ai/match/investors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startup_description: description,
        raise_amount: raiseAmount,
        stage: stage
      })
    });

    if (!response.ok) {
      throw new Error(`Error fetching matches: ${response.status}`);
    }

    const data: MatchResults = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch matched investors:", error);
    throw error;
  }
};

export const fetchFilterOptions = async (): Promise<FilterOptions> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const response = await fetch(`${baseUrl}/api/v1/ai/match/filter-options`);
  if (!response.ok) throw new Error("Failed to fetch filter options");
  return await response.json();
};

export const fetchFilteredInvestors = async (
  stage: string,
  hq: string,
  sortBy: string,
  skip = 0
): Promise<{ investors: InvestorMatch[], total: number }> => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  // Build query parameters
  const params = new URLSearchParams({
    stage,
    hq,
    sort_by: sortBy,
    limit: '50', // Fetch 50 at a time per page
    skip: skip.toString()
  });
  
  const response = await fetch(`${baseUrl}/api/v1/ai/match/all?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch filtered investors");
  const data = await response.json();
  return { investors: data.investors, total: data.total };
};