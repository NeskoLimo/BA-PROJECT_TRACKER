
// src/app/components/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-icon">📊</span>
        <span class="brand-name">BA Project Tracker</span>
      </div>
      <div class="navbar-right">
        <div class="user-info" *ngIf="auth.user()">
          <span class="user-role">{{ auth.user()?.role }}</span>
          <div class="user-menu">
            <div class="avatar" (click)="showMenu = !showMenu">{{ auth.user()?.avatar }}</div>
            <div class="dropdown" *ngIf="showMenu">
              <div class="dropdown-header">
                <div class="dropdown-name">{{ auth.user()?.name }}</div>
                <div class="dropdown-email">{{ auth.user()?.email }}</div>
              </div>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" (click)="logout()">🚪 Sign Out</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; height: 60px; z-index: 100;
      background: #fff; border-bottom: 1px solid #e8ecf0;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .navbar-brand { display: flex; align-items: center; gap: 10px; }
    .brand-icon { font-size: 22px; }
    .brand-name { font-size: 16px; font-weight: 700; font-family: 'Georgia', serif; color: #1a2332; }
    .navbar-right { display: flex; align-items: center; gap: 16px; }
    .user-role { font-size: 11px; font-weight: 700; color: #a0aec0; text-transform: uppercase; letter-spacing: 0.5px; }
    .user-menu { position: relative; }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%; background: #1a2332;
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'Georgia', serif;
      user-select: none;
    }
    .avatar:hover { background: #2d3748; }
    .dropdown {
      position: absolute; top: 44px; right: 0; background: #fff;
      border: 1px solid #e8ecf0; border-radius: 10px; width: 200px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1); z-index: 200;
    }
    .dropdown-header { padding: 14px 16px; }
    .dropdown-name { font-size: 13px; font-weight: 700; color: #1a2332; }
    .dropdown-email { font-size: 11px; color: #a0aec0; margin-top: 2px; word-break: break-all; }
    .dropdown-divider { height: 1px; background: #e8ecf0; }
    .dropdown-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 16px; border: none; background: none; font-size: 13px; color: #e53e3e; cursor: pointer; font-weight: 600; }
    .dropdown-item:hover { background: #fde8e8; }
  `]
})
export class NavbarComponent {
  showMenu = false;
  constructor(public auth: AuthService) {}
  logout() { this.showMenu = false; this.auth.logout(); }
}
