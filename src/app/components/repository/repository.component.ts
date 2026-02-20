import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Template {
  name: string;
  category: string;
  minRole: string;
  icon: string;
  description: string;
}

interface WorkflowDoc {
  id: number;
  fileName: string;
  project: string;
  uploader: string;
  status: 'Draft' | 'Pending' | 'Signed' | 'Approved';
  currentSignatory: string;
  dateUploaded: string;
}

@Component({
  selector: 'app-repository',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="repo-wrapper">
      <div class="page-header">
        <div>
          <h1 class="page-title">Document Repository</h1>
          <p class="page-subtitle">Standardized templates and digital signature workflows</p>
        </div>
        <div class="tab-switcher">
          <button [class.active]="activeTab === 'templates'" (click)="activeTab = 'templates'">
            Template Library
          </button>
          <button [class.active]="activeTab === 'workflow'" (click)="activeTab = 'workflow'">
            Signature Hub
          </button>
        </div>
      </div>

      <div *ngIf="activeTab === 'templates'">
        <div class="grid-layout">
          <div class="repo-card" *ngFor="let t of templates">
            <div class="repo-icon">{{ t.icon }}</div>
            <div class="repo-body">
              <span class="category-tag">{{ t.category }}</span>
              <h3>{{ t.name }}</h3>
              <p class="repo-desc">{{ t.description }}</p>
            </div>
            <div class="repo-footer">
              <span class="role-badge">Required: {{ t.minRole }}</span>
              <button class="btn-download" (click)="onDownload(t.name)">Download</button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="activeTab === 'workflow'" class="workflow-section">
        <div class="card">
          <div class="workflow-header">
            <h3>Approval Queue</h3>
            <button class="btn-primary" (click)="onUpload()">+ Upload for Signoff</button>
          </div>
          <table class="workflow-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Project Context</th>
                <th>Uploaded By</th>
                <th>Status</th>
                <th>Next Signatory</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let doc of workflowDocs">
                <td>
                  <div class="doc-cell">
                    <span class="doc-icon">📄</span>
                    <div class="doc-meta">
                      <span class="doc-name">{{ doc.fileName }}</span>
                      <span class="doc-date">{{ doc.dateUploaded }}</span>
                    </div>
                  </div>
                </td>
                <td>{{ doc.project }}</td>
                <td>{{ doc.uploader }}</td>
                <td>
                  <span class="status-pill" [ngClass]="doc.status.toLowerCase()">
                    {{ doc.status }}
                  </span>
                </td>
                <td>{{ doc.currentSignatory }}</td>
                <td class="text-right">
                  <button class="btn-action">Review</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .repo-wrapper { padding: 30px; background: #f8fafc; min-height: 100vh; font-family: 'Inter', sans-serif; }
    .page-title { font-family: 'Georgia', serif; font-size: 28px; font-weight: 700; color: #0f172a; margin: 0; }
    .page-subtitle { font-size: 14px; color: #64748b; margin-top: 4px; }

    .tab-switcher { display: flex; gap: 8px; margin-top: 24px; background: #f1f5f9; padding: 4px; border-radius: 10px; width: fit-content; }
    .tab-switcher button { border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 13px; color: #64748b; background: transparent; transition: 0.2s; }
    .tab-switcher button.active { background: white; color: #0f172a; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

    /* Templates Grid */
    .grid-layout { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-top: 24px; }
    .repo-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; transition: transform 0.2s; }
    .repo-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    .repo-icon { font-size: 32px; margin-bottom: 16px; }
    .category-tag { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #2563eb; letter-spacing: 0.05em; }
    .repo-card h3 { font-size: 16px; margin: 8px 0; color: #0f172a; }
    .repo-desc { font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px; flex-grow: 1; }
    
    .repo-footer { border-top: 1px solid #f1f5f9; padding-top: 16px; display: flex; justify-content: space-between; align-items: center; }
    .role-badge { font-size: 11px; color: #94a3b8; font-weight: 600; }
    .btn-download { background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }

    /* Workflow Styles */
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .workflow-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .workflow-table { width: 100%; border-collapse: collapse; }
    .workflow-table th { text-align: left; font-size: 11px; color: #94a3b8; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; }
    .workflow-table td { padding: 16px 0; border-bottom: 1px solid #f8fafc; font-size: 13px; }

    .doc-cell { display: flex; gap: 12px; align-items: center; }
    .doc-icon { font-size: 20px; }
    .doc-meta { display: flex; flex-direction: column; }
    .doc-name { font-weight: 700; color: #0f172a; }
    .doc-date { font-size: 11px; color: #94a3b8; }

    .status-pill { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .status-pill.pending { background: #fff7ed; color: #ea580c; }
    .status-pill.approved { background: #f0fdf4; color: #16a34a; }
    .status-pill.draft { background: #f1f5f9; color: #64748b; }

    .btn-primary { background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; }
    .btn-action { color: #2563eb; background: none; border: none; font-weight: 700; cursor: pointer; }
    .text-right { text-align: right; }
  `]
})
export class RepositoryComponent {
  activeTab = 'templates';

  templates: Template[] = [
    { name: 'Project Charter', category: 'Initiation', minRole: 'PM', icon: '📜', description: 'Define project scope, objectives, and key stakeholders.' },
    { name: 'Risk Register', category: 'Governance', minRole: 'PM', icon: '⚠️', description: 'Track risks, impacts, and mitigation strategies.' },
    { name: 'Change Request (CR)', category: 'Control', minRole: 'All', icon: '🔄', description: 'Formal request for modification to project scope or budget.' },
    { name: 'Implementation Plan', category: 'Execution', minRole: 'All', icon: '🚀', description: 'Step-by-step technical rollout and go-live plan.' }
  ];

  workflowDocs: WorkflowDoc[] = [
    { id: 1, fileName: 'Charter_ERP_Migration_v2.pdf', project: 'ERP Migration', uploader: 'Alice M.', status: 'Pending', currentSignatory: 'COO - Mr. Kamau', dateUploaded: 'Feb 18, 2026' },
    { id: 2, fileName: 'Budget_Adjustment_Q1.xlsx', project: 'Supply Chain', uploader: 'David O.', status: 'Approved', currentSignatory: 'Finance Director', dateUploaded: 'Feb 15, 2026' }
  ];

  onDownload(name: string) {
    console.log(`Downloading ${name} template...`);
  }

  onUpload() {
    console.log('Opening upload modal...');
  }
}
