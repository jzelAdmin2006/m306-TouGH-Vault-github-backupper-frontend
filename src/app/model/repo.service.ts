import { inject, Injectable } from '@angular/core';
import { RepoRestService } from '../adapter/repo-rest.service';
import { Observable } from 'rxjs';
import { Repo } from './repo';

@Injectable({
  providedIn: 'root',
})
export class RepoService {
  private readonly repoRestService: RepoRestService = inject(RepoRestService);

  public getAll(): Observable<Repo[]> {
    return this.repoRestService.getAll();
  }
}
