// ... existing imports above ...

export class DashboardComponent implements OnInit {
  // Sample Data (Extended from your snippet)
  projects: Project[] = [
    { name: 'ERP Migration', pm: 'Alice M.', status: 'Active', deadline: 'Feb 25', daysRemaining: 5, country: 'Kenya', currency: 'KES', budget: 850000, spent: 612000, successRate: 92 },
    { name: 'CRM Integration', pm: 'James K.', status: 'Active', deadline: 'Mar 1', daysRemaining: 9, country: 'Uganda', currency: 'UGX', budget: 500000, spent: 400000, successRate: 85 },
    { name: 'HR Portal', pm: 'Sarah T.', status: 'On Hold', deadline: 'Mar 8', daysRemaining: 16, country: 'USA', currency: 'USD', budget: 150000, spent: 50000, successRate: 78 },
    { name: 'Data Warehouse', pm: 'David O.', status: 'Completed', deadline: 'Mar 15', daysRemaining: 23, country: 'Kenya', currency: 'KES', budget: 700000, spent: 650000, successRate: 71 },
    { name: 'Mobile App v2', pm: 'Linda N.', status: 'Planning', deadline: 'Mar 20', daysRemaining: 28, country: 'Uganda', currency: 'UGX', budget: 200000, spent: 0, successRate: 65 },
    { name: 'Security Audit', pm: 'Unassigned', status: 'Planning', deadline: 'Apr 1', daysRemaining: 40, country: 'Kenya', currency: 'KES', budget: 100000, spent: 0, successRate: 0 }
  ];

  kpis: KPI[] = [];
  pmPerformance: PMPerformance[] = [
    { name: 'Alice M.', rate: 92 },
    { name: 'James K.', rate: 85 },
    { name: 'Sarah T.', rate: 78 },
    { name: 'David O.', rate: 71 },
    { name: 'Linda N.', rate: 65 }
  ];

  storytellingTagline: string = '';

  constructor() {}

  // CRITICAL FIX: Implementation of ngOnInit to resolve TS2420
  ngOnInit(): void {
    this.calculateKPIs();
    this.generateStorytellingTagline();
  }

  private calculateKPIs(): void {
    const active = this.projects.filter(p => p.status === 'Active').length;
    const completed = this.projects.filter(p => p.status === 'Completed').length;
    const urgent = this.projects.filter(p => p.daysRemaining < 7).length;

    this.kpis = [
      { title: 'Active Projects', value: active, icon: '🚀', color: 'blue', change: '+2 this week' },
      { title: 'Upcoming Deadlines', value: urgent, icon: '⏰', color: 'yellow' },
      { title: 'Completed', value: completed, icon: '✅', color: 'check' },
      { title: 'Avg Success Rate', value: 78, icon: '📈', color: 'green' }
    ];
  }

  private generateStorytellingTagline(): void {
    const urgentCount = this.projects.filter(p => p.daysRemaining < 7).length;
    if (urgentCount > 2) {
      this.storytellingTagline = `Portfolio is under pressure: ${urgentCount} projects are due within 7 days.`;
    } else {
      this.storytellingTagline = "Portfolio status is stable. 82% of projects are on track for Q1 milestones.";
    }
  }

  // UI Helper Methods
  getMood(): string {
    const urgent = this.projects.filter(p => p.daysRemaining < 7).length;
    if (urgent > 2) return 'critical';
    if (urgent > 0) return 'warning';
    return 'positive';
  }

  getMoodEmoji(): string {
    const mood = this.getMood();
    return mood === 'critical' ? '🚨' : mood === 'warning' ? '⚠️' : '🌟';
  }

  getBarColor(rate: number): string {
    if (rate > 85) return '#22c55e'; // Green
    if (rate > 70) return '#3b82f6'; // Blue
    return '#f59e0b'; // Amber
  }

  getMarkerColor(days: number): string {
    if (days < 7) return '#ef4444'; // Red
    if (days < 14) return '#f59e0b'; // Amber
    return '#3b82f6'; // Blue
  }
}
