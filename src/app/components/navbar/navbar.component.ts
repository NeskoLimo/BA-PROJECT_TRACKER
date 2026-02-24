// src/app/components/navbar/navbar.component.ts
import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="navbar">

      <!-- Brand -->
      <div class="navbar-brand">
        <div class="brand-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="#4fa8a8"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="#f5a623"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="#e05252"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="#4fa8a8" opacity="0.5"/>
          </svg>
        </div>
        <span class="brand-name">BA Project Tracker</span>
      </div>

      <!-- Right section -->
      <div class="navbar-right">

        <!-- Live indicator -->
        <div class="live-badge">
          <span class="live-dot"></span>
          <span class="live-text">Live</span>
        </div>

        <!-- Divider -->
        <div class="nav-divider"></div>

        <!-- Date -->
        <span class="nav-date">{{ currentDate }}</span>

        <!-- Divider -->
        <div class="nav-divider"></div>

        <!-- User menu -->
        <div class="user-menu" *ngIf="auth.user()">
          <div class="user-pill" (click)="toggleMenu()" [class.active]="showMenu">
            <div class="avatar">{{ auth.user()?.avatar }}</div>
            <div class="user-meta">
              <span class="user-role-badge">{{ auth.user()?.role }}</span>
            </div>
            <svg class="chevron" [class.rotated]="showMenu" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <!-- Dropdown -->
          <div class="dropdown" *ngIf="showMenu">
            <div class="dropdown-header">
              <div class="dropdown-avatar">{{ auth.user()?.avatar }}</div>
              <div class="dropdown-info">
                <div class="dropdown-name">{{ auth.user()?.name }}</div>
                <div class="dropdown-email">{{ auth.user()?.email }}</div>
              </div>
            </div>
            <div class="dropdown-role-row">
              <span class="dropdown-role-chip">{{ auth.user()?.role }}</span>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item signout" (click)="logout()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    /* ── Base ─────────────────────────────────────────────────── */
    :host {
      display: block;
      position: fixed;
      top: 0; left: 250px; right: 0;   /* offset for sidebar width */
      z-index: 100;
    }

    .navbar {
      height: 60px;
      background: #ffffff;
      border-bottom: 1px solid #e8ecf1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      box-shadow: 0 1px 0 rgba(0,0,0,0.04);
    }

    /* ── Brand ─────────────────────────────────────────────────── */
    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-logo {
      width: 32px;
      height: 32px;
      background: #f0f4f8;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e2e8f0;
    }

    .brand-name {
      font-size: 15px;
      font-weight: 700;
      color: #1a2332;
      letter-spacing: -0.2px;
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }

    /* ── Right section ─────────────────────────────────────────── */
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    /* Live badge — matches the green dot + "Live" text in the dashboard */
    .live-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 20px;
      padding: 4px 10px;
    }

    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #22c55e;
      box-shadow: 0 0 0 2px rgba(34,197,94,0.25);
      animation: pulse-live 2.2s ease-in-out infinite;
      flex-shrink: 0;
    }

    @keyframes pulse-live {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
      50%       { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
    }

    .live-text {
      font-size: 11px;
      font-weight: 700;
      color: #16a34a;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }

    /* Date */
    .nav-date {
      font-size: 12px;
      color: #94a3b8;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      white-space: nowrap;
    }

    /* Vertical divider */
    .nav-divider {
      width: 1px;
      height: 20px;
      background: #e2e8f0;
      flex-shrink: 0;
    }

    /* ── User pill ──────────────────────────────────────────────── */
    .user-menu {
      position: relative;
    }

    .user-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 5px 10px 5px 5px;
      border-radius: 24px;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.18s ease;
      user-select: none;
    }

    .user-pill:hover,
    .user-pill.active {
      background: #f0f4f8;
      border-color: #cbd5e1;
      box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    }

    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1a2332 0%, #2d3f55 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      flex-shrink: 0;
    }

    .user-meta {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .user-role-badge {
      font-size: 11px;
      font-weight: 700;
      color: #4fa8a8;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }

    .chevron {
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }
    .chevron.rotated {
      transform: rotate(180deg);
    }

    /* ── Dropdown ──────────────────────────────────────────────── */
    .dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 240px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow:
        0 4px 6px -1px rgba(0,0,0,0.07),
        0 10px 32px -4px rgba(0,0,0,0.12);
      overflow: hidden;
      animation: dropdown-in 0.18s ease both;
    }

    @keyframes dropdown-in {
      from { opacity: 0; transform: translateY(-6px) scale(0.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .dropdown-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 16px 12px;
    }

    .dropdown-avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1a2332 0%, #2d3f55 100%);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 700;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      flex-shrink: 0;
    }

    .dropdown-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .dropdown-name {
      font-size: 13px;
      font-weight: 700;
      color: #1a2332;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-email {
      font-size: 11px;
      color: #94a3b8;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-role-row {
      padding: 0 16px 12px;
    }

    .dropdown-role-chip {
      display: inline-flex;
      align-items: center;
      padding: 3px 10px;
      border-radius: 20px;
      background: #f0fdfa;
      border: 1px solid #99f6e4;
      font-size: 10px;
      font-weight: 700;
      color: #0f766e;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      font-family: 'Inter', 'Segoe UI', sans-serif;
    }

    .dropdown-divider {
      height: 1px;
      background: #f1f5f9;
      margin: 0;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 12px 16px;
      border: none;
      background: none;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      text-align: left;
    }

    .dropdown-item.signout {
      color: #ef4444;
    }
    .dropdown-item.signout:hover {
      background: #fef2f2;
      color: #dc2626;
    }

    /* ── Responsive: full-width when no sidebar ─────────────────── */
    @media (max-width: 768px) {
      :host { left: 0; }
      .nav-date { display: none; }
      .nav-divider:first-of-type { display: none; }
    }
  `]
})
export class NavbarComponent {
  showMenu = false;

  get currentDate(): string {
    return new Date().toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  constructor(public auth: AuthService) {}

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.showMenu = false;
    }
  }

  logout() {
    this.showMenu = false;
    this.auth.logout();
  }
}
