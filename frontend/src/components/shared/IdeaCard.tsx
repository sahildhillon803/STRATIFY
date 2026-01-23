import type { Idea } from '@/types/ideation.types';
import { Lightbulb, Target, Gauge, GanttChartSquare, Loader2, ArrowRight } from 'lucide-react';
import { useGenerateRoadmap } from '@/hooks/useRoadmaps';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

const MarketOpportunityIndicator = ({ level }: { level: Idea['marketOpportunity'] }) => {
  const styles = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-warning/10 text-warning',
    high: 'bg-success/10 text-success',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg capitalize ${styles[level]}`}>
      {level}
    </span>
  );
};

const FeasibilityBar = ({ value }: { value: number }) => {
  const percentage = (value / 10) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-600">{value}/10</span>
    </div>
  );
};

export function IdeaCard({ idea }: { idea: Idea }) {
  const navigate = useNavigate();
  const { mutate: generate, isPending } = useGenerateRoadmap();

  const handleGenerateRoadmap = () => {
    // Pass both title and description for more context
    generate({ title: idea.title, description: idea.description }, {
      onSuccess: (newRoadmap) => {
        navigate(`/roadmaps/${newRoadmap.id}`);
      },
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all flex flex-col h-full group">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 group-hover:bg-primary-100 transition-colors flex-shrink-0">
          <Lightbulb className="h-5 w-5 text-primary-500" />
        </div>
        <h3 className="font-semibold text-gray-900 leading-tight">{idea.title}</h3>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 flex-grow mb-4 line-clamp-5">{idea.description}</p>

      {/* Metrics */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" /> Feasibility
            </span>
          </div>
          <FeasibilityBar value={idea.feasibility} />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Target className="h-3.5 w-3.5" /> Market Opportunity
          </span>
          <MarketOpportunityIndicator level={idea.marketOpportunity} />
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5">
        <Button 
          onClick={handleGenerateRoadmap} 
          disabled={isPending} 
          variant="outline"
          className="w-full group/btn"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <GanttChartSquare className="h-4 w-4 mr-2" />
              Generate Roadmap
              <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
