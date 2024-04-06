import { inject, Injectable } from '@angular/core';
import { mergeMap, take } from 'rxjs';
import { Repo } from '../model/repo';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { HttpSecurityService } from './http-security.service';

@Injectable({
  providedIn: 'root',
})
export class RepoRestService {
  private readonly http = inject(HttpClient);
  private readonly httpSecurityService = inject(HttpSecurityService);

  public getAll() {
    return this.httpSecurityService.getHttpOptions().pipe(
      mergeMap((options) =>
        this.http.get<Repo[]>(environment.apiUrl + '/repo', options),
      ),
      take(1),
    );
  }

  public restore(repoId: number) {
    return this.httpSecurityService.getHttpOptions().pipe(
      mergeMap((options) =>
        this.http.post<void>(environment.apiUrl + '/repo/' + repoId + '/restore', null, options),
      ),
      take(1),
    );
  }

  public delete(repoId: number) {
    return this.httpSecurityService.getHttpOptions().pipe(
      mergeMap((options) =>
        this.http.delete<void>(environment.apiUrl + '/repo/' + repoId, options),
      ),
      take(1),
    );
  }
}
