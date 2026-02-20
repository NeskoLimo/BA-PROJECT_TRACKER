import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CountryEntry { code: string; name: string; currency: string; symbol: string; }

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Management & Support</h1>
          <p class="page-subtitle">Configure global master data and personal account preferences</p>
        </div>
      </div>

      <div class="settings-layout">
        <div class="settings-menu">
          <div class="menu-category">Global Governance</div>
          <button class="menu-item" *ngFor="let tab of governanceTabs"
            [class.active]="activeTab === tab.id" (click)="activeTab = tab.id">
            <span class="menu-icon">{{ tab.icon }}</span>
            <span class="menu-label">{{ tab.label }}</span>
          </button>

          <div class="menu-category mt-4">Account Support</div>
          <button class="menu-item" *ngFor="let tab of supportTabs"
            [class.active]="activeTab === tab.id" (click)="activeTab = tab.id">
            <span class="menu-icon">{{ tab.icon }}</span>
            <span class="menu-label">{{ tab.label }}</span>
          </button>
        </div>

        <div class="settings-content">
          
          <div *ngIf="activeTab === 'master-data'" class="animate-fade">
            <div class="section-header">
              <h2 class="section-title">Master Data Sets</h2>
              <p class="section-desc">Define the global entities that drive project tracking and reporting.</p>
            </div>
            
            <div class="form-card">
              <div class="card-header-flex">
                <h3 class="card-subtitle-title">Country & Currency Registry</h3>
                <button class="btn-primary btn-sm" (click)="addCountry()">+ Add Region</button>
              </div>
              <table class="master-table">
                <thead>
                  <tr>
                    <th>ISO Code</th>
                    <th>Country Name</th>
                    <th>Currency</th>
                    <th>Symbol</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of countries; let i = index">
                    <td><input type="text" [(ngModel)]="c.code" class="table-input" placeholder="KE"></td>
                    <td><input type="text" [(ngModel)]="c.name" class="table-input" placeholder="Kenya"></td>
                    <td><input type="text" [(ngModel)]="c.currency" class="table-input" placeholder="KES"></td>
                    <td><input type="text" [(ngModel)]="c.symbol" class="table-input" placeholder="KSh"></td>
                    <td><button class="btn-icon-del" (click)="removeCountry(i)">✕</button></td>
                  </tr>
                </tbody>
              </table>
              <div class="form-actions">
                <button class="btn-primary" (click)="save('Master Data')">Commit Global Registry</button>
              </div>
            </div>
          </div>

          <div *ngIf="activeTab === 'profile'" class="animate-fade">
            <div class="section-header">
              <h2 class="section-title">Profile & Email</h2>
              <p class="section-desc">Manage your identity and primary contact details.</p>
            </div>
            <div class="form-card">
              <div class="avatar-row">
                <div class="avatar">NL</div>
                <div>
                  <div class="avatar-name">{{profile.firstName}} {{profile.lastName}}</div>
                  <div class="avatar-role">{{profile.title}}</div>
                </div>
              </div>
              <div class="form-grid mt-4">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" [(ngModel)]="profile.firstName" />
                </div>
                <div class="form-group">
                  <label>Email Address</label>
                  <input type="email" [(ngModel)]="profile.email" />
                </div>
              </div>
              <div class="form-actions">
                <button class="btn-primary" (click)="save('Profile')">Update Profile</button>
              </div>
            </div>

            <div class="form-card mt-4">
              <h3 class="card-subtitle-title">Security & Password</h3>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label>New Password</label>
                  <input type="password" placeholder="••••••••" />
                </div>
              </div>
              <div class="form-actions">
                <button class="btn-primary" (click)="save('Password')">Change Password</button>
              </div>
            </div>
          </div>

          <div *ngIf="activeTab === 'notifications'" class="animate-fade">
             <div class="section-header">
              <h2 class="section-title">Notification Preferences</h2>
              <p class="section-desc">Choose which nudges and alerts you receive.</p>
            </div>
            <div class="form-card">
               <div class="toggle-row" *ngFor="let n of emailNotifs">
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

        </div>
      </div>

      <div class="toast" *ngIf="toastVisible">✅ {{ toastMessage }}</div>
    </div>
  `,
  styles: [`
    /* Retention of existing styles with additions for Master Data */
    .settings-page { padding: 24px; background: #f8fafc; min-height: 100vh; }
    .menu-category { 
      font-size: 10px; font-weight: 800; color: #a0aec0; 
      text-transform: uppercase; letter-spacing: 1px; padding: 10px 12px 5px;
    }
    .mt-4 { margin-top: 20px; }
    .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    
    .master-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .master-table th { text-align: left; font-size: 11px; color: #718096; padding: 10px; border-bottom: 1px solid #edf2f7; }
    .master-table td { padding: 8px; border-bottom: 1px solid #f7f9fc; }
    
    .table-input { 
      width: 100%; border: 1px solid #e8ecf0; padding: 6px 10px; 
      border-radius: 4px; font-size: 13px; outline: none; 
    }
    .table-input:focus { border-color: #1a2332; }
    
    .btn-icon-del { background: none; border: none; color: #cbd5e0; cursor: pointer; font-size: 16px; }
    .btn-icon-del:hover { color: #e53e3e; }
    .btn-sm { padding: 6px 12px; font-size: 11px; }

    .animate-fade { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* Import existing styles from previous block here... */
    .settings-layout { display: grid; grid-template-columns: 240px 1fr; gap: 32px; }
    .settings-menu { background: #fff; border: 1px solid #e8ecf0; border-radius: 12px; padding: 12px; height: fit-content; }
    .menu-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; border: none; background: none; cursor: pointer; width: 100%; color: #4a5568; font-size: 13px; font-weight: 500; }
    .menu-item.active { background: #1a2332; color: #fff; }
    .form-card { background: #fff; border: 1px solid #e8ecf0; border-radius: 12px; padding: 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); margin-bottom: 20px;}
    .section-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .btn-primary { background: #1a2332; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .toggle-switch { width: 40px; height: 22px; border-radius: 11px; background: #cbd5e0; position: relative; cursor: pointer; transition: 0.2s; }
    .toggle-switch.on { background: #1a2332; }
    .toggle-knob { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: white; transition: 0.2s; }
    .toggle-switch.on .toggle-knob { left: 21px; }
    .toast { position: fixed; bottom: 20px; right: 20px; background: #1a2332; color: #fff; padding: 12px 24px; border-radius: 8px; z-index: 1000; }
    /* ... (rest of your base styles) */
  `]
})
export class SettingsComponent {
  activeTab = 'master-data';
  toastVisible = false;
  toastMessage = '';

  governanceTabs = [
    { id: 'master-data', label: 'Master Data Sets', icon: '🌍' },
    { id: 'roles', label: 'Roles & Permissions', icon: '🔐' },
  ];

  supportTabs = [
    { id: 'profile', label: 'Profile & Email', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'preferences', label: 'App Preferences', icon: '⚙️' },
  ];

  countries: CountryEntry[] = [
    { code: 'KE', name: 'Kenya', currency: 'KES', symbol: 'KSh' },
    { code: 'UG', name: 'Uganda', currency: 'UGX', symbol: 'USh' },
    { code: 'US', name: 'United States', currency: 'USD', symbol: '$' }
  ];

  profile = {
    firstName: 'Nesko',
    lastName: 'Limo',
    email: 'nesko@baprojecttracker.com',
    title: 'Business Analyst Lead',
  };

  emailNotifs = [
    { label: 'Project Updates', desc: 'Get notified when a project status changes', enabled: true },
    { label: 'Deadline Reminders', desc: 'Receive reminders 3 days before project deadlines', enabled: true },
  ];

  addCountry() {
    this.countries.push({ code: '', name: '', currency: '', symbol: '' });
  }

  removeCountry(index: number) {
    this.countries.splice(index, 1);
  }

  save(section: string) {
    this.toastMessage = `${section} committed successfully`;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}
