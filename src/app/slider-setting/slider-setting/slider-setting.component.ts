import { Component, inject, Input, OnInit } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { SettingsService } from '../../model/settings.service';
import { FormsModule } from '@angular/forms';
import { Settings } from '../../model/settings';
import { NgClass } from '@angular/common';

@Component({
  selector: 'tghv-slider-setting',
  standalone: true,
  imports: [
    MatSlideToggle,
    FormsModule,
    NgClass
  ],
  templateUrl: './slider-setting.component.html',
  styleUrl: './slider-setting.component.scss'
})
export class SliderSettingComponent implements OnInit {
  @Input() description!: string;
  @Input() endpoint!: string;
  @Input() settingsField!: (settings: Settings) => boolean;

  isActivated = false;

  private readonly settingsService = inject(SettingsService);

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe(settings => {
      this.isActivated = this.settingsField(settings);
    });
  }

  updateSetting() {
    this.settingsService.toggleSetting(this.endpoint).subscribe(settings => {
      this.isActivated = this.settingsField(settings);
      alert('Setting updated'); // TODO: replace with snackbar
    });
  }
}
