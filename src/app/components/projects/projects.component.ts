import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Unified interface to ensure consistency across the app
interface Project {
  name: string;
  type: string;
  location: string;
  manager: string;
  budget: number;
  spent: number;
  status: 'Active' | 'Planning' | 'Critical' | 'Completed';
  progress: number;
  currency: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="projects-wrapper">
      <div class="page-header">
        <div class="header-text">
          <h1 class="page-title">Project Portfolio</h1>
          <p class="page-subtitle">Standardized tracking and mass audit controls</p>
        </div>
        <div class="action-buttons">
          <button class="btn-ghost">📥 Download CSV Template</button>
          <button class="btn-ghost">📤 Bulk Upload Projects</button>
          <button class="btn-primary" (click)="toggleForm()">
            {{ showEntryForm ? '✕ Close' : '+ Single Entry' }}
          </button>
        </div>
      </div>

      <div *ngIf="showEntryForm" class="entry-card animate-in">
        <div class="form-header">
          <h3>New Global Entry</h3>
          <p>Register a project under defined regional governance.</p>
        </div>
        <div class="form-grid">
          <div class="input-group">
            <label>Project Name</label>
            <input type="text" [(ngModel)]="newProject.name" placeholder="e.g., ERP System Migration">
          </div>
          <div class="input-group">
            <label>Regional Location</label>
            <select [(ngModel)]="newProject.location" (change)="onLocationChange()">
              <option value="" disabled>Select from Master Registry</option>
              <option *ngFor="let region of masterRegions" [value]="region.name">
                {{ region.name }} ({{ region.code }})
              </option>
            </select>
          </div>
          <div class="input-group">
            <label>Budget ({{ newProject.currency }})</label>
            <input type="number" [(ngModel)]="newProject.budget">
          </div>
          <div class="input-group flex-end">
            <button class="btn-success" (click)="commitProject()">Commit to Portfolio</button>
          </div>
        </div>
      </div>

      <div class="portfolio-container">
        <div class="search-bar">
          <input type="text" placeholder="🔍 Filter portfolio..." class="filter-input">
        </div>

        <table class="portfolio-table">
          <thead>
            <tr>
              <th>Project Details</th>
              <th>Location</th>
              <th>Manager</th>
              <th>Status</th>
              <th>Budget Health</th>
              <th>Progress</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of projects" class="project-row">
              <td class="details-cell">
                <span class="p-name">{{ p.name }}</span>
                <span class="p-type">{{ p.type }}</span>
              </td>
              <td><span class="location-tag">{{ p.location }}</span></td>
              <td [class.unassigned]="p.manager === 'Unassigned'">
                {{ p.manager }}
              </td>
              <td>
                <span class="status-pill" [attr.data-status]="p.status">
                  {{ p.status }}
                </span>
              </td>
              <td class="budget-cell">
                <div class="budget-main">{{ p.currency }} {{ p.spent | number }}</div>
                <div class="budget-sub">of {{ p.budget | number }}</div>
              </td>
              <td>
                <div class="progress-wrap">
                  <div class="progress-track">
                    <div class="progress-fill" [style.width.%]="p.progress"></div>
                  </div>
                  <span class="progress-text">{{ p.progress }}%</span>
                </div>
              </td>
              <td><button class="btn-dots">⋮</button></td>
            </tr>
          </tbody>
        </table>
        
