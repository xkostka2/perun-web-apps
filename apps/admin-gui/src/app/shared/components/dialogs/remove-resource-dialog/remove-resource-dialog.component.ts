import {Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import {NotificatorService} from '@perun-web-apps/perun/services';
import {TranslateService} from '@ngx-translate/core';
import { ResourcesManagerService, RichResource } from '@perun-web-apps/perun/openapi';

export interface RemoveResourceDialogData {
  theme: string;
  resources: RichResource[];
}

@Component({
  selector: 'app-remove-resource-dialog',
  templateUrl: './remove-resource-dialog.component.html',
  styleUrls: ['./remove-resource-dialog.component.scss']
})
export class RemoveResourceDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RemoveResourceDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: RemoveResourceDialogData,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private resourcesManager: ResourcesManagerService) { }

  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<RichResource>;
  loading = false;
  theme: string;

  ngOnInit() {
    this.theme = this.data.theme;
    this.dataSource = new MatTableDataSource<RichResource>(this.data.resources);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onDelete() {
    this.loading = true;
    if (this.data.resources.length === 0) {
      this.translate.get('DIALOGS.REMOVE_RESOURCES.SUCCESS').subscribe(successMessage => {
        this.loading = false;
        this.notificator.showSuccess(successMessage);
        this.dialogRef.close(true);
      });
    } else {
      this.resourcesManager.deleteResource(this.data.resources[0].id).subscribe( () => {
        this.data.resources.shift();
        this.onDelete();
      }, () => {
        this.dialogRef.close(true);
      });
    }
  }

  onSubmit(result: {deleted: boolean, force: boolean}) {
    if(result.deleted){
      this.onDelete();
    } else{
      this.onCancel();
    }
  }

}
