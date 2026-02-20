import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Project {
  name: string;
  type: string;
  pm: string;
  status: string;
  priority: string;
  country: string;
  currency: string;
  budget: number;
  spent: number;
  progress: number;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="projects-container">
      <div class="project-header">
        <h1>Global Project Portfolio</h1>
        <div class="controls">
          <input type="text" [(ngModel)]="search" placeholder="Search country, PM, or project...">
          <button class="btn-primary">+ New Global Entry</button>
        </div>
      </div>

      <div class="table-wrapper shadow-sm">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Project & Type</th>
              <th>Location</th>
              <th>Manager</th>
              <th>Budget Health</th>
              <th>Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredProjects">
              <td>
                <div class="p-group">
                  <span class="p-name">{{ p.name }}</span>
                  <span class="p-type">{{ p.type }}</span>
                </div>
              </td>
              <td>
                <span class="country-tag">{{ p.country }}</span>
              </td>
              <td>
                <span [class.unassigned]="p.pm === 'Unassigned'">{{ p.pm }}</span>
              </td>
              <td>
                <div class="budget-info">
                  <span class="spent">{{ p.currency }} {{ p.spent | number }}</span>
                  <span class="limit">of {{ p.budget | number }}</span>
                </div>
              </td>
              <td><span class="priority-pill" [ngClass]="p.priority.toLowerCase()">{{ p.priority }}</span></td>
              <td>
                <div class="progress-container">
                  <div class="progress-fill" [style.width.%]="p.progress"></div>
                  <span class="progress-val">{{ p.progress }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .projects-container { padding: 30px; background: #f8fafc; min-height: 100vh; }
    /* Fix for image_e1d71c overlap: Explicit row heights and padding */
    .styled-table { width: 100%; border-collapse: separate; border-spacing: 0 12px; }
    .styled-table tr { background: white; }
    .styled-table td { 
      padding: 16px; 
      vertical-align: middle; 
      border-top: 1px solid #f1f5f9; 
      border-bottom: 1px solid #f1f5f9; 
    }
    .p-group { display: flex; flex-direction: column; gap: 4px; }
    .p-name { font-weight: 700; color: #0f172a; font-size: 14px; }
    .p-type { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
    .country-tag { background: #eff6ff; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .unassigned { color: #ef4444; font-style: italic; font-weight: 600; }
    .budget-info { display: flex; flex-direction: column; line-height: 1.2; }
    .spent { font-weight: 700; color: #1e293b; font-size: 13px; }
    .limit { font-size: 11px; color: #94a3b8; }
    .progress-container { width: 100px; height: 8px; background: #f1f5f9; border-radius: 10px; position: relative; }
    .progress-fill { height: 100%; background: #0f172a; border-radius: 10px; }
    .progress-val { position: absolute; right: -35px; top: -4px; font-size: 11px; font-weight: 700; }
  `]
})
export class ProjectsComponent {
  search: string = '';
  // Initialized to prevent TS2339 build errors
  allProjects: Project[] = [
    { name: 'Cloud Migration', type: 'Infrastructure', pm: 'Alice M.', status: 'Active', priority: 'Critical', country: 'Kenya', currency: 'KES', budget: 1200000, spent: 1100000, progress: 92 },
    { name: 'Warehouse Ops', type: 'Operations', pm: 'Unassigned', status: 'Planning', priority: 'High', country: 'Uganda', currency: 'UGX', budget: 3000000, spent: 0, progress: 0 }
  ];

  get filteredProjects() {
    return this.allProjects.filter(p => 
      p.name.toLowerCase().includes(this.search.toLowerCase()) || 
      p.country.toLowerCase().includes(this.search.toLowerCase())
    );
  }
}
