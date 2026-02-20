import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService, MasterRegion } from '../../services/governance.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-layout">
      <aside class="settings-nav">
        <div class="nav-item" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">
          <span class="icon">👤</span> Profile
        </div>
        <div class="nav-item" [class.active]="activeTab === 'preferences'" (click)="activeTab = 'preferences'">
          <span class="icon">⚙️</span> Preferences
        </div>
        <div class="nav-item admin-tab" 
             *ngIf="gov.isAdmin()" 
             [class.active]="activeTab === 'governance'" 
             (click)="activeTab = 'governance'">
          <span class="icon">🛡️</span> Master Governance
        </div>
      </aside>

      <main class="settings-content">
        
        <section *ngIf="activeTab === 'profile'" class="animate-fade">
          <div class="section-header">
            <h2>Profile & Account</h2>
            <p>Update your personal information and account details.</p>
          </div>

          <div class="profile-card">
            <div class="avatar-row">
              <div class="avatar-circle">NL</div>
              <div class="user-meta">
                <h3>NeskoLimo</h3>
                <span class="role-badge">{{ gov.currentUser.role }}</span>
              </div>
              <button class="btn-outline">Change Photo</button>
            </div>

            <div class="form-grid">
              <div class="field">
                <label>First Name</label>
                <input type="text" value="Nesko">
              </div>
              <div class="field">
                <label>Last Name</label>
                <input type="text" value="Limo">
              </div>
              <div class="field">
                <label>Email Address</label>
                <input type="email" value="nesko@baprojecttracker.com">
              </div>
              <div class="field">
                <label>Phone Number</label>
                <input type="text" value="+254 700 000 000">
              </div>
            </div>
          </div>
        </section>

        <section *ngIf="activeTab === 'governance'" class="animate-fade">
          <div class="section-header">
            <h2>Master Data Governance</h2>
            <p>Admin Control: Manage global regions, currencies, and data integrity.</p>
          </div>

          <div class="gov-card">
            <div class="gov-actions">
              <button class="btn-primary" (click)="showAddModal = true">+ Register New Country</button>
            </div>

            <table class="master-table">
              <thead>
                <tr>
                  <th>ISO Code</th>
                  <th>Country & Currency</th>
                  <th>Status</th>
                  <th>Integrity Check</th>
                  <th>Hard Governance</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of gov.masterRegions" [class.inactive-row]="r.status === 'Inactive'">
                  <td class="mono">{{ r.code }}</td>
                  <td>
                    <strong>{{ r.name }}</strong><br>
                    <small>{{ r.currency }} Registry</small>
                  </td>
                  <td>
                    <span class="status-pill" [attr.data-status]="r.status">{{ r.status }}</span>
                  </td>
                  <td>
                    <span class="dependency-count" [class.has-deps]="r.projectCount > 0">
                      {{ r.projectCount }} Active Projects
                    </span>
                  </td>
                  <td class="btn-group">
                    <button class="btn-sm" (click)="toggleStatus(r)">
                      {{ r.status === 'Active' ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button class="btn-sm btn-danger" 
                            [disabled]="r.projectCount > 0"
                            (click)="hardPurge(r.code)">
                      Hard Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>

    <div class="modal" *ngIf="showAddModal">
       <div class="modal-content">
          <h3>Register Global Region</h3>
          <input [(ngModel)]="tempRegion.name" placeholder="Country Name">
          <input [(ngModel)]="tempRegion.code" placeholder="ISO Code (e.g. KE)">
          <input [(ngModel)]="tempRegion.currency" placeholder="Currency (e.g. KES)">
          <div class="modal-btns">
            <button (click)="showAddModal = false">Cancel</button>
            <button class="btn-primary" (click)="confirmAdd()">Save to Master Registry</button>
          </div>
       </div>
    </div>
  `,
  styles: [`
    .settings-layout { display: grid; grid-template-columns: 280px 1fr; min-height: 80vh; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    
    /* Navigation Sidebar */
    .settings-nav { background: #f8fafc; border-right: 1px solid #e2e8f0; padding: 20px; }
    .nav-item { padding: 12px 16px; border-radius: 8px; cursor: pointer; color: #64748b; font-weight: 500; margin-bottom: 4px; transition: 0.2s; }
    .nav-item:hover { background: #f1f5f9; color: #1e293b; }
    .nav-item.active { background: #1e293b; color: white; }
    .admin-tab { border-top: 1px solid #e2e8f0; margin-top: 20px; padding-top: 20px; color: #b91c1c; }

    /* Content Area */
    .settings-content { padding: 40px; }
    .section-header h2 { font-family: 'Georgia', serif; font-size: 24px; color: #1e293b; margin: 0; }
    .section-header p { color: #64748b; font-size: 14px; margin: 8px 0 24px 0; }

    /* Cards & Forms */
    .profile-card, .gov-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; }
    .avatar-row { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #f1f5f9; }
    .avatar-circle { width: 64px; height: 64px; background: #1e293b; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; }
    .role-badge { font-size: 11px; background: #f1f5f9; padding: 2px 8px; border-radius: 4px; color: #475569; }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .field label { display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
    .field input { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px; }

    /* Master Table Logic */
    .master-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    .master-table th { text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .master-table td { padding: 16px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    .mono { font-family: monospace; font-weight: bold; background: #f1f5f9; padding: 2px 4px; }
    
    .status-pill { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; }
    .status-pill[data-status="Active"] { background: #dcfce7; color: #166534; }
    .status-pill[data-status="Inactive"] { background: #f1f5f9; color: #64748b; }

    .dependency-count { font-size: 12px; color: #94a3b8; }
    .dependency-count.has-deps { color: #b91c1c; font-weight: 600; }

    .btn-sm { padding: 6px 12px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 11px; cursor: pointer; background: white; margin-right: 5px; }
    .btn-danger:hover { background: #fee2e2; border-color: #ef4444; color: #b91c1c; }
    .btn-primary { background: #1e293b; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
    
    .inactive-row { opacity: 0.6; }
    .animate-fade { animation: fadeIn 0.3s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* Modal Styling */
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
    .modal-content { background: white; padding: 30px; border-radius: 12px; width: 400px; display: flex; flex-direction: column; gap: 15px; }
  `]
})
export class SettingsComponent implements OnInit {
  activeTab = 'profile';
  showAddModal = false;
  tempRegion: MasterRegion = { code: '', name: '', currency: '', status: 'Active', projectCount: 0 };

  constructor(public gov: GovernanceService) {}

  ngOnInit() {}

  toggleStatus(region: MasterRegion) {
    const result = this.gov.toggleRegionStatus(region);
    if (!result.success) alert(result.message);
  }

  confirmAdd() {
    this.gov.addRegion({ ...this.tempRegion });
    this.showAddModal = false;
    this.tempRegion = { code: '', name: '', currency: '', status: 'Active', projectCount: 0 };
  }

  hardPurge(code: string) {
    if (confirm('CRITICAL: This permanently removes this region from all global systems. Proceed?')) {
      const res = this.gov.hardDeleteRegion(code);
      if (!res.success) alert(res.message);
    }
  }
}
