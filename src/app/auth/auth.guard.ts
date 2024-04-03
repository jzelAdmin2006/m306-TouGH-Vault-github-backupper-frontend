import { inject, Injectable } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private readonly oidcSecurityService = inject(OidcSecurityService);

  canActivate(): Observable<boolean> {
    return this.oidcSecurityService.checkAuth().pipe(
      map(({ isAuthenticated }) => {
        if (isAuthenticated) {
          return true;
        } else {
          this.login();
          return false;
        }
      }),
    );
  }

  login() {
    this.oidcSecurityService.authorize();
  }
}
