import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="projects-wrapper">
      <div class="page-header">
        <div class="mass-actions">
          <button class="btn-outline" (click)="downloadTemplate()">
            <span class="icon">📥</span> Download Template
          </button>
          <label class="btn-outline upload-label">
            <span class="icon">📤</span> Bulk Upload
            <input type="file" (change)="handleMassUpload($event)" accept=".csv" hidden>
          </label>
        </div>

        <div class="header-main">
          <h1 class="page-title">Project Portfolio</h1>
          <div class="header-actions">
            <div class="search-container">
              <span class="search-icon">🔍</span>
              <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()" placeholder="Search projects...">
            </div>
            <button class="btn-primary">+ Add Single</button>
          </div>
        </div>
      </div>

      <div class="card">
         </div>
    </div>
  `,
  styles: [`
    .projects-wrapper { padding: 30px; background: #f8fafc; min-height: 100vh; }
    
    /* Mass Actions Styling */
    .mass-actions { 
      display: flex; 
      gap: 10px; 
      margin-bottom: 20px; 
      padding-bottom: 15px; 
      border-bottom: 1px solid #e2e8f0; 
    }
    .btn-outline { 
      background: white; 
      border: 1px solid #cbd5e1; 
      padding: 8px 14px; 
      border-radius: 6px; 
      font-size: 12px; 
      font-weight: 600; 
      color: #475569; 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-outline:hover { background: #f1f5f9; border-color: #94a3b8; }
    .upload-label { cursor: pointer; }

    /* Existing Header Styles */
    .header-main { display: flex; justify-content: space-between; align-items: center; }
    .page-title { font-family: 'Georgia', serif; font-size: 28px; font-weight: 700; color: #0f172a; }
    .btn-primary { background: #0f172a; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    
    /* (Include your previous table and pagination styles here) */
  `]
})
export class ProjectsComponent implements OnInit {
  // ... (Existing properties: allProjects, filteredProjects, etc.)

  // 1. Capability: Download CSV Template
  downloadTemplate() {
    const headers = "Project Name,Manager,Type,Status,Priority,Budget,Spent,Progress,DueDate\n";
    const example = "Sample Project,John Doe,Infrastructure,Active,High,1000000,250000,25,2026-12-31";
    
    const blob = new Blob([headers + example], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // 2. Capability: Mass Upload Logic
  handleMassUpload(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const content = e.target.result;
      this.parseCSV(content);
    };
    reader.readAsText(file);
  }

  private parseCSV(csvText: string) {
    const lines = csvText.split('\n');
    const newProjects = [];

    // Skip header, start at index 1
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;
      const columns = lines[i].split(',');
      
      newProjects.push({
        id: Date.now() + i,
        name: columns[0],
        pm: columns[1],
        type: columns[2],
        status: columns[3],
        priority: columns[4],
        budget: Number(columns[5]),
        spent: Number(columns[6]),
        progress: Number(columns[7]),
        dueDate: columns[8]
      });
    }

    // Merge with existing data
    this.allProjects = [...newProjects, ...this.allProjects];
    this.applyFilters();
    alert(`${newProjects.length} projects imported successfully for audit.`);
  }

  // ... (Existing ngOnInit, applyFilters, getStatusClass methods)
}
