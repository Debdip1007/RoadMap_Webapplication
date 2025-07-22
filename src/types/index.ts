export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyGoal {
  id: string;
  user_id: string;
  roadmap_type: string;
  week_number: string;
  focus_area: string;
  topics: string[];
  goals: string[];
  deliverables: string[];
  reference: Reference[];
  created_at: string;
  updated_at: string;
}

export interface Reference {
  type: string;
  title?: string;
  section?: string;
  book?: string;
  chapters?: string[];
  url?: string;
}

export interface Task {
  id: string;
  user_id: string;
  weekly_goal_id: string;
  title: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  roadmap_type: string;
  total_tasks: number;
  completed_tasks: number;
  progress_percentage: number;
  updated_at: string;
}

export interface RoadmapData {
  title: string;
  description?: string;
  weeks: WeekData[];
  advanced_topics?: AdvancedTopic[];
  prerequisites?: string[];
  checklist?: string[];
}

export interface WeekData {
  week: string;
  focus: string;
  topics: string[];
  goals: string[];
  deliverables: string[];
  reference?: Reference[];
}

export interface AdvancedTopic {
  topic: string;
  description: string;
  recommended_time: string;
  deliverables?: string[];
  references?: Reference[];
}

export type RoadmapType = 'qiskit' | 'qutip' | 'superconductivity' | 'custom';