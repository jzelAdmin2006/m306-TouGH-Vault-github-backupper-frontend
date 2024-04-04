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
  private routeParamsSub: Subscription | undefined;
  private scanService = inject(ScanService);

  ngOnInit(): void {
    this.initialiseFilter();
    this.updateRepoListEverySec();
    this.initialiseScanInfo();
    this.setLastScanTimeOnAutoScans();
    this.subscription.add(interval(1000).subscribe(() => this.updateScanInfoDisplays()));
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
      if (['Unprotected', 'Partially protected'].includes(this.protectionStatePipe.transform(repo))) {
        repo.isProtecting = true;
      }
    });
    this.backupService.protectAll().subscribe();
  }

  scanGHChanges() {
    if (this.scanInfo) {
      this.scanInfo.scanAllowed = false;
      this.scanService.scanGHChanges().subscribe(() => {
        const now = Date.now();
        const in5Min = new Date(now + 5 * 60 * 1000);
        this.scanInfo = {
          scanAllowed: false,
          scanAllowedAt: in5Min,
          lastScanTime: new Date(now)
        };
        this.scheduleScanPermission(in5Min);
        this.updateScanInfoDisplays();
      });
    }
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
                this.oidcSecurityService.logoff().subscribe();
                return [];
              default:
                console.error(err);
                throw err;
            }
          }),
          tap((repos) => {
            this.repos = repos.map((newRepo) => {
              const existingRepo = this.repos.find(repo => repo.id === newRepo.id);
              return existingRepo && existingRepo.latestFetch === newRepo.latestFetch ?
                { ...newRepo, isProtecting: existingRepo.isProtecting } : newRepo;
            });
            this.applyFilter(this.currentFilter);
            this.updateCanProtectAll();
          }),
        )
        .subscribe(),
    );
  }

  private initialiseScanInfo() {
    this.subscription.add(
      this.scanService.getScanInfo().subscribe((scanInfo) => {
        this.scanInfo = {
          ...scanInfo,
          // this might seem not necessary, but it is because of an issue originating from JavaScript because dates are
          // saved as strings: https://stackoverflow.com/questions/2627650/why-javascript-gettime-is-not-a-function
          scanAllowedAt: new Date(scanInfo.scanAllowedAt),
          lastScanTime: new Date(scanInfo.lastScanTime)
        };
        if (scanInfo.scanAllowedAt && !scanInfo.scanAllowed) {
          this.scheduleScanPermission(this.scanInfo.scanAllowedAt);
        }
        this.updateScanInfoDisplays();
      })
    );
  }

  private setLastScanTimeOnAutoScans() {
    const now = new Date();
    const delayUntilNext5MinuteMark = (5 - now.getMinutes() % 5) * 60000 - now.getSeconds() * 1000
      - now.getMilliseconds();
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
      const lastScannedSecondsAgo = Math.round((now - this.scanInfo.lastScanTime.getTime()) / 1000);
      this.lastScannedDisplay = this.formatTime(lastScannedSecondsAgo, ' ago');
      if (!this.scanInfo.scanAllowed) {
        const scanAllowedInSeconds = Math.round((this.scanInfo.scanAllowedAt.getTime() - now) / 1000);
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
