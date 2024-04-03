import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HttpOptions } from './model';
import { HttpHeaders } from '@angular/common/http';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Injectable({
  providedIn: 'root'
})
export class HttpSecurityService {
  private readonly oidcSecurityService = inject(OidcSecurityService);

  public getHttpOptions(): Observable<HttpOptions> {
    return this.oidcSecurityService.getAccessToken().pipe(
      map((token) => ({
        headers: new HttpHeaders()
          .set('Content-Type', 'application/json')
          .set('Authorization', 'Bearer ' + token),
      })),
    );
  }
}
