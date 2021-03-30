import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CabinetManagerService, PublicationForGUI } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-remove-publication-dialog',
  templateUrl: './remove-publication-dialog.component.html',
  styleUrls: ['./remove-publication-dialog.component.scss']
})
export class RemovePublicationDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<RemovePublicationDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PublicationForGUI[],
              private cabinetService: CabinetManagerService) { }


  publications: PublicationForGUI[];
  loading = false;

  ngOnInit(): void {
    this.publications = this.data;
  }

  cancel() {
    this.dialogRef.close();
  }

  remove() {
    this.loading = true;
    this.cabinetService.deletePublication(this.publications.pop().id).subscribe(() => {
      if (this.publications.length <= 0) {
        this.dialogRef.close(true);
      } else {
        this.remove();
      }
    }, error => this.loading = false);
  }
}
