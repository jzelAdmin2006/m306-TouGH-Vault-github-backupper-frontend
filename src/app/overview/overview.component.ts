import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RepoService } from '../model/repo.service';
import { Repo } from '../model/repo';
import { catchError, startWith, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { interval, Subscription } from 'rxjs';
import { ProtectionStatePipe } from '../pipe/protection-state.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'tghv-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  repos: Repo[] = [];
  filteredRepos: Repo[] = [];
  columnHeaders = ['All', 'Unprotected', 'Protected', 'Rescued'];
  currentFilter: string = 'All';
  private readonly repoService: RepoService = inject(RepoService);
  private readonly subscription: Subscription = new Subscription();
  private readonly protectionStatePipe = new ProtectionStatePipe();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private routeParamsSub: Subscription | undefined;

  ngOnInit(): void {
    this.routeParamsSub = this.route.params.subscribe((params) => {
      const filter = params['filter'] || 'All';
      this.applyFilter(filter);
    });
    this.subscription.add(
      interval(1000)
        .pipe(
          startWith(0),
          switchMap(() => this.repoService.getAll()), // TODO update the isProtecting values only if the fetch time has been changed
          catchError((err) => {
            if (err.status === 404) {
              window.location.href = environment.authInitUrl;
              return [];
            } else if (err.status === 401) {
              this.oidcSecurityService.logoff().subscribe();
              return [];
            } else {
              console.error(err);
              throw err;
            }
          }),
          tap((repos) => {
            this.repos = repos;
            this.applyFilter(this.currentFilter);
          }),
        )
        .subscribe(),
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
}
