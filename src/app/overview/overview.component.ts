import { Component, inject, OnInit } from '@angular/core';
import { RepoService } from '../model/repo.service';
import { Repo } from '../model/repo';
import { catchError, firstValueFrom, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'tghv-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  repos: Repo[] = [];
  private readonly repoService: RepoService = inject(RepoService);

  async ngOnInit(): Promise<void> {
    await firstValueFrom(
      this.repoService.getAll().pipe( // TODO get repos every few seconds, update the isProtecting values only if the fetch time has been changed
        catchError((err) => {
          if (err.status === 404) {
            window.location.href = environment.authInitUrl;
            return [];
          } else {
            console.log(err);
            throw err;
          }
        }),
        tap((repos) => {
          this.repos = repos;
        })
      )
    );
  }
}
