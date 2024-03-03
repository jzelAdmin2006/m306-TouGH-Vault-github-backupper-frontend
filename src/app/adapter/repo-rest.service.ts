import { inject, Injectable } from '@angular/core';
import { map, mergeMap, Observable, take } from 'rxjs';
import { Repo } from '../model/repo';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { HttpOptions } from './model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RepoRestService {
  private readonly http = inject(HttpClient);
  private readonly oidcSecurityService = inject(OidcSecurityService);

  public getAll(): Observable<Repo[]> {
    return this.getHttpOptions().pipe(
      mergeMap((options) => this.http.get<Repo[]>(environment.apiUrl + '/repo', options)),
      take(1),
    );
  }

  private getHttpOptions(): Observable<HttpOptions> {
    return this.oidcSecurityService.getAccessToken().pipe(
      map((token) => ({
        headers: new HttpHeaders()
          .set('Content-Type', 'application/json')
          .set('Authorization', 'Bearer ' + token),
      })),
    );
  }
}
