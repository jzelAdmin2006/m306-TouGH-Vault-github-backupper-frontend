import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, mergeMap, Observable, take } from 'rxjs';
import { HttpOptions } from '../adapter/model';
import { environment } from '../../environments/environment';

@Component({
  selector: 'tghv-callback',
  standalone: true,
  imports: [],
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss'
})
export class CallbackComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly http = inject(HttpClient);

  ngOnInit(): void {
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.invokeCallback(code);
    } else {
      this.sendHome();
    }
  }

  public invokeCallback(code: String): void {
    this.getHttpOptions().pipe(
        mergeMap(options => {
          const params = new HttpParams().set('code', code.toString() || '');
          return this.http.get<void>(environment.apiUrl + '/auth/callback', { ...options, params });
        }),
        take(1),
    ).subscribe(code => {
      this.sendHome();
    });
  }

  private getHttpOptions(): Observable<HttpOptions> {
    const accessToken = this.oidcSecurityService.getAccessToken();
    if (accessToken) {
      return accessToken.pipe(
          map((token) => ({
            headers: new HttpHeaders()
                .set('Content-Type', 'application/json')
                .set('Authorization', 'Bearer ' + token),
          })),
      );
    } else {
      this.sendHome();
      throw new Error('User is not authenticated');
    }
  }

  private sendHome() {
    window.location.href = environment.homeUrl;
  }
}
