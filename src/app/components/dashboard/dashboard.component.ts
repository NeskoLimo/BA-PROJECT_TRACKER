import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgClass, DatePipe, PercentPipe } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, DatePipe],
  template: `
    <div class="dashboard">

      <!-- Header -->
      <div class="dash-header">
        <div>
          <p class="section-label">Overview</p>
          <h1 class="dash-title">Portfolio Dashboard</h1>
          <p class="dash-sub">{{ stats().total }} active projects across your portfolio</p>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Total Projects</span>
            <span class="kpi-icon">◈</span>
          </div>
          <span class="kpi-number">{{ stats().total }}</span>
          <div class="progress-bar"><div class="progress-fill" [style.width.%]="100"></div></div>
        </div>
        <div class="kpi-card kpi-green">
          <div class="kpi-top">
            <span class="kpi-label">On Track</span>
            <span class="kpi-icon green">●</span>
          </div>
          <span class="kpi-number">{{ stats().onTrack }}</span>
          <div class="progress-bar"><div class="progress-fill green-fill" [style.width.%]="(stats().onTrack / stats().total) * 100"></div></div>
        </div>
        <div class="kpi-card kpi-amber">
          <div class="kpi-top">
            <span class="kpi-label">At Risk</span>
            <span class="kpi-icon amber">●</span>
          </div>
          <span class="kpi-number">{{ stats().atRisk }}</span>
          <div class="progress-bar"><div class="progress-fill amber-fill" [style.width.%]="(stats().atRisk / stats().total) * 100"></div></div>
        </div>
        <div class="kpi-card kpi-red">
          <div class="kpi-top">
            <span class="kpi-label">Delayed</span>
            <span class="kpi-icon red">●</span>
          </div>
          <span class="kpi-number">{{ stats().delayed }}</span>
          <div class="progress-bar"><div class="progress-fill red-fill" [style.width.%]="(stats().delayed / stats().total) * 100"></div></div>
        </div>
        <div class="kpi-card kpi-blue">
          <div class="kpi-top">
            <span class="kpi-label">Completed</span>
            <span class="kpi-icon blue">●</span>
          </div>
          <span class="kpi-number">{{ stats().completed }}</span>
          <div class="progress-bar"><div class="progress-fill" [style.width.%]="(stats().completed / stats().total) * 100"></div></div>
        </div>
        <div class="kpi-card kpi-avg">
          <div class="kpi-top">
            <span class="kpi-label">Avg. Progress</span>
            <span class="kpi-icon">◎</span>
          </div>
          <span class="kpi-number">{{ stats().avgProgress }}<small>%</small></span>
          <div class="progress-bar"><div class="progress-fill" [style.width.%]="stats().avgProgress"></div></div>
        </div>
      </div>

      <!-- Projects Table -->
      <div class="card dash-table-card">
        <div class="card-header">
          <h2 class="card-title">All Projects</h2>
          <a routerLink="/projects" class="btn btn-ghost">View All →</a>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Status</th>
                <th>Phase</th>
                <th>Progress</th>
                <th>Owner</th>
                <th>Due Date</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              @for (project of projects(); track project.id) {
                <tr>
                  <td><strong>{{ project.name }}</strong></td>
                  <td>
                    <span class="badge" [ngClass]="getBadgeClass(project.status)">
                      {{ project.status }}
                    </span>
                  </td>
                  <td>{{ project.phase }}</td>
                  <td>
                    <div class="progress-cell">
                      <div class="progress-bar" style="width:120px">
                        <div class="progress-fill" [style.width.%]="project.progress"></div>
                      </div>
                      <span class="progress-pct">{{ project.progress }}%</span>
                    </div>
                  </td>
                  <td>{{ project.owner }}</td>
                  <td>{{ project.dueDate | date:'dd MMM yy' }}</td>
                  <td>
                    <span class="priority-chip" [ngClass]="'priority-' + project.priority.toLowerCase()">
                      {{ project.priority }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Bottom Row: At Risk + Milestones -->
      <div class="dash-bottom">
        <!-- At-Risk Projects -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Needs Attention</h2>
            <span class="badge badge-at-risk">{{ atRiskProjects().length }} items</span>
          </div>
          @if (atRiskProjects().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">✓</span>
              <p class="empty-title">All clear!</p>
              <p class="empty-sub">No projects at risk or delayed</p>
            </div>
          }
          @for (p of atRiskProjects(); track p.id) {
            <div class="attention-item">
              <div class="attention-left">
                <span class="badge" [ngClass]="getBadgeClass(p.status)">{{ p.status }}</span>
                <strong>{{ p.name }}</strong>
              </div>
              <div class="attention-right">
                <div class="progress-bar" style="width:80px">
                  <div class="progress-fill" [style.width.%]="p.progress"
                    [style.background]="p.status === 'Delayed' ? 'var(--red-400)' : 'var(--amber-400)'">
                  </div>
                </div>
                <span class="progress-pct">{{ p.progress }}%</span>
              </div>
            </div>
          }
        </div>

        <!-- Upcoming Milestones -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Upcoming Milestones</h2>
          </div>
          @if (upcomingMilestones().length === 0) {
            <div class="empty-state">
              <span class="empty-icon">🎯</span>
              <p class="empty-title">No upcoming milestones</p>
            </div>
          }
          @for (m of upcomingMilestones(); track m.id) {
            <div class="milestone-item">
              <div class="milestone-dot" [class.done]="m.completed"></div>
              <div class="milestone-body">
                <strong>{{ m.title }}</strong>
                <span>{{ m.projectName }}</span>
              </div>
              <span class="milestone-date">{{ m.dueDate | date:'dd MMM' }}</span>
            </div>
          }
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard { max-width: 1200px; }
    .dash-header { margin-bottom: 28px; }
    .dash-title { font-size: clamp(24px, 3vw, 36px); font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary); line-height: 1.1; }
    .dash-sub { font-family: var(--font-mono); font-size: 12px; color: var(--text-muted); margin-top: 6px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; margin-bottom: 24px; }
    @media (max-width: 1100px) { .kpi-grid { grid-template-columns: repeat(3,1fr); } }
    @media (max-width: 600px)  { .kpi-grid { grid-template-columns: repeat(2,1fr); } }
    .kpi-card {
      background: rgba(9,20,40,0.7); border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md); padding: 20px;
      transition: border-color var(--transition), box-shadow var(--transition);
    }
    .kpi-card:hover { border-color: var(--border-mid); box-shadow: var(--glow-sm); }
    .kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
    .kpi-label { font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); }
    .kpi-icon { font-size: 14px; color: var(--blue-400); }
    .kpi-icon.green { color: var(--green-400); text-shadow: 0 0 8px var(--green-400); }
    .kpi-icon.amber { color: var(--amber-400); text-shadow: 0 0 8px var(--amber-400); }
    .kpi-icon.red   { color: var(--red-400);   text-shadow: 0 0 8px var(--red-400); }
    .kpi-icon.blue  { color: var(--blue-300);  text-shadow: 0 0 8px var(--blue-300); }
    .kpi-number { display: block; font-size: 32px; font-weight: 800; color: var(--text-primary); line-height: 1; margin-bottom: 12px; }
    .kpi-number small { font-size: 18px; font-weight: 600; color: var(--text-secondary); }
    .green-fill { background: linear-gradient(90deg, #166534, var(--green-400)); box-shadow: 0 0 8px rgba(74,222,128,0.4); }
    .amber-fill { background: linear-gradient(90deg, #92400e, var(--amber-400)); box-shadow: 0 0 8px rgba(251,191,36,0.4); }
    .red-fill   { background: linear-gradient(90deg, #991b1b, var(--red-400));   box-shadow: 0 0 8px rgba(248,113,113,0.4); }

    .dash-table-card { padding: 0; overflow: hidden; margin-bottom: 24px; }
    .card-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border-subtle); }
    .card-title { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .table-wrap { overflow-x: auto; }
    .progress-cell { display: flex; align-items: center; gap: 8px; }
    .progress-pct { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); white-space: nowrap; }
    .priority-chip { font-family: var(--font-mono); font-size: 10px; padding: 2px 8px; border-radius: 3px; font-weight: 500; }
    .priority-critical { background: rgba(248,113,113,0.15); color: var(--red-400); }
    .priority-high     { background: rgba(251,191,36,0.12);  color: var(--amber-400); }
    .priority-medium   { background: rgba(96,165,250,0.12);  color: var(--blue-300); }
    .priority-low      { background: rgba(74,222,128,0.10);  color: var(--green-400); }

    .dash-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media (max-width: 700px) { .dash-bottom { grid-template-columns: 1fr; } }
    .dash-bottom .card { padding: 0; overflow: hidden; }
    .dash-bottom .card-header { padding: 18px 20px; }

    .attention-item { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 20px; border-bottom: 1px solid rgba(59,130,246,0.05); }
    .attention-item:last-child { border-bottom: none; }
    .attention-left { display: flex; align-items: center; gap: 10px; }
    .attention-left strong { font-size: 13px; color: var(--text-primary); }
    .attention-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .milestone-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; border-bottom: 1px solid rgba(59,130,246,0.05); }
    .milestone-item:last-child { border-bottom: none; }
    .milestone-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border-mid); border: 1px solid var(--blue-400); flex-shrink: 0; }
    .milestone-dot.done { background: var(--green-400); border-color: var(--green-400); box-shadow: 0 0 6px var(--green-400); }
    .milestone-body { flex: 1; }
    .milestone-body strong { display: block; font-size: 13px; color: var(--text-primary); }
    .milestone-body span { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }
    .milestone-date { font-family: var(--font-mono); font-size: 11px; color: var(--blue-300); white-space: nowrap; }
  `]
})
export class DashboardComponent {
  private svc = inject(ProjectService);
  stats = this.svc.stats;
  projects = this.svc.projects;

  atRiskProjects() {
    return this.svc.projects().filter(p => p.status === 'At Risk' || p.status === 'Delayed');
  }

  upcomingMilestones() {
    const result: any[] = [];
    const today = new Date();
    this.svc.projects().forEach(p => {
      p.milestones.forEach(m => {
        if (!m.completed) {
          result.push({ ...m, projectName: p.name });
        }
      });
    });
    return result
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 6);
  }

  getBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'On Track': 'badge badge-on-track',
      'At Risk':  'badge badge-at-risk',
      'Delayed':  'badge badge-delayed',
      'Completed':'badge badge-completed',
      'Planning': 'badge badge-planning'
    };
    return map[status] || 'badge';
  }
}