        <div class="pagination">
          <span>Showing 1 - {{ projects.length }} of {{ projects.length }}</span>
          <div class="pag-btns">
            <button disabled>Prev</button>
            <button class="active">1</button>
            <button disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .projects-wrapper { padding: 32px; font-family: 'Inter', sans-serif; background: #fcfcfd; min-height: 100vh; }
    
    /* Header Styles */
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .page-title { font-family: 'Georgia', serif; font-size: 28px; color: #1a2332; margin: 0; }
    .page-subtitle { color: #718096; font-size: 14px; margin-top: 4px; }
    .action-buttons { display: flex; gap: 12px; }

    /* Entry Form */
    .entry-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .form-grid { display: grid; grid-template-columns: 2fr 1.5fr 1fr 1fr; gap: 20px; align-items: flex-end; }
    .input-group label { display: block; font-size: 11px; font-weight: 700; color: #718096; text-transform: uppercase; margin-bottom: 8px; }
    .input-group input, .input-group select { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; }

    /* Portfolio Table */
    .portfolio-container { background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .search-bar { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; }
    .filter-input { width: 300px; padding: 8px 16px; border-radius: 20px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 13px; }

    .portfolio-table { width: 100%; border-collapse: collapse; }
    .portfolio-table th { background: #f8fafc; text-align: left; padding: 12px 24px; font-size: 11px; font-weight: 700; color: #718096; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
    .project-row td { padding: 16px 24px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
    
    /* Details Cell */
    .details-cell { display: flex; flex-direction: column; }
    .p-name { font-weight: 600; color: #1a2332; }
    .p-type { font-size: 11px; color: #a0aec0; letter-spacing: 0.5px; }

    /* Location & Status Pilles */
    .location-tag { background: #eff6ff; color: #2563eb; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
    .status-pill { padding: 4px 12px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .status-pill[data-status="Active"] { background: #f0fdf4; color: #166534; }
    .status-pill[data-status="Critical"] { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }
    .status-pill[data-status="Planning"] { background: #f7f9fc; color: #64748b; }

    .unassigned { color: #e53e3e; font-weight: 700; font-style: italic; }

    /* Progress Bar */
    .progress-wrap { display: flex; align-items: center; gap: 12px; }
    .progress-track { flex-grow: 1; height: 6px; background: #f1f5f9; border-radius: 3px; }
    .progress-fill { height: 100%; background: #1a2332; border-radius: 3px; }
    .progress-text { font-size: 11px; font-weight: 700; color: #1a2332; width: 30px; }

    /* Buttons */
    .btn-primary { background: #1a2332; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-ghost { background: white; border: 1px solid #e2e8f0; padding: 10px 16px; border-radius: 8px; font-size: 12px; font-weight: 600; color: #4a5568; cursor: pointer; }
    .btn-success { background: #166534; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; }
    
    .pagination { padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; color: #718096; font-size: 13px; }
    .pag-btns { display: flex; gap: 8px; }
    .pag-btns button { padding: 6px 12px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; cursor: pointer; }
    .pag-btns button.active { background: #1a2332; color: white; border-color: #1a2332; }

    .animate-in { animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProjectsComponent implements OnInit {
  showEntryForm = false;
  
  // Master Data shared with Settings Module
  masterRegions = [
    { code: 'KE', name: 'Kenya', currency: 'KES' },
    { code: 'UG', name: 'Uganda', currency: 'UGX' },
    { code: 'TZ', name: 'Tanzania', currency: 'TZS' },
    { code: 'US', name: 'USA', currency: 'USD' }
  ];

  projects: Project[] = [
    { name: 'ERP System Migration', type: 'INFRASTRUCTURE', location: 'Kenya', manager: 'Alice M.', budget: 850000, spent: 612000, status: 'Active', progress: 72, currency: 'KES' },
    { name: 'Warehouse Expansion', type: 'OPERATIONS', location: 'Uganda', manager: 'Unassigned', budget: 1200000, spent: 0, status: 'Planning', progress: 0, currency: 'UGX' },
    { name: 'Cloud Migration', type: 'INFRASTRUCTURE', location: 'Kenya', manager: 'Alice M.', budget: 1200000, spent: 1100000, status: 'Critical', progress: 92, currency: 'KES' }
  ];

  newProject = {
    name: '',
    location: '',
    budget: 0,
    currency: 'USD'
  };

  ngOnInit() {}

  toggleForm() {
    this.showEntryForm = !this.showEntryForm;
  }

  // Part 2 Link: Automatically sync currency with the location registry
  onLocationChange() {
    const selected = this.masterRegions.find(r => r.name === this.newProject.location);
    if (selected) {
      this.newProject.currency = selected.currency;
    }
  }

  commitProject() {
    const projectToCommit: Project = {
      ...this.newProject,
      type: 'GENERAL',
      manager: 'Unassigned',
      spent: 0,
      status: 'Planning',
      progress: 0,
      currency: this.newProject.currency
    };

    this.projects.unshift(projectToCommit);
    this.showEntryForm = false;
    this.resetForm();
  }

  private resetForm() {
    this.newProject = { name: '', location: '', budget: 0, currency: 'USD' };
  }
}
