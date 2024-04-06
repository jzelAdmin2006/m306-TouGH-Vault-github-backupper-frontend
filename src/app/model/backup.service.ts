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

  public protect(repoId: number) {
    return this.backupRestService.protect(repoId);
  }

  public unprotect(repoId: number) {
    return this.backupRestService.unprotect(repoId);
  }
}
