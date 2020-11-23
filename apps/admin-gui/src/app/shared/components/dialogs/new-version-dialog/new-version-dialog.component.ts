import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-version-dialog',
  templateUrl: './new-version-dialog.component.html',
  styleUrls: ['./new-version-dialog.component.scss']
})
export class NewVersionDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<NewVersionDialogComponent>) { }

  ngOnInit(): void {
  }

  onReload() {
    location.reload()
  }

  onClose() {
    this.dialogRef.close();
  }
}
