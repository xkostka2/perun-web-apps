import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'perun-web-apps-session-expiration-dialog',
  templateUrl: './session-expiration-dialog.component.html',
  styleUrls: ['./session-expiration-dialog.component.scss']
})
export class SessionExpirationDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<SessionExpirationDialogComponent>) { }

  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close(true);
  }

}
