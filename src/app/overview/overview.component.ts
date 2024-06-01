import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RepoService } from '../model/repo.service';
import { Repo } from '../model/repo';
import { catchError, startWith, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { interval, Subscription } from 'rxjs';
import { ProtectionStatePipe } from '../pipe/protection-state.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { BackupService } from '../model/backup.service';
import { ScanService } from '../model/scan.service';
import { ScanInfo } from '../model/scan-info';
import { Settings } from '../model/settings';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from '../model/settings.service';
import { WarningComponent } from '../warning/warning.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'tghv-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  repos: Repo[] = [];
  filteredRepos: Repo[] = [];
  columnHeaders = ['All', 'Unprotected', 'Protected', 'Rescued'];
  currentFilter = 'All';
  canProtectAll = false;
  scanInfo: ScanInfo | undefined;
  lastScannedDisplay: string = 'unknown time ago';
  scanAllowedInDisplay: string = 'unknown time';
  private readonly repoService = inject(RepoService);
  private readonly backupService = inject(BackupService);
  private readonly subscription = new Subscription();
  private readonly protectionStatePipe = new ProtectionStatePipe();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly settingsService = inject(SettingsService);
  private readonly scanService = inject(ScanService);
  private readonly warning = inject(MatDialog);

  private routeParamsSub: Subscription | undefined;
  private settings: Settings | undefined;
  private repoDataInitialised = false;

  readonly autoRepoField = (s: Settings) => s.autoRepoUpdate;
  readonly autoCommitField = (s: Settings) => s.autoCommitUpdate;

  ngOnInit(): void {
    this.initialiseFilter();
    this.updateRepoListEverySec();
    this.initialiseScanInfo();
    this.setLastScanTimeOnAutoScans();
    this.settingsService
      .getSettings()
      .subscribe((settings) => (this.settings = settings));
    this.subscription.add(
      interval(1000).subscribe(() => this.updateScanInfoDisplays()),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.routeParamsSub?.unsubscribe();
  }

  applyFilter(filter: string): void {
    this.currentFilter = filter;
    switch (filter) {
      case 'All':
        this.filteredRepos = this.repos;
        break;
      case 'Unprotected':
        this.filteredRepos = this.repos.filter((repo) =>
          ['Unprotected', 'Partially protected'].includes(
            this.protectionStatePipe.transform(repo),
          ),
        );
        break;
      case 'Protected':
        this.filteredRepos = this.repos.filter(
          (repo) => this.protectionStatePipe.transform(repo) === 'Protected',
        );
        break;
      case 'Rescued':
        this.filteredRepos = this.repos.filter(
          (repo) => this.protectionStatePipe.transform(repo) === 'Rescued',
        );
        break;
      default:
        this.filteredRepos = this.repos;
    }
    this.router.navigate(['/overview', filter]);
  }

  protectAll(): void {
    this.repos.forEach((repo) => {
      if (
        ['Unprotected', 'Partially protected'].includes(
          this.protectionStatePipe.transform(repo),
        )
      ) {
        repo.isProtecting = true;
      }
    });
    this.backupService.protectAll().subscribe({
      next: () => {
        this.snackBar.open(
          'Protection of all repos has been triggered successfully',
          'Close',
          {
            duration: 2000,
            verticalPosition: 'top',
            panelClass: 'success-snackbar',
          },
        );
        this.updateCanProtectAll();
      },
      error: (err) => {
        this.snackBar.open(
          `Failed to protect all repos, status ${err.status > 0 ? err.status : 'n/a'}`,
          'Close',
          {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: 'error-snackbar',
          },
        );
      },
    });
  }

  scanGHChanges() {
    if (this.scanInfo) {
      this.scanInfo.scanAllowed = false;
      this.scanService.scanGHChanges().subscribe({
        next: () => {
          this.snackBar.open('Scan has been triggered successfully', 'Close', {
            duration: 2000,
            verticalPosition: 'top',
            panelClass: 'success-snackbar',
          });
          const now = Date.now();
          const in5Min = new Date(now + 5 * 60 * 1000);
          this.scanInfo = {
            scanAllowed: false,
            scanAllowedAt: in5Min,
            lastScanTime: new Date(now),
          };
          this.scheduleScanPermission(in5Min);
          this.updateScanInfoDisplays();
          this.scanService.getScanInfo().subscribe((scanInfo) => {
            this.scanInfo = this.parseScanInfo(scanInfo);
            this.updateScanInfoDisplays();
          });
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open(
            `Failed to scan for changes, status ${err.status > 0 ? err.status : 'n/a'}`,
            'Close',
            {
              duration: 3000,
              verticalPosition: 'top',
              panelClass: 'error-snackbar',
            },
          );
        },
      });
    }
  }

  protect(repo: Repo) {
    this.backupService.protect(repo.id).subscribe({
      next: () => {
        this.snackBar.open(
          `Protection of repo "${repo.name}" has been triggered successfully`,
          'Close',
          {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: 'success-snackbar',
          },
        );
        repo.isProtecting = true;
      },
      error: (err) => {
        this.snackBar.open(
          `Failed to protect repo "${repo.name}", status ${err.status > 0 ? err.status : 'n/a'}`,
          'Close',
          {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: 'error-snackbar',
          },
        );
      },
    });
  }

  unprotect(repo: Repo) {
    this.backupService.unprotect(repo.id).subscribe({
      next: () => {
        this.snackBar.open(
          `Protection of repo "${repo.name}" has been removed`,
          'Close',
          {
            duration: 2500,
            verticalPosition: 'top',
            panelClass: 'success-snackbar',
          },
        );
        repo.latestFetch = null;
      },
      error: (err) => {
        this.snackBar.open(
          `Failed to unprotect repo "${repo.name}", status ${err.status > 0 ? err.status : 'n/a'}`,
          'Close',
          {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: 'error-snackbar',
          },
        );
      },
    });
  }

  restore(repo: Repo) {
    this.repoService.restore(repo.id).subscribe({
      next: () => {
        repo.isRestoring = true;
        this.snackBar.open(
          `Restoration of repo "${repo.name}" has been triggered successfully`,
          'Close',
          {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: 'success-snackbar',
          },
        );
      },
      error: (err) => {
        this.snackBar.open(
          `Failed to restore repo "${repo.name}", status ${err.status > 0 ? err.status : 'n/a'}`,
          'Close',
          {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: 'error-snackbar',
          },
        );
      },
    });
  }

  delete(repo: Repo) {
    const dialogRef = this.warning.open(WarningComponent, {});

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.proceedWithDeletrion(repo);
      }
    });
  }

  private proceedWithDeletrion(repo: Repo) {
    this.repoService.delete(repo.id).subscribe({
      next: () => {
        this.snackBar.open(
          `Repo "${repo.name}" has been deleted successfully`,
          'Close',
          {
            duration: 2500,
            verticalPosition: 'top',
            panelClass: 'success-snackbar',
          },
        );
        this.repos = this.repos.filter((r) => r.id !== repo.id);
        this.applyFilter(this.currentFilter);
      },
      error: (err) => {
        this.snackBar.open(
          `Failed to delete repo "${repo.name}", status ${err.status > 0 ? err.status : 'n/a'}`,
          'Close',
          {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: 'error-snackbar',
          },
        );
      },
    });
  }

  private initialiseFilter() {
    this.routeParamsSub = this.route.params.subscribe((params) => {
      const filter = params['filter'] || 'All';
      this.applyFilter(filter);
    });
  }

  private updateRepoListEverySec() {
    this.subscription.add(
      interval(1000)
        .pipe(
          startWith(0),
          switchMap(() => this.repoService.getAll()),
          catchError((err) => {
            switch (err.status) {
              case 404:
                window.location.href = environment.authInitUrl;
                return [];
              case 401:
                window.location.href = environment.homeUrl;
                this.oidcSecurityService.logoff().subscribe();
                return [];
              default:
                this.snackBar.open(
                  `Failed to fetch repos, status ${err.status > 0 ? err.status : 'n/a'}`,
                  'Close',
                  {
                    duration: 2000,
                    verticalPosition: 'top',
                    panelClass: 'error-snackbar',
                  },
                );
                throw err;
            }
          }),
          tap((repos) => {
            this.repos = repos.map((newRepo) => {
              const existingRepo = this.repos.find(
                (repo) => repo.id === newRepo.id,
              );
              return {
                ...newRepo,
                isProtecting:
                  this.autoBackupUpdateIsTriggered(existingRepo, newRepo) ||
                  (existingRepo &&
                    existingRepo.latestFetch === newRepo.latestFetch
                      ? existingRepo
                      : newRepo
                  ).isProtecting,
                isRestoring:
                  existingRepo &&
                  existingRepo.isRestoring &&
                  !newRepo.latestPush,
              };
            });
            this.repoDataInitialised = true;
            this.applyFilter(this.currentFilter);
            this.updateCanProtectAll();
          }),
        )
        .subscribe(),
    );
  }

  private autoBackupUpdateIsTriggered(
    existingRepo: Repo | undefined,
    newRepo: Repo,
  ) {
    return (
      this.settings &&
      ((this.repoDataInitialised &&
          !existingRepo &&
          this.settings.autoRepoUpdate) ||
        (existingRepo &&
          this.settings.autoCommitUpdate &&
          existingRepo.latestFetch && newRepo.latestFetch &&
          existingRepo.latestPush && newRepo.latestPush &&
          existingRepo.latestFetch === newRepo.latestFetch &&
          existingRepo.latestFetch != newRepo.latestPush))
    );
  }

  private initialiseScanInfo() {
    this.subscription.add(
      this.scanService.getScanInfo().subscribe((scanInfo) => {
        this.scanInfo = this.parseScanInfo(scanInfo);
        if (scanInfo.scanAllowedAt && !scanInfo.scanAllowed) {
          this.scheduleScanPermission(this.scanInfo.scanAllowedAt);
        }
        this.updateScanInfoDisplays();
      }),
    );
  }

  private parseScanInfo(scanInfo: ScanInfo) {
    return {
      ...scanInfo,
      // this might seem not necessary, but it is because of an issue originating from JavaScript because dates are
      // saved as strings: https://stackoverflow.com/questions/2627650/why-javascript-gettime-is-not-a-function
      scanAllowedAt: new Date(scanInfo.scanAllowedAt),
      lastScanTime: new Date(scanInfo.lastScanTime),
    };
  }

  private setLastScanTimeOnAutoScans() {
    const now = new Date();
    const delayUntilNext5MinuteMark =
      (5 - (now.getMinutes() % 5)) * 60000 -
      now.getSeconds() * 1000 -
      now.getMilliseconds();
    this.subscription.add(
      interval(5 * 60 * 1000)
        .pipe(startWith(0))
        .subscribe(() => {
          setTimeout(() => {
            if (this.scanInfo) {
              this.scanInfo.lastScanTime = new Date();
              this.updateScanInfoDisplays();
            }
          }, delayUntilNext5MinuteMark);
        }),
    );
  }

  private scheduleScanPermission(scanAllowedAt: Date) {
    setTimeout(() => {
      if (this.scanInfo) {
        this.scanInfo.scanAllowed = true;
        this.updateScanInfoDisplays();
      }
    }, scanAllowedAt.getTime() - Date.now());
  }

  private updateScanInfoDisplays() {
    if (this.scanInfo) {
      const now = Date.now();
      const lastScannedSecondsAgo = Math.round(
        (now - this.scanInfo.lastScanTime.getTime()) / 1000,
      );
      this.lastScannedDisplay = this.formatTime(lastScannedSecondsAgo, ' ago');
      if (!this.scanInfo.scanAllowed) {
        const scanAllowedInSeconds = Math.round(
          (this.scanInfo.scanAllowedAt.getTime() - now) / 1000,
        );
        this.scanAllowedInDisplay = this.formatTime(scanAllowedInSeconds);
      }
    } else {
      this.lastScannedDisplay = 'unknown time ago';
      this.scanAllowedInDisplay = 'unknown time';
    }
  }

  private formatTime(seconds: number, suffix?: string): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    let timeString = '';
    if (minutes > 0) {
      timeString += `${minutes}min, `;
    }
    timeString += `${remainingSeconds}s`;
    if (suffix) {
      timeString += suffix;
    }
    return timeString;
  }

  private updateCanProtectAll(): void {
    this.canProtectAll = this.repos.some((repo) =>
      ['Unprotected', 'Partially protected'].includes(
        this.protectionStatePipe.transform(repo),
      ),
    );
  }
}
