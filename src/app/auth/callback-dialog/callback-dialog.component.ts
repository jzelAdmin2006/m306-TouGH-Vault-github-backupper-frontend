import { Component, Inject } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogContent, MatDialogActions} from '@angular/material/dialog';
import {MatButtonToggle} from "@angular/material/button-toggle";
@Component({
  selector: 'tghv-callback-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatButtonToggle
  ],
  templateUrl: './callback-dialog.component.html',
  styleUrl: './callback-dialog.component.scss'
})
export class CallbackDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CallbackDialogComponent>) {}

  proceed(): void {
    this.dialogRef.close(true);
  }
}
