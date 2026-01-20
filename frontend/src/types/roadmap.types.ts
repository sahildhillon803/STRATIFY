export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
}

export interface Phase {
  id: string;
  phaseNumber: number;
  name: string;
  description: string;
  durationWeeks: number;
  tasks: Task[];
}

export interface Roadmap {
  id: string;
  title: string;
  description?: string;
  totalDurationWeeks: number;
  progress: number; // Percentage from 0 to 100
  phases: Phase[];
  milestones?: string[];
}
