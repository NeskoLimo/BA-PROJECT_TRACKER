// src/app/components/sidebar/sidebar.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">Dashboard</span>
        </a>
        <a routerLink="/projects" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📁</span>
          <span class="nav-label">Projects</span>
        </a>
        <a routerLink="/reports" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">📈</span>
          <span class="nav-label">Reports</span>
        </a>
        <a routerLink="/settings" routerLinkActive="active" class="nav-item">
          <span class="nav-icon">⚙️</span>
          <span class="nav-label">Settings</span>
        </a>
      </nav>
      <div class="sidebar-footer">
        <div class="version">v1.0.0</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 60px;
      left: 0;
      width: 220px;
      height: calc(100vh - 60px);
      background: #f7f9fc;
      border-right: 1px solid #e8ecf0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 20px 0;
      z-index: 90;
    }
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 0 12px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 8px;
      text-decoration: none;
      color: #4a5568;
      font-family: 'Georgia', serif;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    .nav-item:hover {
      background: #edf2f7;
      color: #1a2332;
    }
    .nav-item.active {
      background: #1a2332;
      color: #ffffff;
    }
    .nav-icon {
      font-size: 16px;
      width: 20px;
      text-align: center;
    }
    .sidebar-footer {
      padding: 0 26px;
    }
    .version {
      font-size: 11px;
      color: #a0aec0;
      font-family: monospace;
    }
  `]
})
export class SidebarComponent {}
