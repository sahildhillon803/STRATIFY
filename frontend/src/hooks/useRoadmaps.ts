import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoadmaps, getRoadmapById, generateRoadmapFromIdea, toggleTaskCompletion } from '@/services/roadmap.service';

export const useRoadmaps = () => {
  return useQuery({
    queryKey: ['roadmaps'],
    queryFn: getRoadmaps,
  });
};

export const useRoadmap = (id: string) => {
  return useQuery({
    queryKey: ['roadmaps', id],
    queryFn: () => getRoadmapById(id),
    enabled: !!id, // Only run this query if an ID is provided
  });
};

export const useGenerateRoadmap = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (idea: { title: string; description?: string }) => 
            generateRoadmapFromIdea(idea.title, idea.description),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
        }
    });
};

export const useToggleTask = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ roadmapId, phaseId, taskId }: { roadmapId: string; phaseId: string; taskId: string }) => 
            toggleTaskCompletion(roadmapId, phaseId, taskId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['roadmaps', variables.roadmapId] });
            queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
        }
    });
};
