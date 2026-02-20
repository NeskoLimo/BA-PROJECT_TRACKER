import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-layout">
      <aside class="settings-nav shadow-sm">
        <div class="nav-brand">⚙️ Control Center</div>
        
        <div class="nav-group">
          <label>GOVERNANCE</label>
          <button [class.active]="activeTab === 'master'" (click)="activeTab = 'master'">🌍 Master Data Sets</button>
          <button [class.active]="activeTab === 'nudges'" (click)="activeTab = 'nudges'">📊 Threshold Logic</button>
        </div>

        <div class="nav-group">
          <label>BASIC SUPPORT</label>
          <button [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">👤 Profile & Email</button>
          <button [class.active]="activeTab === 'security'" (click)="activeTab = 'security'">🔒 Change Password</button>
          <button [class.active]="activeTab === 'notif'" (click)="activeTab = 'notif'">🔔 Notifications</button>
        </div>
      </aside>

      <main class="settings-body">
        
        <div *ngIf="activeTab === 'master'" class="view-pane animate-in">
          <header class="pane-header">
            <h2>Master Data Governance</h2>
            <p>Define global countries, currencies, and project taxonomies.</p>
          </header>

          <div class="card">
            <h3>Regional Entity Registry</h3>
            <table class="config-table">
              <thead>
                <tr><th>Code</th><th>Country Name</th><th>Currency</th><th>Action</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of countries; let i = index">
                  <td><input [(ngModel)]="c.code" class="small-in" placeholder="KE"></td>
                  <td><input [(ngModel)]="c.name" placeholder="Kenya"></td>
                  <td><input [(ngModel)]="c.currency" class="small-in" placeholder="KES"></td>
                  <td><button class="btn-del" (click)="removeCountry(i)">✕</button></td>
                </tr>
              </tbody>
            </table>
            <button class="btn-ghost" (click)="addCountry()">+ Add New Region</button>
          </div>
        </div>

        <div *ngIf="activeTab === 'profile'" class="view-pane animate-in">
          <header class="pane-header">
            <h2>Profile & Contact</h2>
            <p>Update your professional identity and primary contact email.</p>
          </header>

          <div class="card profile-card">
            <div class="avatar-section">
              <div class="avatar-circle">NL</div>
              <button class="btn-ghost">Change Photo</button>
            </div>
            <div class="form-grid">
              <div class="input-group">
                <label>Professional Name</label>
                <input type="text" [(ngModel)]="userProfile.name">
              </div>
              <div class="input-group">
                <label>Primary Email</label>
                <input type="email" [(ngModel)]="userProfile.email">
              </div>
            </div>
            <button class="btn-primary" (click)="saveProfile()">💾 Save Profile Changes</button>
          </div>
        </div>

        <div *ngIf="activeTab === 'security'" class="view-pane animate-in">
          <header class="pane-header">
            <h2>Access Security</h2>
            <p>Manage your password and authentication settings.</p>
          </header>

          <div class="card security-card">
            <div class="input-group">
              <label>Current Password</label>
              <input type="password" placeholder="••••••••">
            </div>
            <div class="input-group">
              <label>New Password</label>
              <input type="password" placeholder="Min 8 characters">
            </div>
            <div class="input-group">
              <label>Confirm New Password</label>
              <input type="password" placeholder="Re-type password">
            </div>
            <button class="btn-primary">Update Password</button>
          </div>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .settings-layout { display: flex; height: 100vh; background: #f8fafc; }
    
    /* Sidebar */
    .settings-nav { width: 280px; background: #ffffff; padding: 30px; border-right: 1px solid #e2e8f0; }
    .nav-brand { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 40px; }
    .nav-group { margin-bottom: 30px; }
    .nav-group label { font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 1px; display: block; margin-bottom: 12px; }
    .nav-group button { 
      width: 100%; text-align: left; padding: 12px 15px; border: none; background: none; 
      border-radius: 8px; cursor: pointer; color: #64748b; font-weight: 500; transition: 0.2s;
    }
    .nav-group button.active { background: #0f172a; color: white; }
    .nav-group button:hover:not(.active) { background: #f1f5f9; color: #0f172a; }

    /* Content Area */
    .settings-body { flex-grow: 1; padding: 50px; overflow-y: auto; }
    .pane-header { margin-bottom: 30px; }
    .pane-header h2 { font-family: 'Georgia', serif; font-size: 24px; color: #0f172a; margin: 0; }
    .pane-header p { color: #64748b; margin: 5px 0 0; }

    .card { background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .config-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .config-table th { text-align: left; font-size: 12px; color: #94a3b8; padding-bottom: 15px; border-bottom: 2px solid #f8fafc; }
    .config-table td { padding: 10px 0; }
    .config-table input { padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; width: 90%; }
    .small-in { width: 80px !important; }

    .avatar-section { display: flex; align-items: center; gap: 20px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
    .avatar-circle { width: 60px; height: 60px; background: #0f172a; color: white; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: 700; }
    
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
    .input-group label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
    .input-group input { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; }

    .btn-primary { background: #0f172a; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-ghost { background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 16px; border-radius: 6px; cursor: pointer; color: #475569; font-size: 13px; }
    
    .animate-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SettingsComponent {
  activeTab: 'master' | 'nudges' | 'profile' | 'security' | 'notif' = 'master';

  countries = [
    { code: 'KE', name: 'Kenya', currency: 'KES' },
    { code: 'UG', name: 'Uganda', currency: 'UGX' },
    { code: 'US', name: 'USA', currency: 'USD' }
  ];

  userProfile = {
    name: 'Nesko Limo',
    email: 'nesko@baprojecttracker.com'
  };

  addCountry() {
    this.countries.push({ code: '', name: '', currency: '' });
  }

  removeCountry(index: number) {
    this.countries.splice(index, 1);
  }

  saveProfile() {
    alert(`Success: Profile for ${this.userProfile.name} has been updated.`);
  }
}
