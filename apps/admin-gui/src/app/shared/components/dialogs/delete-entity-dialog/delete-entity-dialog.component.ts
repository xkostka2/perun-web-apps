import { Component, Inject, OnInit } from '@angular/core';
import { Facility, Group, Resource, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';

export enum DeleteEntityType {
  VO,
  GROUP,
  FACILITY,
  RESOURCE
}


export interface DeleteEntityDialogData {
  theme: string;
  entity: Vo | Facility | Resource | Group;
  entityType: DeleteEntityType;
}

@Component({
  selector: 'app-delete-entity-dialog',
  templateUrl: './delete-entity-dialog.component.html',
  styleUrls: ['./delete-entity-dialog.component.scss']
})
export class DeleteEntityDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<DeleteEntityDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: DeleteEntityDialogData,
              private notificator: NotificatorService,
              private translateService: TranslateService,
              private voService: VosManagerService) { }

  title: string;
  entityName: string;
  entityType: string;
  relations: string[] = [];
  successMessage: string;

  loading = false;
  force = false;

  deleteReg: RegExp = /^DELETE$/;
  deleteControl = new FormControl('', [Validators.required, Validators.pattern(this.deleteReg)]);

  ngOnInit(): void {
    this.entityName = this.data.entity.name;
    switch (this.data.entityType){
      case DeleteEntityType.VO: {
        this.entityType = this.translateService.instant('DIALOGS.DELETE_ENTITY.VO');
        this.successMessage = this.entityType.charAt(0).toUpperCase() + this.entityType.slice(1) +
          " " + this.translateService.instant('DIALOGS.DELETE_ENTITY.SUCCESS');
        this.relations.push(this.translateService.instant('DIALOGS.DELETE_ENTITY.GROUP_RELATION'));
        this.relations.push(this.translateService.instant('DIALOGS.DELETE_ENTITY.MEMBER_RELATION'));
        this.relations.push(this.translateService.instant('DIALOGS.DELETE_ENTITY.RESOURCE_RELATION'));
        break;
      }
      default: break;
    }
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onDelete() {
    switch(this.data.entityType){
      case DeleteEntityType.VO: {
        this.deleteVo();
        break;
      }
      default: break;
    }
  }

  private deleteVo() {
    this.loading = true;
    this.voService.deleteVo(this.data.entity.id, this.force).subscribe(() => {
      this.notificator.showSuccess(this.successMessage);
      this.loading = false;
      this.dialogRef.close(true);
    },() => this.loading = false);
  }
}
