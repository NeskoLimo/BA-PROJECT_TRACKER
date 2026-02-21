import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="nav-left">
        <span class="system-tag">PRJ-TRK // REGISTRY</span>
      </div>

      <div class="nav-right" *ngIf="auth.currentUser()">
        <div class="user-info">
          <span class="user-role">{{ auth.currentUser()?.role }}</span>
          <div class="avatar" (click)="toggleMenu()">
            {{ auth.currentUser()?.name?.charAt(0) }}
          </div>
        </div>

        <div class="user-dropdown" *ngIf="showMenu">
          <div class="dropdown-header">
            <div class="dropdown-name">{{ auth.currentUser()?.name }}</div>
            <div class="dropdown-email">{{ auth.currentUser()?.email }}</div>
          </div>
          <div class="divider"></div>
          <button (click)="logout()" class="logout-btn">Sign Out</button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      height: 60px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      z-index: 1000;
    }
    .system-tag { font-family: 'Courier New', monospace; font-weight: bold; color: #64748b; font-size: 14px; }
    .user-info { display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .user-role { font-size: 11px; font-weight: 700; color: #3b82f6; text-transform: uppercase; background: #eff6ff; padding: 2px 8px; border-radius: 4px; }
    .avatar { width: 32px; height: 32px; background: #0f172a; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .user-dropdown { position: absolute; top: 55px; right: 24px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); width: 200px; padding: 8px; }
    .dropdown-header { padding: 8px 12px; }
    .dropdown-name { font-weight: 600; font-size: 14px; color: #1e293b; }
    .dropdown-email { font-size: 12px; color: #64748b; }
    .divider { height: 1px; background: #e2e8f0; margin: 8px 0; }
    .logout-btn { width: 100%; text-align: left; padding: 8px 12px; background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px; font-weight: 500; }
  `]
})
export class NavbarComponent {
  // MUST be public to be accessed by the template
  public auth = inject(AuthService);
  showMenu = false;

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  logout() {
    this.auth.logout();
    this.showMenu = false;
  }
}
