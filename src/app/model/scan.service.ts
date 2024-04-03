import { inject, Injectable } from '@angular/core';
import { ScanRestService } from '../adapter/scan-rest.service';

@Injectable({
  providedIn: 'root'
})
export class ScanService {
  private readonly scanRestService: ScanRestService = inject(ScanRestService);

  getScanInfo() {
    return this.scanRestService.getScanInfo();
  }

  scanGHChanges() {
    return this.scanRestService.scanGHChanges();
  }
}
