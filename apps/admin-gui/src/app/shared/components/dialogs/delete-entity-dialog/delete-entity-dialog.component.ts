import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-delete-entity-dialog',
  templateUrl: './delete-entity-dialog.component.html',
  styleUrls: ['./delete-entity-dialog.component.scss']
})
export class DeleteEntityDialogComponent {

  constructor() { }

  @Input()
  title: string;
  @Input()
  entityNames: MatTableDataSource<any> = new MatTableDataSource<any>();
  @Input()
  entityType: string;
  @Input()
  relations: string[] = [];
  @Input()
  disableForce = false;


  @Output()
  deleted: EventEmitter<{deleted:boolean, force: boolean}> = new EventEmitter<{deleted:boolean, force: boolean}>()

  loading = false;
  force = false;

  deleteReg: RegExp = /^DELETE$/;
  deleteControl = new FormControl('', [Validators.required, Validators.pattern(this.deleteReg)]);

  onCancel() {
    const result = {deleted: false, force: false}
    this.deleted.emit(result);
  }

  onDelete() {
    const result = {deleted: true, force: this.force}
    this.deleted.emit(result);
  }

}
