import { Pipe, PipeTransform } from '@angular/core';
import { Repo } from '../model/repo';

@Pipe({
  name: 'protectionState',
  standalone: true,
})
export class ProtectionStatePipe implements PipeTransform {
  private static readonly STATES = new Map<
    string,
    (repo: Repo) => boolean | null
  >([
    ['Protecting...', (r) => r.isProtecting], // TODO consider 'Recovering...' as well according to requirements
    ['Unprotected', (r) => r.latestFetch === null],
    ['Rescued', (r) => r.latestPush === null],
    ['Protected', (r) => r.latestPush === r.latestFetch],
    [
      'Partially protected',
      (r) => r.latestPush && r.latestFetch && r.latestPush > r.latestFetch,
    ],
  ]);

  transform(repo: Repo): string {
    for (let [message, condition] of ProtectionStatePipe.STATES) {
      if (condition(repo)) {
        return message;
      }
    }
    return 'Unknown';
  }
}
