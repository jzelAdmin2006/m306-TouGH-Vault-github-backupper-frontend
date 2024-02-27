import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Repo } from './model/repo';
import { RepoService } from './model/repo.service';
import { AsyncPipe, NgForOf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgForOf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  protected readonly of = of;
  private readonly repoService: RepoService = inject(RepoService);
  $repos: Observable<Repo[]> = this.repoService.getAll();
}
