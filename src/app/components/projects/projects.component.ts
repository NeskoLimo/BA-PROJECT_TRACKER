// src/app/components/projects/projects.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GovernanceService, Project } from '../../services/governance.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FormsModule],
  template: `
    <div class="mck-container">
      <div class="header-section">
        <div class="title-group">
          <span class="eyebrow">Governance Registry • {{gov.currentUser.role}}</span>
          <h1>Workstream Portfolio</h1>
          <p>Enforcing phase-gate compliance and time-based performance metrics.</p>
        </div>
        <div class="action-group" *ngIf="gov.canEdit()">
          <button class="btn-sec" (click)="onDownloadTemplate()">↓ Template</button>
          <label class="btn-main">
            <input type="file" (change)="onMassUpload($event)" style="display:none">
            ↑ Mass Upload
          </label>
        </div>
      </div>

      <div class="filter-strip">
        <div class="search-wrap">
          <span class="search-icon">🔍</span>
          <input type="text" [(ngModel)]="searchTerm" (input)="applyFilters()"
                 placeholder="Search by name, owner, or location...">
        </div>
      </div>

      <div class="mck-card">
        <table class="mck-table">
          <thead>
            <tr>
              <th>Project Details</th>
              <th>Registry Timelines</th>
              <th>Calculated Progress</th>
              <th>Sign-off Scope</th>
              <th>Gate</th>
              <th>Status</th>
              <th *ngIf="gov.canEdit()">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredProjects" [class.row-critical]="p.status === 'Critical'">

              <!-- Project Details -->
              <td>
                <div class="p-name">{{p.name}}</div>
                <div class="p-meta">{{p.owner}} | {{p.location}}</div>
              </td>

              <!-- Registry Timelines — Editable -->
              <td class="date-cell">
                <div class="date-field">
                  <label class="date-label">Start</label>
                  <input class="date-input"
                    type="text"
                    [value]="formatDate(p.startDate)"
                    (blur)="onDateChange($event, p, 'startDate')"
                    (keydown.enter)="onDateChange($event, p, 'startDate')"
                    placeholder="DD/MM/YY"
                    maxlength="8"
                    [readonly]="!gov.canEdit()" />
                </div>
                <div class="date-field">
                  <label class="date-label">Proj. End</label>
                  <input class="date-input"
                    type="text"
                    [value]="formatDate(p.projectedEndDate)"
                    (blur)="onDateChange($event, p, 'projectedEndDate')"
                    (keydown.enter)="onDateChange($event, p, 'projectedEndDate')"
                    placeholder="DD/MM/YY"
                    maxlength="8"
                    [readonly]="!gov.canEdit()" />
                </div>
                <div class="date-field">
                  <label class="date-label">Actual End</label>
                  <input class="date-input"
                    [class.actual-set]="p.actualEndDate"
                    type="text"
                    [value]="p.actualEndDate ? formatDate(p.actualEndDate) : ''"
                    (blur)="onDateChange($event, p, 'actualEndDate')"
                    (keydown.enter)="onDateChange($event, p, 'actualEndDate')"
                    placeholder="DD/MM/YY"
                    maxlength="8"
                    [readonly]="!gov.canEdit()" />
                </div>
                <div class="date-error" *ngIf="dateErrors[p.id]">⚠️ {{ dateErrors[p.id] }}</div>
              </td>

              <!-- Calculated Progress -->
              <td>
                <div class="prog-wrapper">
                  <div class="prog-track">
                    <div class="prog-fill"
                         [style.width.%]="gov.getCalculatedProgress(p)"
                         [ngClass]="getHealthClass(p)"></div>
                  </div>
                  <span class="prog-text">{{ gov.getCalculatedProgress(p) }}%</span>
                </div>
              </td>

              <!-- Sign-off Scope -->
              <td>
                <div class="upload-zone" [class.valid]="p.hasAttachment">
                  <div *ngIf="p.hasAttachment" class="file-pill">
                    📄 {{p.attachmentUrl}}
                    <span class="remove-file" (click)="removeAttachment(p)" *ngIf="gov.canEdit()">×</span>
                  </div>
                  <label *ngIf="!p.hasAttachment && gov.canEdit()" class="upload-label">
                    <input type="file" (change)="onFileSelected($event, p)"
                           accept=".pdf,.doc,.docx" style="display:none">
                    📎 Link Scope
                  </label>
                  <span *ngIf="!p.hasAttachment && !gov.canEdit()" class="no-attachment">—</span>
                </div>
              </td>

              <!-- Gate -->
              <td>
                <span class="gate-badge" [ngClass]="p.phase.toLowerCase()">{{p.phase}}</span>
              </td>

              <!-- Status -->
              <td>
                <span class="status-badge" [ngClass]="p.status.toLowerCase()">{{p.status}}</span>
              </td>

              <!-- Actions -->
              <td *ngIf="gov.canEdit()">
                <div class="action-btns">
                  <button class="icon-btn edit" title="Edit project">✏️</button>
                  <button *ngIf="gov.canDelete()" (click)="deleteProject(p.id)" class="icon-btn del" title="Delete project">🗑️</button>
                </div>
              </td>

            </tr>
            <tr *ngIf="filteredProjects.length === 0">
              <td colspan="7" class="empty-state">No projects match your search.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .mck-container { padding: 40px; background: #f5f7f9; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .header-section { display: flex; justify-content: space-between; margin-bottom: 30px; align-items: flex-start; }
    .title-group h1 { font-size: 26px; font-weight: 700; margin: 6px 0 4px; font-family: 'Georgia', serif; color: #1a2332; }
    .title-group p { font-size: 13px; color: #718096; margin: 0; }
    .eyebrow { color: #007DFE; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
    .action-group { display: flex; align-items: center; gap: 10px; }

    .filter-strip { margin-bottom: 25px; }
    .search-wrap { position: relative; max-width: 500px; }
    .search-icon { position: absolute; left: 15px; top: 12px; color: #94a3b8; }
    .search-wrap input { width: 100%; padding: 12px 15px 12px 45px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; box-sizing: border-box; }
    .search-wrap input:focus { border-color: #1a2332; }

    .mck-card { background: white; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .mck-table { width: 100%; border-collapse: collapse; }
    .mck-table th { padding: 15px 20px; background: #f8fafc; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f1f5f9; font-weight: 700; }
    .mck-table td { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top; color: #2d3748; }
    .mck-table tr:last-child td { border-bottom: none; }
    .row-critical td { background: #fff1f2; }

    .p-name { font-weight: 700; color: #1a2332; margin-bottom: 3px; }
    .p-meta { font-size: 12px; color: #94a3b8; }

    /* Date Fields */
    .date-cell { min-width: 160px; }
    .date-field { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
    .date-field:last-of-type { margin-bottom: 0; }
    .date-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.4px; width: 52px; flex-shrink: 0; }
    .date-input {
      padding: 5px 8px; border: 1px solid #e2e8f0; border-radius: 5px;
      font-size: 12px; color: #1a2332; outline: none; width: 80px;
      font-family: 'Courier New', monospace; letter-spacing: 0.5px;
      background: #f8fafc; transition: border 0.15s;
    }
    .date-input:focus { border-color: #007DFE; background: #fff; }
    .date-input[readonly] { background: #f8fafc; color: #94a3b8; cursor: default; }
    .date-input.actual-set { color: #10b981; border-color: #a7f3d0; background: #f0fdf4; }
    .date-error { font-size: 11px; color: #ef4444; margin-top: 4px; }

    .prog-wrapper { display: flex; align-items: center; gap: 10px; }
    .prog-track { flex: 1; height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden; min-width: 80px; }
    .prog-fill { height: 100%; transition: width 0.5s ease; }
    .prog-text { font-size: 12px; font-weight: 700; color: #64748b; white-space: nowrap; }
    .health-good { background: #10b981; }
    .health-warn { background: #f59e0b; }
    .health-crit { background: #ef4444; }

    .gate-badge { padding: 4px 10px; border-radius: 4px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
    .initiation { background: #f8f9fa; color: #6c757d; }
    .planning { background: #f1f5f9; color: #475569; }
    .execution { background: #e0f2fe; color: #0369a1; }
    .closure { background: #f0fdf4; color: #166534; }

    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .active { background: #ecfdf5; color: #10b981; }
    .critical { background: #fef2f2; color: #ef4444; }

    .upload-zone { min-width: 120px; }
    .file-pill { background: #f0f9ff; color: #0369a1; padding: 5px 10px; border-radius: 4px; border: 1px solid #bae6fd; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; }
    .upload-label { color: #007DFE; font-weight: 600; cursor: pointer; font-size: 13px; text-decoration: underline; }
    .remove-file { cursor: pointer; color: #ef4444; font-weight: bold; font-size: 14px; }
    .no-attachment { color: #cbd5e0; }

    .btn-main { background: #001E3C; color: white; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer; display: inline-block; font-size: 13px; border: none; }
    .btn-main:hover { background: #1a2332; }
    .btn-sec { background: white; border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; }
    .btn-sec:hover { background: #f7f9fc; }

    .action-btns { display: flex; gap: 6px; }
    .icon-btn { background: none; border: none; cursor: pointer; font-size: 16px; transition: transform 0.2s; padding: 4px; border-radius: 4px; }
    .icon-btn:hover { transform: scale(1.2); background: #f7f9fc; }
    .empty-state { text-align: center; color: #a0aec0; padding: 40px !important; font-size: 14px; }
  `]
})
export class ProjectsComponent implements OnInit {
  filteredProjects: Project[] = [];
  searchTerm: string = '';
  dateErrors: Record<string, string> = {};

