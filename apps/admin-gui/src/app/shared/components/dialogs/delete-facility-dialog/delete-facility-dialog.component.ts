import { Component, Inject, OnInit } from '@angular/core';
import { FacilitiesManagerService, Facility } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';

export interface DeleteFacilityDialogData {
  theme: string;
  facility: Facility;
}

@Component({
  selector: 'app-delete-facility-dialog',
  templateUrl: './delete-facility-dialog.component.html',
  styleUrls: ['./delete-facility-dialog.component.scss']
})
export class DeleteFacilityDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<DeleteFacilityDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: DeleteFacilityDialogData,
              public facilitiesManager: FacilitiesManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService) {

  }

  theme: string;
  facility: Facility;
  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Facility>;
  loading = false;
  force = false;
  relations: string[] = [];

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.facility = this.data.facility;
    this.dataSource = new MatTableDataSource<Facility>([this.facility]);
    this.relations.push(this.translate.instant('DIALOGS.DELETE_FACILITY.RESOURCE_RELATION'));
  }

  onConfirm() {
    this.loading = true;
    this.facilitiesManager.deleteFacility(this.facility.id, this.force).subscribe(() => {
      this.notificator.showSuccess(this.translate.instant('DIALOGS.DELETE_FACILITY.SUCCESS'));
      this.dialogRef.close(true);
    }, () => this.loading = false);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit(result: {deleted: boolean, force: boolean}) {
    this.force = result.force;
    if(result.deleted){
      this.onConfirm();
    } else{
      this.onCancel();
    }
  }
}
