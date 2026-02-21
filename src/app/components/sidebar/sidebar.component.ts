import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar-container">
      <nav class="nav-stack">
        <a routerLink="/dashboard" routerLinkActive="active-link" class="nav-anchor">
          <span class="icon-slot">🏠</span>
          <span class="label-slot">Dashboard</span>
        </a>
        <a routerLink="/projects" routerLinkActive="active-link" class="nav-anchor">
          <span class="icon-slot">📁</span>
          <span class="label-slot">Projects</span>
        </a>
        
        <a routerLink="/repository" routerLinkActive="active-link" class="nav-anchor">
          <span class="icon-slot">📚</span>
          <span class="label-slot">Repository</span>
        </a>

        <a routerLink="/reports" routerLinkActive="active-link" class="nav-anchor">
          <span class="icon-slot">📈</span>
          <span class="label-slot">Reports</span>
        </a>

        <a routerLink="/support" routerLinkActive="active-link" class="nav-anchor">
          <span class="icon-slot">💬</span>
          <span class="label-slot">Support</span>
        </a>

        <a routerLink="/settings" routerLinkActive="active-link" class="nav-anchor">
          <span class="icon-slot">⚙️</span>
          <span class="label-slot">Settings</span>
        </a>
      </nav>
      
      <footer class="version-container">
        <code class="version-tag">v1.1.0</code>
      </footer>
    </aside>
  `,
  styles: [`
    .sidebar-container {
      position: fixed;
      top: 60px;
      left: 0;
      width: 240px;
      height: calc(100vh - 60px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      border-right: 1px solid;
      z-index: 100;
    }

    .nav-stack {
      display: flex;
      flex-direction: column;
      padding: 15px;
    }

    .nav-anchor {
      display: flex;
      align-items: center;
      padding: 12px;
      text-decoration: none;
      transition: opacity 0.2s;
    }

    .icon-slot {
      width: 25px;
      display: flex;
      justify-content: center;
      margin-right: 10px;
    }

    .label-slot {
      flex-grow: 1;
    }

    .version-container {
      padding: 20px;
      text-align: center;
    }

    .version-tag {
      font-size: 0.8rem;
    }

    /* Target class for active router state */
    .active-link {
      font-weight: bold;
    }
  `]
})
export class SidebarComponent {}
