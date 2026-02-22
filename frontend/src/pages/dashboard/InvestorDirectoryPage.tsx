import React, { useEffect, useState } from 'react';
import { InvestorCard } from '@/components/shared/InvestorCard';
import { fetchFilterOptions, fetchFilteredInvestors, type InvestorMatch, type FilterOptions } from '@/services/investorService';

const LIMIT = 50;

export const InvestorDirectoryPage = () => {
  const [investors, setInvestors] = useState<InvestorMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ hqs: [], stages: [] });
  const [totalCount, setTotalCount] = useState(0);

  // Filter & Pagination States
  const [stageFilter, setStageFilter] = useState('All');
  const [hqFilter, setHqFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name_asc');
  const [skip, setSkip] = useState(0);

  // 1. Load filter dropdown options on page load
  useEffect(() => {
    const loadOptions = async () => {
        try {
            const options = await fetchFilterOptions();
            setFilterOptions(options);
        } catch (error) {
            console.error("Failed to load filter options", error);
        }
    };
    loadOptions();
  }, []);

  // 2. Reset skip to 0 whenever a user changes a filter
  useEffect(() => {
    setSkip(0);
  }, [stageFilter, hqFilter, sortBy]);

  // 3. Fetch investors whenever filters or skip changes
  useEffect(() => {
    const loadInvestors = async () => {
      // Show main loader if it's a fresh search, otherwise just show the small "loading more" spinner
      if (skip === 0) setLoading(true);
      else setLoadingMore(true);

      try {
        const data = await fetchFilteredInvestors(stageFilter, hqFilter, sortBy, skip);
        
        if (skip === 0) {
          // Fresh search: replace the list
          setInvestors(data.investors);
        } else {
          // Load more: append to the bottom of the existing list
          setInvestors(prev => [...prev, ...data.investors]);
        }
        
        setTotalCount(data.total);
      } catch (error) {
        console.error("Failed to load investors directory", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    loadInvestors();
  }, [stageFilter, hqFilter, sortBy, skip]);

  return (
    <div className="space-y-6 font-['Inter']">
      {/* --- Header & Filters Section --- */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Investor Directory</h1>
                <p className="text-gray-500">Browsing {totalCount} investors available on Startify.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Investment Stage</label>
                <select 
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="All">All Stages</option>
                    {filterOptions.stages.map(stage => (
                        <option key={stage} value={stage}>{stage}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Headquarters</label>
                <select 
                    value={hqFilter}
                    onChange={(e) => setHqFilter(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="All">All Locations</option>
                    {filterOptions.hqs.map(hq => (
                        <option key={hq} value={hq}>{hq}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2.5 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="name_asc">Name (A-Z)</option>
                    <option value="name_desc">Name (Z-A)</option>
                    <option value="cheque_desc">Cheque Size (High to Low)</option>
                </select>
            </div>
        </div>
      </div>

      {/* --- Results Grid --- */}
      {loading ? (
        <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading database...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investors.map((investor) => (
              <InvestorCard key={`${investor.investor_id}-${investor.name}`} investor={investor} />
            ))}
          </div>
          
          {/* LOAD MORE BUTTON */}
          {investors.length < totalCount && (
            <div className="flex justify-center mt-8 pb-8">
              <button
                onClick={() => setSkip(prev => prev + LIMIT)}
                disabled={loadingMore}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  'Load More Investors'
                )}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && investors.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No investors found matching your filters.</p>
          </div>
      )}
    </div>
  );
};