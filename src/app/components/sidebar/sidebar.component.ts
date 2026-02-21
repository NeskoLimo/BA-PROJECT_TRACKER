import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="nav-container">
        <nav class="nav-list">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            <span class="icon">🏠</span>
            <span class="label">Dashboard</span>
          </a>
          <a routerLink="/projects" routerLinkActive="active" class="nav-link">
            <span class="icon">📁</span>
            <span class="label">Projects</span>
          </a>
          <a routerLink="/repository" routerLinkActive="active" class="nav-link">
            <span class="icon">📚</span>
          </a>
          <a routerLink="/reports" routerLinkActive="active" class="nav-link">
            <span class="icon">📈</span>
            <span class="label">Reports</span>
          </a>
          
          <div class="divider"></div>
          
          <a routerLink="/support" routerLinkActive="active" class="nav-link">
            <span class="icon">💬</span>
            <span class="label">Support & AI</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active" class="nav-link">
            <span class="icon">⚙️</span>
            <span class="label">Settings</span>
          </a>
        </nav>
      </div>
      <div class="sidebar-footer">
        <span class="version-badge">v1.1.0</span>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 60px;
      left: 0;
      width: 240px;
      height: calc(100vh - 60px);
      background: #1a1c1e; /* Deep obsidian for a sleek profile */
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-right: 1px solid #2d2f31;
      z-index: 100;
    }

    .nav-container {
      padding: 24px 16px;
    }

    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      text-decoration: none;
      color: #94a3b8; /* Muted slate */
      font-size: 14px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #f8fafc;
    }

    .nav-link.active {
      background: #3b82f6; /* Modern electric blue accent */
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }

    .icon {
      font-size: 18px;
      width: 20px;
      display: flex;
      justify-content: center;
    }

    .divider {
      height: 1px;
      background: #2d2f31;
      margin: 16px 8px;
    }

    .sidebar-footer {
      padding: 24px;
      border-top: 1px solid #2d2f31;
    }

    .version-badge {
      font-family: 'Courier New', monospace;
      font-size: 10px;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
  `]
})
export class SidebarComponent {}
