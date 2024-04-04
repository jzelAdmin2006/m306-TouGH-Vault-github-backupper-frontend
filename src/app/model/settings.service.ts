import { inject, Injectable } from '@angular/core';
import { SettingsRestService } from '../adapter/settings-rest.service';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private readonly settingsRestService: SettingsRestService = inject(SettingsRestService);

  getSettings() {
    return this.settingsRestService.getSettings();
  }

  toggleSetting(settingEndpointSuffix: string) {
    return this.settingsRestService.toggleSetting(settingEndpointSuffix);
  }
}
