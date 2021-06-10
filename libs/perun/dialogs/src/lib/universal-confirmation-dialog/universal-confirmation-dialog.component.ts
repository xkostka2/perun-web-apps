import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmationDialogData {
  theme: string;
  message: string;
}

@Component({
  selector: 'perun-web-apps-universal-confirmation-dialog',
  templateUrl: './universal-confirmation-dialog.component.html',
  styleUrls: ['./universal-confirmation-dialog.component.scss']
})
export class UniversalConfirmationDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<UniversalConfirmationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData) { }

  theme: string;
  message: string;

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.message = this.data.message;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.dialogRef.close(true);
  }

}
