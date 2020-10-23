import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { MatTableDataSource } from '@angular/material/table';

export interface RemoveStringValueDialogData {
  valueIndex?: number;
  values?: string[];
  doNotShowValues?: boolean;
  attribute: Attribute;
  userId: number;
  description: string;
  title: string;
}

@Component({
  selector: 'perun-web-apps-remove-string-value-dialog',
  templateUrl: './remove-string-value-dialog.component.html',
  styleUrls: ['./remove-string-value-dialog.component.scss']
})
export class RemoveStringValueDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<RemoveStringValueDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: RemoveStringValueDialogData,
              private attributesManagerService: AttributesManagerService) {
  }

  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<string>;
  loading: boolean;
  description: string;
  title: string;

  ngOnInit() {
    this.dataSource = new MatTableDataSource<string>(this.data.values);
    this.description = this.data.description;
    this.title = this.data.title;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    if (this.data.doNotShowValues) {
      // @ts-ignore
      this.data.attribute.value = '';
    } else {
      // @ts-ignore
      let values: string[] = this.data.attribute.value ? this.data.attribute.value : [];
      if (this.data.valueIndex !== undefined) {
        values.splice(this.data.valueIndex, 1);
      } else {
        values = values.filter(elem => !this.data.values.find(el => el === elem));
      }
      this.data.attribute.value = values;
    }

    this.attributesManagerService.setUserAttribute({
      user: this.data.userId,
      attribute: this.data.attribute
    }).subscribe(() => {
      this.loading = false;
      this.dialogRef.close(true);
    }, () => this.loading = false);

  }


}
