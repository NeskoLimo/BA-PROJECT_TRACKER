import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">⬡</div>
        <div>
          <p class="brand-title">BA Tracker</p>
          <p class="brand-sub">Project Intelligence</p>
        </div>
      </div>
      <nav class="sidebar-nav">
        <p class="nav-group-label">Navigation</p>
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">◈</span> Dashboard
        </a>
        <a routerLink="/projects" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">◉</span> Projects
          <span class="nav-badge">{{ stats().total }}</span>
        </a>
        <a routerLink="/reports" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">◎</span> Reports
        </a>
      </nav>
      <div class="sidebar-stats">
        <p class="nav-group-label">Portfolio Health</p>
        <div class="mini-stat"><span class="mini-dot on-track"></span><span class="mini-label">On Track</span><span class="mini-val">{{ stats().onTrack }}</span></div>
        <div class="mini-stat"><span class="mini-dot at-risk"></span><span class="mini-label">At Risk</span><span class="mini-val">{{ stats().atRisk }}</span></div>
        <div class="mini-stat"><span class="mini-dot delayed"></span><span class="mini-label">Delayed</span><span class="mini-val">{{ stats().delayed }}</span></div>
        <div class="mini-stat"><span class="mini-dot completed"></span><span class="mini-label">Completed</span><span class="mini-val">{{ stats().completed }}</span></div>
      </div>
      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="user-avatar">BA</div>
          <div><p class="user-name">Business Analyst</p><p class="user-role">Project Lead</p></div>
          <span class="user-status"></span>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar { grid-area: sidebar; background: rgba(5,14,31,0.95); border-right: 1px solid var(--border-subtle); display: flex; flex-direction: column; height: 100vh; position: sticky; top: 0; backdrop-filter: blur(20px); }
    .sidebar-brand { display: flex; align-items: center; gap: 12px; padding: 0 20px; border-bottom: 1px solid var(--border-subtle); height: var(--nav-h); flex-shrink: 0; }
    .brand-icon { font-size: 22px; color: var(--blue-400); line-height: 1; }
    .brand-title { font-size: 14px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
    .brand-sub { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; }
    .sidebar-nav { padding: 24px 12px 12px; flex: 1; }
    .nav-group-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--text-muted); padding: 0 10px; margin-bottom: 8px; }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; color: var(--text-muted); text-decoration: none; transition: all var(--transition); margin-bottom: 2px; border: 1px solid transparent; }
    .nav-item:hover { color: var(--text-secondary); background: rgba(59,130,246,0.06); }
    .nav-item.active { color: var(--blue-300); background: rgba(37,99,235,0.12); border-color: rgba(59,130,246,0.18); }
    .nav-icon { font-size: 14px; color: var(--blue-400); }
    .nav-badge { margin-left: auto; font-family: var(--font-mono); font-size: 10px; background: rgba(37,99,235,0.2); color: var(--blue-300); padding: 1px 7px; border-radius: 100px; }
    .sidebar-stats { padding: 16px 20px; border-top: 1px solid var(--border-subtle); }
    .sidebar-stats .nav-group-label { padding: 0; margin-bottom: 12px; }
    .mini-stat { display: flex; align-items: center; gap: 8px; padding: 5px 0; font-size: 12px; }
    .mini-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .mini-dot.on-track  { background: var(--green-400); box-shadow: 0 0 6px var(--green-400); }
    .mini-dot.at-risk   { background: var(--amber-400); box-shadow: 0 0 6px var(--amber-400); }
    .mini-dot.delayed   { background: var(--red-400);   box-shadow: 0 0 6px var(--red-400); }
    .mini-dot.completed { background: var(--blue-300);  box-shadow: 0 0 6px var(--blue-300); }
    .mini-label { flex: 1; color: var(--text-muted); }
    .mini-val { font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); }
    .sidebar-footer { padding: 16px 12px; border-top: 1px solid var(--border-subtle); }
    .user-chip { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: var(--radius-md); background: rgba(37,99,235,0.06); border: 1px solid var(--border-subtle); position: relative; }
    .user-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, var(--blue-600), var(--blue-400)); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .user-name { font-size: 12px; font-weight: 600; color: var(--text-primary); }
    .user-role { font-family: var(--font-mono); font-size: 9px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; }
    .user-status { position: absolute; top: 10px; right: 10px; width: 7px; height: 7px; border-radius: 50%; background: var(--green-400); box-shadow: 0 0 8px var(--green-400); }
    @media (max-width: 900px) { .sidebar { display: none; } }
  `]
})
export class SidebarComponent {
  private projectService = inject(ProjectService);
  stats = this.projectService.stats;
}
