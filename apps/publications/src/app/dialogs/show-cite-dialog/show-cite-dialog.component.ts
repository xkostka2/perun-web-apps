import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicationForGUI } from '@perun-web-apps/perun/openapi';
@Component({
  selector: 'perun-web-apps-show-cite-dialog',
  templateUrl: './show-cite-dialog.component.html',
  styleUrls: ['./show-cite-dialog.component.scss']
})
export class ShowCiteDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<ShowCiteDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PublicationForGUI) { }

  publication: PublicationForGUI;

  ngOnInit(): void {
    this.publication = this.data;
  }

  ok() {
    this.dialogRef.close();
  }
}
