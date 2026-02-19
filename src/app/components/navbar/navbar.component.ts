import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="topnav">
      <div class="topnav-left">
        <div class="page-breadcrumb">
          <span class="breadcrumb-app">BA Tracker</span>
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-page">{{ getPageTitle() }}</span>
        </div>
      </div>
      <div class="topnav-right">
        <div class="topnav-date">
          <span class="date-label">Today</span>
          <span class="date-val">{{ today }}</span>
        </div>
        <div class="topnav-divider"></div>
        <a routerLink="/projects" class="topnav-add-btn">
          <span>+</span> New Project
        </a>
      </div>
    </header>
  `,
  styles: [`
    .topnav {
      grid-area: topnav;
      height: var(--nav-h);
      background: rgba(5,14,31,0.85);
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 clamp(16px, 3vw, 40px);
      backdrop-filter: blur(20px);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .page-breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 12px;
    }
    .breadcrumb-app { color: var(--text-muted); }
    .breadcrumb-sep { color: var(--text-muted); opacity: 0.4; }
    .breadcrumb-page { color: var(--blue-300); font-weight: 500; }
    .topnav-right { display: flex; align-items: center; gap: 16px; }
    .topnav-date { display: flex; flex-direction: column; align-items: flex-end; }
    .date-label { font-family: var(--font-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--text-muted); }
    .date-val { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); }
    .topnav-divider { width: 1px; height: 28px; background: var(--border-subtle); }
    .topnav-add-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px;
      background: linear-gradient(135deg, var(--blue-600), var(--blue-500));
      color: var(--text-primary);
      font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
      border-radius: var(--radius-sm);
      border: 1px solid var(--blue-400);
      box-shadow: var(--glow-sm);
      text-decoration: none;
      transition: all var(--transition);
    }
    .topnav-add-btn:hover { box-shadow: var(--glow-md); transform: translateY(-1px); }
  `]
})
export class NavbarComponent {
  private router = inject(Router);

  today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('dashboard')) return 'Dashboard';
    if (url.includes('projects')) return 'Projects';
    if (url.includes('reports'))  return 'Reports';
    return 'Dashboard';
  }
}
