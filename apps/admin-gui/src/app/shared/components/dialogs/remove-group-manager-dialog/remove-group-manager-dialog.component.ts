import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource} from '@angular/material';
import {NotificatorService} from '../../../../core/services/common/notificator.service';
import {TranslateService} from '@ngx-translate/core';
import { AuthzResolverService, Facility, Group, Vo } from '@perun-web-apps/perun/openapi';
import { Role } from '@perun-web-apps/perun/models';

export interface RemoveGroupDialogData {
  complementaryObject: Vo | Group | Facility;
  groups: Group[];
  role: Role;
  theme: string;
}

@Component({
  selector: 'app-remove-group-manager-dialog',
  templateUrl: './remove-group-manager-dialog.component.html',
  styleUrls: ['./remove-group-manager-dialog.component.scss']
})
export class RemoveGroupManagerDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RemoveGroupManagerDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: RemoveGroupDialogData,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private authzService: AuthzResolverService) {
  }

  displayedColumns: string[] = ['name'];
  dataSource: MatTableDataSource<Group>;

  loading: boolean;
  theme: string;

  ngOnInit() {
    this.dataSource = new MatTableDataSource<Group>(this.data.groups);
    this.theme = this.data.theme;
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    this.loading = true;
    this.authzService.unsetRoleWithGroupComplementaryObject({role: this.data.role, authorizedGroups: this.data.groups.map(group => group.id), complementaryObject: this.data.complementaryObject})
      .subscribe(() => {
        this.translate.get('DIALOGS.REMOVE_GROUPS.SUCCESS').subscribe(successMessage => {
          this.notificator.showSuccess(successMessage);
          this.loading = false;
          this.dialogRef.close(true);
        }, () => this.loading = false);
      }, () => this.loading = false);
  }

}
