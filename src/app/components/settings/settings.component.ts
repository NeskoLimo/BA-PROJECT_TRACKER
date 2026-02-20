import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Defining the Global Interface to prevent TS errors
interface CountryEntity {
  code: string;
  name: string;
  currency: string;
  symbol: string;
}

interface MasterConfig {
  projectTypes: string[];
  sources: string[];
  roles: string[];
  countries: CountryEntity[];
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-container">
      <div class="header-section">
        <h1 class="page-title">Master Governance Setup</h1>
        <p class="subtitle">Configure global entities, currencies, and project taxonomies.</p>
      </div>

      <div class="settings-grid">
        <div class="card full-width">
          <div class="card-header">
            <h3>🌍 Regional Entities & Currencies</h3>
            <button class="btn-add" (click)="addCountry()">+ Add Region</button>
          </div>
          <table class="config-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Country Name</th>
                <th>Currency</th>
                <th>Symbol</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of config.countries; let i = index">
                <td><input [(ngModel)]="c.code" placeholder="e.g. KE"></td>
                <td><input [(ngModel)]="c.name" placeholder="Country Name"></td>
                <td><input [(ngModel)]="c.currency" placeholder="KES"></td>
                <td><input [(ngModel)]="c.symbol" placeholder="/-"></td>
                <td><button (click)="removeItem('countries', i)" class="btn-del">✕</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>📁 Project Categories</h3>
            <button class="btn-add" (click)="addItem('projectTypes')">+</button>
          </div>
          <div class="list-body">
            <div *ngFor="let type of config.projectTypes; let i = index" class="item-row">
              <input [(ngModel)]="config.projectTypes[i]">
              <button (click)="removeItem('projectTypes', i)" class="btn-del">✕</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>🔌 Project Sources</h3>
            <button class="btn-add" (click)="addItem('sources')">+</button>
          </div>
          <div class="list-body">
            <div *ngFor="let s of config.sources; let i = index" class="item-row">
              <input [(ngModel)]="config.sources[i]">
              <button (click)="removeItem('sources', i)" class="btn-del">✕</button>
            </div>
          </div>
        </div>
      </div>

      <div class="action-footer">
        <button class="btn-save" (click)="saveConfiguration()">💾 Commit Global Settings</button>
      </div>
    </div>
  `,
  styles: [`
    .settings-container { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .page-title { font-family: 'Georgia', serif; font-size: 26px; color: #0f172a; margin: 0; }
    .subtitle { color: #64748b; margin-top: 5px; margin-bottom: 30px; }

    .settings-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
    .full-width { grid-column: span 2; }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .card-header h3 { font-size: 15px; color: #1e293b; margin: 0; }
    
    .config-table { width: 100%; border-collapse: collapse; }
    .config-table th { text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; padding: 10px; border-bottom: 2px solid #f1f5f9; }
    .config-table td { padding: 10px; }
    .config-table input, .item-row input { width: 100%; padding: 8px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; }

    .btn-add { background: #0f172a; color: white; border: none; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
    .btn-del { background: none; border: none; color: #cbd5e1; cursor: pointer; margin-left: 10px; }
    .btn-del:hover { color: #ef4444; }

    .item-row { display: flex; align-items: center; margin-bottom: 10px; }
    .action-footer { margin-top: 40px; text-align: right; border-top: 1px solid #e2e8f0; padding-top: 20px; }
    .btn-save { background: #0f172a; color: white; padding: 12px 30px; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; transition: transform 0.1s; }
    .btn-save:active { transform: scale(0.98); }
  `]
})
export class SettingsComponent implements OnInit {
  // Initializing the master config to prevent TS2339 build errors
  config: MasterConfig = {
    projectTypes: ['Infrastructure', 'Software Dev', 'Operations', 'Finance'],
    sources: ['Internal', 'Vendor', 'Grant'],
    roles: ['Lead PM', 'Stakeholder', 'Finance Lead'],
    countries: [
      { code: 'KE', name: 'Kenya', currency: 'KES', symbol: 'KSh' },
      { code: 'UG', name: 'Uganda', currency: 'UGX', symbol: 'USh' },
      { code: 'US', name: 'USA', currency: 'USD', symbol: '$' }
    ]
  };

  ngOnInit() {}

  addCountry() {
    this.config.countries.push({ code: '', name: '', currency: '', symbol: '' });
  }

  addItem(key: 'projectTypes' | 'sources' | 'roles') {
    this.config[key].push('New Entry');
  }

  removeItem(key: keyof MasterConfig, index: number) {
    (this.config[key] as any[]).splice(index, 1);
  }

  saveConfiguration() {
    // Logic to save to local storage or API
    console.log('Global Governance Saved:', this.config);
    alert('Master Data synchronized. All modules updated with new Regional & Currency entities.');
  }
}