  constructor(public gov: GovernanceService) {}

  ngOnInit() { this.applyFilters(); }

  applyFilters() {
    this.filteredProjects = this.gov.projects.filter(p =>
      p.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.owner.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  // Convert ISO/YYYY-MM-DD to DD/MM/YY for display
  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  }

  // Parse DD/MM/YY input back to ISO string
  parseDate(input: string): string | null {
    const clean = input.trim();
    // Accept DD/MM/YY or DD/MM/YYYY
    const match = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (!match) return null;
    let [, dd, mm, yy] = match;
    const year = yy.length === 2 ? `20${yy}` : yy;
    const date = new Date(`${year}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  }

  onDateChange(event: Event, p: Project, field: 'startDate' | 'projectedEndDate' | 'actualEndDate') {
    const input = (event.target as HTMLInputElement).value.trim();

    // Allow clearing actual end date
    if (field === 'actualEndDate' && input === '') {
      p.actualEndDate = undefined;
      delete this.dateErrors[p.id];
      this.gov.updateProject(p);
      return;
    }

    if (!input) return;

    const parsed = this.parseDate(input);
    if (!parsed) {
      this.dateErrors[p.id] = `Invalid date — use DD/MM/YY`;
      return;
    }

    // Validate: start must be before projected end
    if (field === 'startDate' && p.projectedEndDate && parsed >= p.projectedEndDate) {
      this.dateErrors[p.id] = 'Start date must be before projected end date';
      return;
    }
    if (field === 'projectedEndDate' && p.startDate && parsed <= p.startDate) {
      this.dateErrors[p.id] = 'Projected end must be after start date';
      return;
    }

    delete this.dateErrors[p.id];
    (p as any)[field] = parsed;
    this.gov.updateProject(p);
  }

  getHealthClass(p: Project): string {
    const prog = this.gov.getCalculatedProgress(p);
    if (p.status === 'Critical') return 'health-crit';
    return prog < 40 ? 'health-warn' : 'health-good';
  }

  onFileSelected(event: Event, p: Project) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const validation = this.gov.validateAttachment(file);
    if (validation.valid) {
      p.hasAttachment = true;
      p.attachmentUrl = file.name;
      if (p.phase === 'Planning') { p.phase = 'Execution'; p.status = 'Active'; }
      this.gov.logUpload(p.name, file.name);
    } else {
      alert(validation.error);
    }
  }

  removeAttachment(p: Project) {
    if (!confirm(`Remove attachment from "${p.name}"?`)) return;
    p.hasAttachment = false;
    p.attachmentUrl = undefined;
    p.phase = 'Planning';
    p.status = 'Planning';
  }

  deleteProject(id: string) {
    if (confirm('Are you sure you want to remove this project from the registry?')) {
      this.gov.deleteProject(id);
      this.applyFilters();
    }
  }

  onMassUpload(event: Event) { alert('Mass Upload Triggered. Validating Template...'); }
  onDownloadTemplate() { alert('Downloading Master Template...'); }
}
