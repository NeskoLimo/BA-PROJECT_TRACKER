// src/app/components/settings/settings.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Manage your account and application preferences</p>
        </div>
      </div>

      <!-- Settings Layout -->
      <div class="settings-layout">

        <!-- Left Menu -->
        <div class="settings-menu">
          <button class="menu-item" *ngFor="let tab of tabs"
            [class.active]="activeTab === tab.id"
            (click)="activeTab = tab.id">
            <span class="menu-icon">{{ tab.icon }}</span>
            <span class="menu-label">{{ tab.label }}</span>
          </button>
        </div>

        <!-- Content Panel -->
        <div class="settings-content">

          <!-- Profile -->
          <div *ngIf="activeTab === 'profile'">
            <div class="section-header">
              <h2 class="section-title">Profile & Account</h2>
              <p class="section-desc">Update your personal information and account details.</p>
            </div>
            <div class="form-card">
              <div class="avatar-row">
                <div class="avatar">NL</div>
                <div>
                  <div class="avatar-name">NeskoLimo</div>
                  <div class="avatar-role">Administrator</div>
                </div>
                <button class="btn-secondary">Change Photo</button>
              </div>
              <div class="divider"></div>
              <div class="form-grid">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" [(ngModel)]="profile.firstName" />
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" [(ngModel)]="profile.lastName" />
                </div>
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" [(ngModel)]="profile.email" />
                </div>
                <div class="form-group">
                  <label>Phone Number</label>
                  <input type="tel" [(ngModel)]="profile.phone" />
                </div>
                <div class="form-group full-width">
                  <label>Job Title</label>
                  <input type="text" [(ngModel)]="profile.title" />
                </div>
                <div class="form-group full-width">
                  <label>Department</label>
                  <input type="text" [(ngModel)]="profile.department" />
                </div>
              </div>
              <div class="form-actions">
                <button class="btn-secondary">Cancel</button>
                <button class="btn-primary" (click)="save('Profile')">Save Changes</button>
              </div>
            </div>

            <div class="form-card">
              <h3 class="card-subtitle-title">Change Password</h3>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>Current Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div class="form-group">
                  <label>New Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
                <div class="form-group">
                  <label>Confirm New Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div class="form-actions">
                <button class="btn-primary" (click)="save('Password')">Update Password</button>
              </div>
            </div>
          </div>

          <!-- Preferences -->
          <div *ngIf="activeTab === 'preferences'">
            <div class="section-header">
              <h2 class="section-title">App Preferences</h2>
              <p class="section-desc">Customize how the application looks and behaves.</p>
            </div>
            <div class="form-card">
              <div class="pref-row">
                <div class="pref-info">
                  <div class="pref-label">Language</div>
                  <div class="pref-desc">Select your preferred display language</div>
                </div>
                <select class="pref-select" [(ngModel)]="prefs.language">
                  <option value="en">English</option>
                  <option value="fr">French</option>
                  <option value="sw">Swahili</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
              <div class="divider"></div>
              <div class="pref-row">
                <div class="pref-info">
                  <div class="pref-label">Timezone</div>
                  <div class="pref-desc">Used for dates and deadlines</div>
                </div>
                <select class="pref-select" [(ngModel)]="prefs.timezone">
                  <option value="Africa/Nairobi">Africa/Nairobi (GMT+3)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New_York (GMT-5)</option>
                  <option value="Europe/London">Europe/London (GMT+0)</option>
                </select>
              </div>
              <div class="divider"></div>
              <div class="pref-row">
                <div class="pref-info">
                  <div class="pref-label">Date Format</div>
                  <div class="pref-desc">How dates are displayed across the app</div>
                </div>
                <select class="pref-select" [(ngModel)]="prefs.dateFormat">
                  <option value="MMM d, y">MMM d, y (Feb 20, 2026)</option>
                  <option value="dd/MM/yyyy">dd/MM/yyyy (20/02/2026)</option>
                  <option value="MM/dd/yyyy">MM/dd/yyyy (02/20/2026)</option>
                  <option value="yyyy-MM-dd">yyyy-MM-dd (2026-02-20)</option>
                </select>
              </div>
              <div class="divider"></div>
              <div class="pref-row">
                <div class="pref-info">
                  <div class="pref-label">Currency</div>
                  <div class="pref-desc">Default currency for budget figures</div>
                </div>
                <select class="pref-select" [(ngModel)]="prefs.currency">
                  <option value="USD">USD ($)</option>
                  <option value="KES">KES (KSh)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div class="divider"></div>
              <div class="pref-row">
                <div class="pref-info">
                  <div class="pref-label">Default Page Size</div>
                  <div class="pref-desc">Number of rows shown in tables by default</div>
                </div>
                <select class="pref-select" [(ngModel)]="prefs.pageSize">
                  <option value="5">5 rows</option>
                  <option value="10">10 rows</option>
                  <option value="20">20 rows</option>
                  <option value="50">50 rows</option>
                </select>
              </div>
              <div class="form-actions">
                <button class="btn-primary" (click)="save('Preferences')">Save Preferences</button>
              </div>
            </div>
          </div>

          <!-- Notifications -->
          <div *ngIf="activeTab === 'notifications'">
            <div class="section-header">
              <h2 class="section-title">Notifications</h2>
              <p class="section-desc">Control when and how you receive alerts.</p>
            </div>
            <div class="form-card">
              <h3 class="card-subtitle-title">Email Notifications</h3>
              <div class="toggle-row" *ngFor="let n of emailNotifs">
                <div class="toggle-info">
                  <div class="toggle-label">{{ n.label }}</div>
                  <div class="toggle-desc">{{ n.desc }}</div>
                </div>
                <div class="toggle-switch" [class.on]="n.enabled" (click)="n.enabled = !n.enabled">
                  <div class="toggle-knob"></div>
                </div>
              </div>
              <div class="divider"></div>
              <h3 class="card-subtitle-title">In-App Notifications</h3>
              <div class="toggle-row" *ngFor="let n of appNotifs">
                <div class="toggle-info">
                  <div class="toggle-label">{{ n.label }}</div>
                  <div class="toggle-desc">{{ n.desc }}</div>
                </div>
                <div class="toggle-switch" [class.on]="n.enabled" (click)="n.enabled = !n.enabled">
                  <div class="toggle-knob"></div>
                </div>
              </div>
              <div class="form-actions">
                <button class="btn-primary" (click)="save('Notifications')">Save Preferences</button>
              </div>
            </div>
          </div>

          <!-- Roles & Permissions -->
          <div *ngIf="activeTab === 'roles'">
            <div class="section-header">
              <h2 class="section-title">User Roles & Permissions</h2>
              <p class="section-desc">Define what each role can access and do.</p>
            </div>
            <div class="form-card">
              <table class="roles-table">
                <thead>
                  <tr>
                    <th>Permission</th>
                    <th>Admin</th>
                    <th>PM</th>
                    <th>BA</th>
                    <th>Viewer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let perm of permissions">
                    <td class="perm-name">{{ perm.name }}</td>
                    <td><span class="perm-check" [class.yes]="perm.admin">{{ perm.admin ? '✓' : '—' }}</span></td>
                    <td><span class="perm-check" [class.yes]="perm.pm">{{ perm.pm ? '✓' : '—' }}</span></td>
                    <td><span class="perm-check" [class.yes]="perm.ba">{{ perm.ba ? '✓' : '—' }}</span></td>
                    <td><span class="perm-check" [class.yes]="perm.viewer">{{ perm.viewer ? '✓' : '—' }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      <!-- Toast -->
      <div class="toast" *ngIf="toastVisible">✅ {{ toastMessage }}</div>

    </div>
  `,
  styles: [`
    .settings-page { display: flex; flex-direction: column; gap: 24px; font-family: sans-serif; color: #1a2332; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .page-title { font-size: 26px; font-weight: 700; margin: 0 0 4px; font-family: 'Georgia', serif; color: #1a2332; }
    .page-subtitle { font-size: 13px; color: #718096; margin: 0; }

    /* Layout */
    .settings-layout { display: grid; grid-template-columns: 200px 1fr; gap: 24px; align-items: start; }

    /* Left Menu */
    .settings-menu {
      background: #fff; border: 1px solid #e8ecf0; border-radius: 10px;
      padding: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      display: flex; flex-direction: column; gap: 2px;
    }
    .menu-item {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 12px; border-radius: 7px; border: none;
      background: none; cursor: pointer; text-align: left;
      font-size: 13px; font-weight: 500; color: #4a5568;
      transition: all 0.15s;
    }
    .menu-item:hover { background: #f7f9fc; color: #1a2332; }
    .menu-item.active { background: #1a2332; color: #fff; }
    .menu-icon { font-size: 15px; width: 18px; text-align: center; }

    /* Content */
    .settings-content { display: flex; flex-direction: column; gap: 16px; }

    .section-header { margin-bottom: 4px; }
    .section-title { font-size: 18px; font-weight: 700; margin: 0 0 4px; font-family: 'Georgia', serif; }
    .section-desc { font-size: 13px; color: #718096; margin: 0; }

    /* Form Card */
    .form-card {
      background: #fff; border: 1px solid #e8ecf0; border-radius: 10px;
      padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      display: flex; flex-direction: column; gap: 20px;
    }
    .card-subtitle-title { font-size: 14px; font-weight: 700; margin: 0; color: #1a2332; font-family: 'Georgia', serif; }

    /* Avatar */
    .avatar-row { display: flex; align-items: center; gap: 16px; }
    .avatar {
      width: 56px; height: 56px; border-radius: 50%; background: #1a2332;
      color: white; display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700; font-family: 'Georgia', serif; flex-shrink: 0;
    }
    .avatar-name { font-size: 15px; font-weight: 700; color: #1a2332; }
    .avatar-role { font-size: 12px; color: #718096; margin-top: 2px; }

    /* Form Grid */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group.full-width { grid-column: 1 / -1; }
    .form-group label { font-size: 11px; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.4px; }
    .form-group input, .form-group select {
      padding: 9px 12px; border: 1px solid #e8ecf0; border-radius: 7px;
      font-size: 13px; color: #1a2332; outline: none; background: #fff;
    }
    .form-group input:focus, .form-group select:focus { border-color: #1a2332; }

    .form-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }

    .btn-primary { background: #1a2332; color: white; border: none; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { background: #2d3748; }
    .btn-secondary { background: #f7f9fc; color: #1a2332; border: 1px solid #e8ecf0; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-secondary:hover { background: #edf2f7; }

    .divider { height: 1px; background: #e8ecf0; margin: 4px 0; }

    /* Preferences */
    .pref-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .pref-info { flex: 1; }
    .pref-label { font-size: 13px; font-weight: 600; color: #1a2332; }
    .pref-desc { font-size: 12px; color: #a0aec0; margin-top: 2px; }
    .pref-select { padding: 8px 12px; border: 1px solid #e8ecf0; border-radius: 7px; font-size: 13px; color: #1a2332; background: #fff; outline: none; min-width: 200px; }

    /* Toggle */
    .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 4px 0; }
    .toggle-info { flex: 1; }
    .toggle-label { font-size: 13px; font-weight: 600; color: #1a2332; }
    .toggle-desc { font-size: 12px; color: #a0aec0; margin-top: 2px; }
    .toggle-switch {
      width: 40px; height: 22px; border-radius: 99px; background: #e2e8f0;
      position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0;
    }
    .toggle-switch.on { background: #1a2332; }
    .toggle-knob {
      position: absolute; top: 3px; left: 3px;
      width: 16px; height: 16px; border-radius: 50%; background: white;
      transition: left 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .toggle-switch.on .toggle-knob { left: 21px; }

    /* Roles Table */
    .roles-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .roles-table th {
      text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 700;
      color: #a0aec0; text-transform: uppercase; letter-spacing: 0.5px;
      border-bottom: 1px solid #e8ecf0; background: #f7f9fc;
    }
    .roles-table td { padding: 12px 16px; border-bottom: 1px solid #f7f9fc; vertical-align: middle; }
    .roles-table tr:last-child td { border-bottom: none; }
    .perm-name { font-weight: 600; color: #1a2332; }
    .perm-check { font-size: 14px; font-weight: 700; color: #cbd5e0; }
    .perm-check.yes { color: #38a169; }

    /* Toast */
    .toast {
      position: fixed; bottom: 24px; right: 24px;
      background: #1a2332; color: white; padding: 12px 20px;
      border-radius: 8px; font-size: 13px; font-weight: 600;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      animation: fadeIn 0.2s ease;
      z-index: 999;
    }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SettingsComponent {
  activeTab = 'profile';
  toastVisible = false;
  toastMessage = '';

  tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'roles', label: 'Roles & Permissions', icon: '🔐' },
  ];

  profile = {
    firstName: 'Nesko',
    lastName: 'Limo',
    email: 'nesko@baprojecttracker.com',
    phone: '+254 700 000 000',
    title: 'Business Analyst Lead',
    department: 'Project Management Office',
  };

  prefs = {
    language: 'en',
    timezone: 'Africa/Nairobi',
    dateFormat: 'MMM d, y',
    currency: 'USD',
    pageSize: '10',
  };

  emailNotifs = [
    { label: 'Project Updates', desc: 'Get notified when a project status changes', enabled: true },
    { label: 'Deadline Reminders', desc: 'Receive reminders 3 days before project deadlines', enabled: true },
    { label: 'New Assignments', desc: 'When you are assigned to a new project', enabled: true },
    { label: 'Weekly Summary', desc: 'A weekly digest of all project activity', enabled: false },
    { label: 'Sign-off Requests', desc: 'When a sign-off is required from you', enabled: true },
  ];

  appNotifs = [
    { label: 'Budget Alerts', desc: 'Alert when a project exceeds 90% of budget', enabled: true },
    { label: 'At Risk Flags', desc: 'Notify when a project is marked At Risk', enabled: true },
    { label: 'Document Uploads', desc: 'When a new document is added to your project', enabled: false },
    { label: 'Comments & Mentions', desc: 'When someone mentions you in a comment', enabled: true },
  ];

  permissions = [
    { name: 'View Dashboard', admin: true, pm: true, ba: true, viewer: true },
    { name: 'View Projects', admin: true, pm: true, ba: true, viewer: true },
    { name: 'Add Project', admin: true, pm: true, ba: false, viewer: false },
    { name: 'Edit Project', admin: true, pm: true, ba: false, viewer: false },
    { name: 'Delete Project', admin: true, pm: false, ba: false, viewer: false },
    { name: 'Upload Documents', admin: true, pm: true, ba: true, viewer: false },
    { name: 'View Reports', admin: true, pm: true, ba: true, viewer: true },
    { name: 'Export Reports', admin: true, pm: true, ba: false, viewer: false },
    { name: 'Manage Users', admin: true, pm: false, ba: false, viewer: false },
    { name: 'Manage Settings', admin: true, pm: false, ba: false, viewer: false },
    { name: 'Approve Sign-offs', admin: true, pm: true, ba: false, viewer: false },
  ];

  save(section: string) {
    this.toastMessage = `${section} saved successfully`;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
