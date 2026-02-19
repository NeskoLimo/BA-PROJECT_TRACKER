import { Injectable, signal, computed } from '@angular/core';
import { Project, DashboardStats, ProjectStatus } from '../models/project.model';

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'CRM System Migration',
    description: 'Full migration of legacy CRM to Salesforce with data cleansing and process redesign.',
    status: 'On Track',
    priority: 'Critical',
    phase: 'Development',
    owner: 'You',
    sponsor: 'Jane Kamau (COO)',
    startDate: '2025-01-15',
    dueDate: '2025-06-30',
    progress: 62,
    budget: 850000,
    budgetSpent: 520000,
    tags: ['CRM', 'Migration', 'Salesforce'],
    milestones: [
      { id: 'm1', title: 'Requirements Sign-off', dueDate: '2025-02-01', completed: true },
      { id: 'm2', title: 'Data Mapping Complete', dueDate: '2025-03-15', completed: true },
      { id: 'm3', title: 'UAT Start', dueDate: '2025-05-01', completed: false },
      { id: 'm4', title: 'Go-Live', dueDate: '2025-06-30', completed: false }
    ],
    risks: [
      { id: 'r1', description: 'Data quality issues in legacy system', likelihood: 'High', impact: 'High', mitigation: 'Dedicated data cleansing sprint planned' }
    ],
    createdAt: '2025-01-10'
  },
  {
    id: '2',
    name: 'HR Onboarding Portal',
    description: 'Digital self-service onboarding portal for new hires across all 5 offices.',
    status: 'At Risk',
    priority: 'High',
    phase: 'Testing',
    owner: 'You',
    sponsor: 'David Osei (CHRO)',
    startDate: '2025-02-01',
    dueDate: '2025-05-31',
    progress: 78,
    budget: 320000,
    budgetSpent: 295000,
    tags: ['HR', 'Portal', 'UX'],
    milestones: [
      { id: 'm5', title: 'Wireframes Approved', dueDate: '2025-02-20', completed: true },
      { id: 'm6', title: 'Dev Complete', dueDate: '2025-04-15', completed: true },
      { id: 'm7', title: 'UAT Sign-off', dueDate: '2025-05-20', completed: false },
      { id: 'm8', title: 'Launch', dueDate: '2025-05-31', completed: false }
    ],
    risks: [
      { id: 'r2', description: 'Budget nearly exhausted before UAT complete', likelihood: 'High', impact: 'Medium', mitigation: 'Escalated to sponsor for budget review' }
    ],
    createdAt: '2025-01-25'
  },
  {
    id: '3',
    name: 'Supply Chain Analytics',
    description: 'BI dashboard for real-time supply chain visibility and predictive inventory alerts.',
    status: 'Planning',
    priority: 'Medium',
    phase: 'Discovery',
    owner: 'You',
    sponsor: 'Amina Wanjiru (CFO)',
    startDate: '2025-04-01',
    dueDate: '2025-10-31',
    progress: 8,
    budget: 1200000,
    budgetSpent: 45000,
    tags: ['Analytics', 'BI', 'Supply Chain'],
    milestones: [
      { id: 'm9', title: 'Stakeholder Interviews', dueDate: '2025-04-30', completed: false },
      { id: 'm10', title: 'BRD Sign-off', dueDate: '2025-06-01', completed: false }
    ],
    risks: [],
    createdAt: '2025-03-15'
  },
  {
    id: '4',
    name: 'Compliance Automation',
    description: 'Automate KYC and AML compliance checks to reduce manual review time by 70%.',
    status: 'Delayed',
    priority: 'Critical',
    phase: 'Analysis',
    owner: 'You',
    sponsor: 'Peter Mwangi (CCO)',
    startDate: '2024-11-01',
    dueDate: '2025-03-31',
    progress: 35,
    budget: 680000,
    budgetSpent: 410000,
    tags: ['Compliance', 'Automation', 'FinTech'],
    milestones: [
      { id: 'm11', title: 'Regulatory Mapping', dueDate: '2024-12-15', completed: true },
      { id: 'm12', title: 'Process Design', dueDate: '2025-02-01', completed: false },
      { id: 'm13', title: 'MVP Launch', dueDate: '2025-03-31', completed: false }
    ],
    risks: [
      { id: 'r3', description: 'Regulatory interpretation changes', likelihood: 'Medium', impact: 'High', mitigation: 'Legal review scheduled monthly' },
      { id: 'r4', description: 'API integration delays from 3rd party', likelihood: 'High', impact: 'High', mitigation: 'Parallel vendor escalation initiated' }
    ],
    createdAt: '2024-10-20'
  },
  {
    id: '5',
    name: 'Customer 360 Platform',
    description: 'Unified customer data platform consolidating 8 data sources into single view.',
    status: 'Completed',
    priority: 'High',
    phase: 'Closed',
    owner: 'You',
    sponsor: 'Grace Achieng (CMO)',
    startDate: '2024-06-01',
    dueDate: '2024-12-31',
    progress: 100,
    budget: 950000,
    budgetSpent: 920000,
    tags: ['CDP', 'Data', 'Marketing'],
    milestones: [
      { id: 'm14', title: 'Discovery', dueDate: '2024-07-01', completed: true },
      { id: 'm15', title: 'Build', dueDate: '2024-10-01', completed: true },
      { id: 'm16', title: 'Launch', dueDate: '2024-12-31', completed: true }
    ],
    risks: [],
    createdAt: '2024-05-15'
  }
];

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private _projects = signal<Project[]>(this.loadFromStorage());

  readonly projects = this._projects.asReadonly();

  readonly stats = computed<DashboardStats>(() => {
    const p = this._projects();
    return {
      total:       p.length,
      onTrack:     p.filter(x => x.status === 'On Track').length,
      atRisk:      p.filter(x => x.status === 'At Risk').length,
      delayed:     p.filter(x => x.status === 'Delayed').length,
      completed:   p.filter(x => x.status === 'Completed').length,
      planning:    p.filter(x => x.status === 'Planning').length,
      avgProgress: p.length
        ? Math.round(p.reduce((s, x) => s + x.progress, 0) / p.length)
        : 0
    };
  });

  getById(id: string): Project | undefined {
    return this._projects().find(p => p.id === id);
  }

  add(project: Omit<Project, 'id' | 'createdAt' | 'milestones' | 'risks'>): Project {
    const newProject: Project = {
      ...project,
      id:         Date.now().toString(),
      createdAt:  new Date().toISOString().split('T')[0],
      milestones: [],
      risks:      []
    };
    this._projects.update(list => [...list, newProject]);
    this.saveToStorage();
    return newProject;
  }

  update(id: string, changes: Partial<Project>): void {
    this._projects.update(list =>
      list.map(p => p.id === id ? { ...p, ...changes } : p)
    );
    this.saveToStorage();
  }

  delete(id: string): void {
    this._projects.update(list => list.filter(p => p.id !== id));
    this.saveToStorage();
  }

  filterBy(status?: ProjectStatus, search?: string): Project[] {
    return this._projects().filter(p => {
      const matchStatus = !status || p.status === status;
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.owner.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }

  private loadFromStorage(): Project[] {
    try {
      const saved = localStorage.getItem('ba_projects');
      return saved ? JSON.parse(saved) : MOCK_PROJECTS;
    } catch {
      return MOCK_PROJECTS;
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('ba_projects', JSON.stringify(this._projects()));
    } catch { /* storage unavailable */ }
  }
}
