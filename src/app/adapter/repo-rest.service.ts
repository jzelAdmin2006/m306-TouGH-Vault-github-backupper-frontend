import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Repo } from '../model/repo';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RepoRestService {
  private readonly http: HttpClient = inject(HttpClient);

  public getAll(): Observable<Repo[]> {
    return this.http.get<Repo[]>(environment.apiUrl + '/repo');
  }
}
