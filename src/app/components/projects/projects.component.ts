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
            ↑ Upload
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

      <div class="table-wrapper">
        <table class="mck-table">
          <thead>
            <tr>
              <th class="col-project">Project</th>
              <th class="col-dates">Timelines</th>
              <th class="col-progress">Progress</th>
              <th class="col-scope">Scope</th>
              <th class="col-phase">Phase</th>
              <th class="col-status">Status</th>
              <th class="col-actions" *ngIf="gov.canEdit()"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredProjects" [class.row-critical]="p.status === 'Critical'">

              <!-- Project -->
              <td class="col-project">
                <div class="p-name">{{p.name}}</div>
                <div class="p-meta">{{p.owner}} · {{p.location}}</div>
              </td>

              <!-- Timelines -->
              <td class="col-dates">
                <div class="date-field">
                  <label class="date-label">Start</label>
                  <input class="date-input" type="text"
                    [value]="formatDate(p.startDate)"
                    (blur)="onDateChange($event, p, 'startDate')"
                    (keydown.enter)="onDateChange($event, p, 'startDate')"
                    placeholder="DD/MM/YY" maxlength="8"
                    [readonly]="!gov.canEdit()" />
                </div>
                <div class="date-field">
                  <label class="date-label">Proj.</label>
                  <input class="date-input" type="text"
                    [value]="formatDate(p.projectedEndDate)"
                    (blur)="onDateChange($event, p, 'projectedEndDate')"
                    (keydown.enter)="onDateChange($event, p, 'projectedEndDate')"
                    placeholder="DD/MM/YY" maxlength="8"
                    [readonly]="!gov.canEdit()" />
                </div>
                <div class="date-field">
                  <label class="date-label">Actual</label>
                  <input class="date-input" type="text"
                    [class.actual-set]="p.actualEndDate"
                    [value]="p.actualEndDate ? formatDate(p.actualEndDate) : ''"
                    (blur)="onDateChange($event, p, 'actualEndDate')"
                    (keydown.enter)="onDateChange($event, p, 'actualEndDate')"
                    placeholder="DD/MM/YY" maxlength="8"
                    [readonly]="!gov.canEdit()" />
                </div>
                <div class="date-error" *ngIf="dateErrors[p.id]">⚠️ {{dateErrors[p.id]}}</div>
              </td>

              <!-- Progress -->
              <td class="col-progress">
                <div class="prog-wrapper">
                  <div class="prog-track">
                    <div class="prog-fill"
                         [style.width.%]="gov.getCalculatedProgress(p)"
                         [ngClass]="getHealthClass(p)"></div>
                  </div>
                  <span class="prog-text">{{gov.getCalculatedProgress(p)}}%</span>
                </div>
              </td>

              <!-- Scope (compact) -->
              <td class="col-scope">
                <div *ngIf="p.hasAttachment" class="file-pill" [title]="p.attachmentUrl || ''">
                  📄 <span class="file-name">{{p.attachmentUrl}}</span>
                  <span class="remove-file" (click)="removeAttachment(p)" *ngIf="gov.canEdit()">×</span>
                </div>
                <label *ngIf="!p.hasAttachment && gov.canEdit()" class="upload-label" [title]="'Link scope document'">
                  <input type="file" (change)="onFileSelected($event, p)" accept=".pdf,.doc,.docx" style="display:none">
                  📎 Link
                </label>
                <span *ngIf="!p.hasAttachment && !gov.canEdit()" class="no-attachment">—</span>
              </td>

              <!-- Phase (was Gate) -->
              <td class="col-phase">
                <span class="phase-badge" [ngClass]="p.phase.toLowerCase()">{{p.phase}}</span>
              </td>

              <!-- Status -->
              <td class="col-status">
                <span class="status-dot" [ngClass]="p.status.toLowerCase()" [title]="p.status"></span>
                <span class="status-text">{{p.status}}</span>
              </td>

              <!-- Actions -->
              <td class="col-actions" *ngIf="gov.canEdit()">
                <button class="icon-btn" title="Edit" >✏️</button>
                <button class="icon-btn del" *ngIf="gov.canDelete()" (click)="deleteProject(p.id)" title="Delete">🗑️</button>
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
    .mck-container { padding: 28px; background: #f5f7f9; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .title-group h1 { font-size: 22px; font-weight: 700; margin: 4px 0 2px; font-family: 'Georgia', serif; color: #1a2332; }
    .title-group p { font-size: 12px; color: #718096; margin: 0; }
    .eyebrow { color: #007DFE; font-weight: 800; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
    .action-group { display: flex; gap: 8px; align-items: center; }

    .filter-strip { margin-bottom: 16px; }
    .search-wrap { position: relative; max-width: 400px; }
    .search-icon { position: absolute; left: 12px; top: 10px; color: #94a3b8; font-size: 13px; }
    .search-wrap input { width: 100%; padding: 9px 12px 9px 36px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; outline: none; box-sizing: border-box; }
    .search-wrap input:focus { border-color: #007DFE; }

    /* Table wrapper allows horizontal scroll on very small screens */
    .table-wrapper { background: white; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
    .mck-table { width: 100%; border-collapse: collapse; table-layout: fixed; }

    /* Column widths — tuned to fit screen */
    .col-project  { width: 22%; }
    .col-dates    { width: 20%; }
    .col-progress { width: 14%; }
    .col-scope    { width: 12%; }
    .col-phase    { width: 10%; }
    .col-status   { width: 12%; }
    .col-actions  { width: 7%; }

    .mck-table th { padding: 10px 12px; background: #f8fafc; text-align: left; font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #f1f5f9; font-weight: 700; white-space: nowrap; }
    .mck-table td { padding: 12px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; vertical-align: top; color: #2d3748; }
    .mck-table tr:last-child td { border-bottom: none; }
    .row-critical td { background: #fff8f8; }

    .p-name { font-weight: 700; color: #1a2332; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .p-meta { font-size: 11px; color: #94a3b8; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* Date inputs */
    .date-field { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; }
    .date-label { font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; width: 34px; flex-shrink: 0; }
    .date-input {
      padding: 3px 6px; border: 1px solid #e2e8f0; border-radius: 4px;
      font-size: 11px; color: #1a2332; outline: none; width: 72px;
      font-family: 'Courier New', monospace; background: #f8fafc;
    }
    .date-input:focus { border-color: #007DFE; background: #fff; }
    .date-input[readonly] { color: #94a3b8; cursor: default; }
    .date-input.actual-set { color: #10b981; border-color: #a7f3d0; background: #f0fdf4; }
    .date-error { font-size: 10px; color: #ef4444; margin-top: 2px; }

    /* Progress */
    .prog-wrapper { display: flex; align-items: center; gap: 6px; }
    .prog-track { flex: 1; height: 5px; background: #e2e8f0; border-radius: 10px; overflow: hidden; min-width: 50px; }
    .prog-fill { height: 100%; transition: width 0.4s; }
    .prog-text { font-size: 11px; font-weight: 700; color: #64748b; white-space: nowrap; }
    .health-good { background: #10b981; }
    .health-warn { background: #f59e0b; }
    .health-crit { background: #ef4444; }

    /* Scope — compact */
    .file-pill { display: flex; align-items: center; gap: 4px; background: #f0f9ff; color: #0369a1; padding: 3px 7px; border-radius: 4px; border: 1px solid #bae6fd; font-size: 11px; max-width: 100%; }
    .file-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60px; }
    .upload-label { color: #007DFE; font-weight: 600; cursor: pointer; font-size: 12px; text-decoration: underline; white-space: nowrap; }
    .remove-file { cursor: pointer; color: #ef4444; font-weight: bold; font-size: 13px; flex-shrink: 0; }
    .no-attachment { color: #cbd5e0; }

    /* Phase badge — compact */
    .phase-badge { padding: 2px 7px; border-radius: 4px; font-size: 9px; font-weight: 800; text-transform: uppercase; white-space: nowrap; display: inline-block; }
    .initiation { background: #f1f5f9; color: #64748b; }
    .planning   { background: #f1f5f9; color: #475569; }
    .execution  { background: #e0f2fe; color: #0369a1; }
    .closure    { background: #f0fdf4; color: #166534; }

    /* Status — dot + short text */
    .col-status td, .col-status { vertical-align: middle; }
    .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 5px; vertical-align: middle; flex-shrink: 0; }
    .status-text { font-size: 11px; font-weight: 600; vertical-align: middle; }
    .active .status-dot, span.active    { background: #10b981; }
    .critical .status-dot, span.critical { background: #ef4444; }
    .planning .status-dot               { background: #94a3b8; }
    .closure .status-dot                { background: #166534; }
    span.active   { color: #10b981; }
    span.critical { color: #ef4444; }

    /* Actions */
    .col-actions { text-align: center; vertical-align: middle !important; }
    .icon-btn { background: none; border: none; cursor: pointer; font-size: 14px; padding: 3px; border-radius: 4px; transition: transform 0.15s; }
    .icon-btn:hover { transform: scale(1.2); background: #f7f9fc; }

    .btn-main { background: #001E3C; color: white; padding: 8px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; display: inline-block; font-size: 12px; border: none; }
    .btn-main:hover { background: #1a2332; }
    .btn-sec { background: white; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; }
    .btn-sec:hover { background: #f7f9fc; }

    .empty-state { text-align: center; color: #a0aec0; padding: 40px !important; font-size: 13px; }
  `]
})
export class ProjectsComponent implements OnInit {
  filteredProjects: Project[] = [];
  searchTerm = '';
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

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  }

  parseDate(input: string): string | null {
    const match = input.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (!match) return null;
    const [, dd, mm, yy] = match;
    const year = yy.length === 2 ? `20${yy}` : yy;
    const date = new Date(`${year}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`);
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  }

  onDateChange(event: Event, p: Project, field: 'startDate' | 'projectedEndDate' | 'actualEndDate') {
    const input = (event.target as HTMLInputElement).value.trim();
    if (field === 'actualEndDate' && input === '') {
      p.actualEndDate = undefined;
      delete this.dateErrors[p.id];
      this.gov.updateProject(p);
      return;
    }
    if (!input) return;
    const parsed = this.parseDate(input);
    if (!parsed) { this.dateErrors[p.id] = 'Use DD/MM/YY format'; return; }
    if (field === 'startDate' && p.projectedEndDate && parsed >= p.projectedEndDate) { this.dateErrors[p.id] = 'Start must be before projected end'; return; }
    if (field === 'projectedEndDate' && p.startDate && parsed <= p.startDate) { this.dateErrors[p.id] = 'Projected end must be after start'; return; }
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
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const v = this.gov.validateAttachment(file);
    if (v.valid) {
      p.hasAttachment = true;
      p.attachmentUrl = file.name;
      if (p.phase === 'Planning') { p.phase = 'Execution'; p.status = 'Active'; }
      this.gov.logUpload(p.name, file.name);
    } else { alert(v.error); }
  }

  removeAttachment(p: Project) {
    if (!confirm(`Remove attachment from "${p.name}"?`)) return;
    p.hasAttachment = false;
    p.attachmentUrl = undefined;
    p.phase = 'Planning';
    p.status = 'Planning';
  }

  deleteProject(id: string) {
    if (confirm('Remove this project from the registry?')) {
      this.gov.deleteProject(id);
      this.applyFilters();
    }
  }

  onMassUpload(event: Event) { alert('Mass Upload Triggered. Validating Template...'); }
  onDownloadTemplate() { alert('Downloading Master Template...'); }
}
