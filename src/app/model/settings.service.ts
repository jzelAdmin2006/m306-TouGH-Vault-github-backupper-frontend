import { inject, Injectable } from '@angular/core';
import { SettingsRestService } from '../adapter/settings-rest.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, first, tap } from 'rxjs/operators';
import { Settings } from './settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly settingsRestService = inject(SettingsRestService);
  private settingsSubject = new BehaviorSubject<Settings | undefined>(undefined);
  private loading = false;

  getSettings(): Observable<Settings> {
    if (!this.loading && !this.settingsSubject.getValue()) {
      this.loading = true;
      this.settingsRestService.getSettings().pipe(
        tap(settings => {
          this.settingsSubject.next(settings);
          this.loading = false;
        })
      ).subscribe();
    }
    return this.settingsSubject.asObservable().pipe(
      filter((settings): settings is Settings => settings !== undefined),
      first()
    );
  }

  toggleSetting(settingEndpointSuffix: string): Observable<Settings> {
    return this.settingsRestService.toggleSetting(settingEndpointSuffix).pipe(
      tap(settings => this.settingsSubject.next(settings))
    );
  }
}
