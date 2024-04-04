import { Pipe, PipeTransform } from '@angular/core';
import { Repo } from '../model/repo';

@Pipe({
  name: 'repoOrdering',
  standalone: true
})
export class RepoOrderingPipe implements PipeTransform {

  transform(value: Repo[]): Repo[] {
    return value.sort((a, b) => {
      return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
    });
  }
}

