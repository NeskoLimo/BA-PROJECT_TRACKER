import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Project, DashboardStats, ProjectStatus } from '../models/project.model';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/v1/projects';

  private _projects = signal<Project[]>([]);
  readonly projects = this._projects.asReadonly();

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
      avgProgress: total ? Math.round(p.reduce((s, x) => s + x.progress, 0) / total) : 0
    };
  });

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.http.get<Project[]>(this.API_URL).subscribe({
      next: (data) => this._projects.set(data),
      error: (err) => console.error('Database fetch failed', err)
    });
  }

  /**
   * MASS UPLOAD LOGIC
   * Takes the template file and redirects it to the DB via Multipart/Form-Data.
   * Updates local signals with the newly imported projects.
   */
  massUpload(file: File): Observable<Project[]> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<Project[]>(`${this.API_URL}/mass-upload`, formData).pipe(
      tap((newProjects) => {
        // Atomic update to signal: keeps current list + adds new entries from DB
        this._projects.update(currentList => [...currentList, ...newProjects]);
      })
    );
  }

  add(project: Omit<Project, 'id' | 'createdAt' | 'milestones' | 'risks'>) {
    return this.http.post<Project>(this.API_URL, project).pipe(
      tap(newP => this._projects.update(list => [...list, newP]))
    );
  }

  update(id: string, changes: Partial<Project>) {
    return this.http.patch<Project>(`${this.API_URL}/${id}`, changes).pipe(
      tap(updated => {
        this._projects.update(list => list.map(p => p.id === id ? { ...p, ...updated } : p));
      })
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      tap(() => this._projects.update(list => list.filter(p => p.id !== id)))
    );
  }
}
