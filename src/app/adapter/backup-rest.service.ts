import { inject, Injectable } from '@angular/core';
import { mergeMap, take } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HttpSecurityService } from './http-security.service';

@Injectable({
  providedIn: 'root'
})
export class BackupRestService {
  private readonly http = inject(HttpClient);
  private readonly httpSecurityService = inject(HttpSecurityService);

  public protectAll() {
    return this.httpSecurityService.getHttpOptions().pipe(
      mergeMap((options) =>
        this.http.put<void>(environment.apiUrl + '/backup/all', null, options),
      ),
      take(1),
    );
  }

  public protect(repoId: number) {
    return this.httpSecurityService.getHttpOptions().pipe(
      mergeMap((options) =>
        this.http.put<void>(environment.apiUrl + '/backup/' + repoId, null, options),
      ),
      take(1),
    );
  }

  public unprotect(repoId: number) {
    return this.httpSecurityService.getHttpOptions().pipe(
      mergeMap((options) =>
        this.http.delete<void>(environment.apiUrl + '/backup/' + repoId, options),
      ),
      take(1),
    );
  }
}
