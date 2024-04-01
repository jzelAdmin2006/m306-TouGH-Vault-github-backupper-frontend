import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RepoService } from '../model/repo.service';
import { Repo } from '../model/repo';
import { catchError, switchMap, startWith, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'tghv-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit, OnDestroy {
  repos: Repo[] = [];
  private readonly repoService: RepoService = inject(RepoService);
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      interval(1000).pipe(
        startWith(0),
        switchMap(() => this.repoService.getAll()), // TODO update the isProtecting values only if the fetch time has been changed
        catchError((err) => {
          if (err.status === 404) {
            window.location.href = environment.authInitUrl;
            return [];
          } else {
            console.error(err);
            throw err;
          }
        }),
        tap((repos) => {
          this.repos = repos;
        })
      ).subscribe()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
