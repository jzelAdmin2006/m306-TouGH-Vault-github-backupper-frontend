import { NgModule } from '@angular/core';
import {
  AuthModule,
  LogLevel,
  StsConfigLoader,
} from 'angular-auth-oidc-client';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

export function configureAuth(): StsConfigLoader {
  return {
    loadConfigs: () =>
      of([
        {
          authority: environment.authUrl,
          redirectUrl: window.location.origin,
          postLogoutRedirectUri: window.location.origin,
          clientId: 'TouGH-VaultClientID',
          scope: 'openid profile roles email',
          responseType: 'code',
          silentRenew: false,
          useRefreshToken: false,
          renewTimeBeforeTokenExpiresInSeconds: 30,
          logLevel: LogLevel.Debug,
        },
      ]),
  };
}

@NgModule({
  imports: [AuthModule.forRoot({})],
  providers: [
    {
      provide: StsConfigLoader,
      useFactory: configureAuth,
      deps: [],
    },
  ],
  exports: [AuthModule],
})
export class AuthConfigModule {}
