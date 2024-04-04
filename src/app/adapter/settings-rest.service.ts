import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpSecurityService } from './http-security.service';
import { mergeMap, take } from 'rxjs';
import { environment } from '../../environments/environment';
import { Settings } from '../model/settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsRestService {

  private static readonly ENDPOINT = '/settings';
  private readonly http = inject(HttpClient);
  private readonly httpSecurityService = inject(HttpSecurityService);

  getSettings() {
    return this.httpSecurityService.getHttpOptions().pipe(
      mergeMap((options) =>
        this.http.get<Settings>(environment.apiUrl + SettingsRestService.ENDPOINT, options),
      ),
      take(1),
    );
  }

  toggleSetting(settingEndpointSuffix: string) {
    return this.httpSecurityService.getHttpOptions().pipe(
      mergeMap((options) =>
        this.http.put<Settings>(environment.apiUrl + SettingsRestService.ENDPOINT + settingEndpointSuffix, null,
          options),
      ),
      take(1),
    );
  }
}
