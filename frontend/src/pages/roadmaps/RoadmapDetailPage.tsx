import { useParams, Link } from 'react-router-dom';
import { useRoadmap, useToggleTask } from '@/hooks/useRoadmaps';
import { Loader2, CheckCircle, Circle, ArrowLeft, Clock, Target, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function RoadmapDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: roadmap, isLoading, isError } = useRoadmap(id!);
  const toggleTask = useToggleTask();

  if (isLoading) {
    return (
      <div data-testid="loader" className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (isError || !roadmap) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100 shadow-card">
        <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Roadmap not found</h3>
        <p className="text-sm text-gray-500 mb-4">The roadmap you're looking for doesn't exist.</p>
        <Link to="/roadmaps">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Roadmaps
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate overall progress
  const totalTasks = roadmap.phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = roadmap.phases.reduce(
    (acc, phase) => acc + phase.tasks.filter(t => t.isCompleted).length, 0
  );
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/roadmaps" className="inline-flex items-center text-sm text-gray-500 hover:text-primary-500 transition-colors">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Roadmaps
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{roadmap.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {roadmap.totalDurationWeeks} weeks
              </span>
              <span className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {roadmap.phases.length} phases
              </span>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{progressPercentage}%</p>
              <p className="text-xs text-gray-500">{completedTasks}/{totalTasks} tasks</p>
            </div>
            <div className="w-24 h-24 relative">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#f3f4f6"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#1B8A6B"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercentage * 2.51} 251`}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {roadmap.phases.map((phase, index) => {
          const phaseTasks = phase.tasks.length;
          const phaseCompleted = phase.tasks.filter(t => t.isCompleted).length;
          const phaseProgress = phaseTasks > 0 ? Math.round((phaseCompleted / phaseTasks) * 100) : 0;

          return (
            <div key={phase.id} className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
              {/* Phase Header */}
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    phaseProgress === 100 ? 'bg-success/10 text-success' : 'bg-primary-50 text-primary-500'
                  }`}>
                    {phaseProgress === 100 ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{phase.name}</h2>
                    <p className="text-xs text-gray-500">{phase.durationWeeks} weeks • {phaseCompleted}/{phaseTasks} tasks</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        phaseProgress === 100 ? 'bg-success' : 'bg-primary-500'
                      }`}
                      style={{ width: `${phaseProgress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-10 text-right">{phaseProgress}%</span>
                </div>
              </div>

              {/* Phase Description */}
              {phase.description && (
                <p className="px-5 py-3 text-sm text-gray-500 bg-gray-50 border-b border-gray-100">
                  {phase.description}
                </p>
              )}

              {/* Tasks */}
              <div className="p-5 space-y-4">
                {phase.tasks.map(task => (
                  <div 
                    key={task.id}
                    className={`rounded-xl transition-colors ${
                      task.isCompleted ? 'bg-success/5' : 'bg-gray-50'
                    }`}
                  >
                    <button 
                      onClick={() => toggleTask.mutate({ 
                        roadmapId: roadmap.id, 
                        phaseId: phase.id, 
                        taskId: task.id 
                      })}
                      disabled={toggleTask.isPending}
                      className={`w-full flex items-start gap-3 p-4 cursor-pointer text-left hover:bg-gray-100/50 rounded-t-xl ${
                        toggleTask.isPending ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {task.isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className={`font-medium ${
                          task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}>
                          {task.title}
                        </span>
                        {task.description && (
                          <p className={`mt-1 text-sm leading-relaxed ${
                            task.isCompleted ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
