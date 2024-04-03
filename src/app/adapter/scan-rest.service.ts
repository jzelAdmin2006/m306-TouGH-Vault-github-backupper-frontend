import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpSecurityService } from './http-security.service';
import { mergeMap, take } from 'rxjs';
import { environment } from '../../environments/environment';
import { ScanInfo } from '../model/scan-info';

@Injectable({
  providedIn: 'root'
})
export class ScanRestService {

  private static readonly ENDPOINT = '/github/scan';
  private readonly http = inject(HttpClient);
  private readonly httpSecurityService = inject(HttpSecurityService);

  public getScanInfo() {
    return this.httpSecurityService.getHttpOptions().pipe(
      mergeMap((options) =>
        this.http.get<ScanInfo>(environment.apiUrl + ScanRestService.ENDPOINT, options),
      ),
      take(1),
    );
  }

  scanGHChanges() {
    return this.httpSecurityService.getHttpOptions().pipe(
      mergeMap((options) =>
        this.http.put<void>(environment.apiUrl + ScanRestService.ENDPOINT, null, options),
      ),
      take(1),
    );
  }
}
