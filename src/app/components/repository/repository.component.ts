import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-repository',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mck-container">
      <div class="mck-header">
        <span class="eyebrow">Project Archives</span>
        <h1>Governance Repository</h1>
      </div>

      <div class="mck-card">
        <table class="mck-table">
          <thead>
            <tr>
              <th>Project ID</th>
              <th>Category</th>
              <th>Owner</th>
              <th>Phase</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PRJ-1024</td>
              <td>Infrastructure</td>
              <td>Alice M.</td>
              <td><span class="phase-tag">Execution</span></td>
            </tr>
            <tr>
              <td>PRJ-1025</td>
              <td>Software</td>
              <td>James K.</td>
              <td><span class="phase-tag">Planning</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .mck-container { padding: 40px; background: #F5F7F9; min-height: 100vh; font-family: sans-serif; }
    .mck-header { background: #001E3C; color: #FFFFFF; padding: 40px; border-radius: 4px; margin-bottom: 30px; border-bottom: 4px solid #007DFE; }
    .eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #007DFE; font-weight: 700; }
    .mck-header h1 { margin: 10px 0 0; font-size: 28px; font-weight: 300; }
    .mck-card { background: #FFFFFF; padding: 0; border-radius: 4px; border: 1px solid #E2E8F0; overflow: hidden; }
    .mck-table { width: 100%; border-collapse: collapse; text-align: left; }
    .mck-table th { background: #F8FAFC; padding: 15px; font-size: 12px; text-transform: uppercase; color: #64748B; border-bottom: 1px solid #E2E8F0; }
    .mck-table td { padding: 15px; border-bottom: 1px solid #F1F5F9; color: #001E3C; font-size: 14px; }
    .phase-tag { background: #E2E8F0; padding: 4px 8px; border-radius: 2px; font-size: 11px; font-weight: 700; color: #475569; }
  `]
})
export class RepositoryComponent {}
