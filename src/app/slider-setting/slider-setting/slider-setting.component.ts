import { Component, EventEmitter, inject, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { SettingsService } from '../../model/settings.service';
import { FormsModule } from '@angular/forms';
import { Settings } from '../../model/settings';
import { NgClass } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'tghv-slider-setting',
  standalone: true,
  imports: [
    MatSlideToggle,
    FormsModule,
    NgClass
  ],
  templateUrl: './slider-setting.component.html',
  styleUrl: './slider-setting.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SliderSettingComponent implements OnInit {
  @Input() description!: string;
  @Input() endpoint!: string;
  @Input() settingsField!: (settings: Settings) => boolean;
  @Output() valueChange = new EventEmitter<boolean>();

  isActivated = false;

  private readonly settingsService = inject(SettingsService);
  private readonly snackBar: MatSnackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.settingsService.getSettings().subscribe(settings => {
      this.isActivated = this.settingsField(settings);
    });
  }

  updateSetting() {
    this.valueChange.emit(!this.isActivated);
    this.settingsService.toggleSetting(this.endpoint).subscribe({
      next: (settings) => {
        this.isActivated = this.settingsField(settings);
        this.valueChange.emit(this.isActivated);
        this.snackBar.open('Setting updated successfully', 'Close', {
          duration: 2000,
          verticalPosition: 'top',
          panelClass: 'success-snackbar'
        });
      },
      error: (err) => {
        this.snackBar.open(`Failed to update setting, status ${err.status > 0 ? err.status : 'n/a'}`,
          'Close', {
            duration: 2000,
            verticalPosition: 'top',
            panelClass: 'error-snackbar'
          });
      }
    });
  }
}
