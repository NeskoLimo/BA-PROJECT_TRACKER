import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project, DashboardStats, ProjectStatus } from '../models/project.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/projects'; // Replace with your actual endpoint

  // Internal state managed by Signal
  private _projects = signal<Project[]>([]);

  // Public read-only access for components
  readonly projects = this._projects.asReadonly();

  /**
   * Enriched Analytics computed from the local signal.
   * Maintains the logic for average progress and status counts.
   */
  readonly stats = computed<DashboardStats>(() => {
    const p = this._projects();
    const total = p.length;
    
    return {
      total,
      onTrack:   p.filter(x => x.status === 'On Track').length,
      atRisk:    p.filter(x => x.status === 'At Risk').length,
      delayed:   p.filter(x => x.status === 'Delayed').length,
      completed: p.filter(x => x.status === 'Completed').length,
      planning:  p.filter(x => x.status === 'Planning').length,
      avgProgress: total 
        ? Math.round(p.reduce((s, x) => s + x.progress, 0) / total) 
        : 0
    };
  });

  constructor() {
    this.refresh();
  }

  /**
   * Redirects initial data fetch to the DB.
   */
  refresh(): void {
    this.http.get<Project[]>(this.API_URL).subscribe({
      next: (data) => this._projects.set(data),
      error: (err) => console.error('Failed to load projects from DB', err)
    });
  }

  getById(id: string): Project | undefined {
    return this._projects().find(p => p.id === id);
  }

  /**
   * Adds project to DB and updates local signal upon success.
   */
  add(project: Omit<Project, 'id' | 'createdAt' | 'milestones' | 'risks'>) {
    return this.http.post<Project>(this.API_URL, project).pipe(
      tap(newProject => {
        this._projects.update(list => [...list, newProject]);
      })
    );
  }

  /**
   * Updates existing project in DB and local state.
   */
  update(id: string, changes: Partial<Project>) {
    return this.http.patch<Project>(`${this.API_URL}/${id}`, changes).pipe(
      tap(updated => {
        this._projects.update(list =>
          list.map(p => p.id === id ? { ...p, ...updated } : p)
        );
      })
    );
  }

  /**
   * Deletes project from DB and local state.
   */
  delete(id: string) {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this._projects.update(list => list.filter(p => p.id !== id));
      })
    );
  }

  filterBy(status?: ProjectStatus, search?: string): Project[] {
    return this._projects().filter(p => {
      const matchStatus = !status || p.status === status;
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.owner.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchStatus && matchSearch;
    });
  }
}
