import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'perun-web-apps-mail-change-failed-dialog',
  templateUrl: './mail-change-failed-dialog.component.html',
  styleUrls: ['./mail-change-failed-dialog.component.scss']
})
export class MailChangeFailedDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<MailChangeFailedDialogComponent>,
              private router: Router) { }

  ngOnInit(): void {
  }

  onClose() {
    this.router.navigate([])
    this.dialogRef.close()
  }
}
