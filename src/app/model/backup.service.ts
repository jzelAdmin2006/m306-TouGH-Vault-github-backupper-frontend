import { inject, Injectable } from '@angular/core';
import { BackupRestService } from '../adapter/backup-rest.service';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private readonly backupRestService: BackupRestService = inject(BackupRestService);

  public protectAll() {
    return this.backupRestService.protectAll();
  }
}
