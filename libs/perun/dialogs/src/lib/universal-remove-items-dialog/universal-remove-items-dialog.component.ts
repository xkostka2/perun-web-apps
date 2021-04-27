import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

export interface DeleteItemsDialogData {
  theme: string;
  title: string;
  description: string;
  items: string[];
}

@Component({
  selector: 'perun-web-apps-universal-remove-items-dialog',
  templateUrl: './universal-remove-items-dialog.component.html',
  styleUrls: ['./universal-remove-items-dialog.component.scss']
})
export class UniversalRemoveItemsDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<UniversalRemoveItemsDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DeleteItemsDialogData) { }

  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<string>;
  theme: string;
  loading = false;

  ngOnInit() {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<string>(this.data.items);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.dialogRef.close(true);
  }

}
