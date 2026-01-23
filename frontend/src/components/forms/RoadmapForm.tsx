import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { useUiStore } from '@/stores/ui.store';
import { useGenerateRoadmap } from '@/hooks/useRoadmaps';
import { Map, Loader2, FileText, Sparkles } from 'lucide-react';

const roadmapSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  useAI: z.boolean(),
});

type RoadmapFormData = z.infer<typeof roadmapSchema>;

export function RoadmapForm() {
  const { closeModal } = useUiStore();
  const { mutate: generateRoadmap, isPending } = useGenerateRoadmap();
  const [useAI, setUseAI] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoadmapFormData>({
    resolver: zodResolver(roadmapSchema),
    defaultValues: {
      title: '',
      description: '',
      useAI: true,
    },
  });

  const onSubmit = (data: RoadmapFormData) => {
    generateRoadmap({ title: data.title, description: data.description }, {
      onSuccess: (newRoadmap) => {
        closeModal();
        window.location.href = `/roadmaps/${newRoadmap.id}`;
      },
    });
  };

  const inputClasses = "block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* AI Toggle */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setUseAI(true)}
          className={`flex-1 p-4 rounded-xl border-2 transition-all ${
            useAI 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Sparkles className={`h-5 w-5 mx-auto mb-2 ${useAI ? 'text-primary-500' : 'text-gray-400'}`} />
          <p className={`text-sm font-medium ${useAI ? 'text-primary-700' : 'text-gray-700'}`}>AI Generated</p>
          <p className="text-xs text-gray-500 mt-1">AI creates milestones</p>
        </button>
        <button
          type="button"
          onClick={() => setUseAI(false)}
          className={`flex-1 p-4 rounded-xl border-2 transition-all ${
            !useAI 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <FileText className={`h-5 w-5 mx-auto mb-2 ${!useAI ? 'text-primary-500' : 'text-gray-400'}`} />
          <p className={`text-sm font-medium ${!useAI ? 'text-primary-700' : 'text-gray-700'}`}>Manual</p>
          <p className="text-xs text-gray-500 mt-1">Create from scratch</p>
        </button>
      </div>

      {/* Roadmap Title */}
      <div>
        <label htmlFor="title" className={labelClasses}>
          {useAI ? 'Strategy or Goal' : 'Roadmap Title'}
        </label>
        <div className="relative">
          <Map className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            {...register('title')} 
            id="title" 
            placeholder={useAI ? "e.g., Expand to enterprise market" : "e.g., Q1 2026 Product Roadmap"}
            className={`${inputClasses} pl-10`}
          />
        </div>
        {errors.title && <p className="text-danger text-sm mt-1">{errors.title.message}</p>}
        {useAI && (
          <p className="text-xs text-gray-400 mt-1">
            AI will generate milestones and action items based on this goal.
          </p>
        )}
      </div>

      {/* Description (optional) */}
      {!useAI && (
        <div>
          <label htmlFor="description" className={labelClasses}>Description (optional)</label>
          <textarea 
            {...register('description')} 
            id="description" 
            rows={3}
            placeholder="Brief description of this roadmap..."
            className={inputClasses}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button 
          type="button" 
          variant="outline" 
          onClick={closeModal} 
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {useAI ? 'Generating...' : 'Creating...'}
            </>
          ) : (
            <>
              {useAI ? <Sparkles className="h-4 w-4 mr-2" /> : <Map className="h-4 w-4 mr-2" />}
              {useAI ? 'Generate Roadmap' : 'Create Roadmap'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
