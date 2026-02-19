export type ProjectStatus = 'On Track' | 'At Risk' | 'Delayed' | 'Completed' | 'Planning';
export type Priority      = 'Critical' | 'High' | 'Medium' | 'Low';
export type Phase         = 'Discovery' | 'Analysis' | 'Design' | 'Development' | 'Testing' | 'Deployment' | 'Closed';

export interface Project {
  id:          string;
  name:        string;
  description: string;
  status:      ProjectStatus;
  priority:    Priority;
  phase:       Phase;
  owner:       string;
  sponsor:     string;
  startDate:   string;
  dueDate:     string;
  progress:    number;      // 0–100
  budget:      number;
  budgetSpent: number;
  tags:        string[];
  milestones:  Milestone[];
  risks:       Risk[];
  createdAt:   string;
}

export interface Milestone {
  id:          string;
  title:       string;
  dueDate:     string;
  completed:   boolean;
}

export interface Risk {
  id:          string;
  description: string;
  likelihood:  'High' | 'Medium' | 'Low';
  impact:      'High' | 'Medium' | 'Low';
  mitigation:  string;
}

export interface DashboardStats {
  total:      number;
  onTrack:    number;
  atRisk:     number;
  delayed:    number;
  completed:  number;
  planning:   number;
  avgProgress: number;
}
