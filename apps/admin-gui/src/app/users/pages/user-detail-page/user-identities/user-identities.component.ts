import { Component, OnInit } from '@angular/core';
import {
  RegistrarManagerService,
  RichUserExtSource,
  UserExtSource,
  UsersManagerService
} from '@perun-web-apps/perun/openapi';
import { StoreService } from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { AddUserExtSourceDialogComponent } from '../../../../shared/components/dialogs/add-user-ext-source-dialog/add-user-ext-source-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { RemoveUserExtSourceDialogComponent } from '@perun-web-apps/perun/dialogs';
import { TABLE_USER_IDENTITIES, TableConfigService } from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-user-identities',
  templateUrl: './user-identities.component.html',
  styleUrls: ['./user-identities.component.scss']
})
export class UserIdentitiesComponent implements OnInit {

  userExtSources: RichUserExtSource[] = [];
  selection: SelectionModel<UserExtSource> = new SelectionModel<UserExtSource>(false, []);
  userId: number;
  hiddenColumns = ['mail'];
  loading: boolean;
  pageSize: number;
  tableId = TABLE_USER_IDENTITIES;

  constructor(private usersManagerService: UsersManagerService,
              private storage: StoreService,
              private registrarManagerService: RegistrarManagerService,
              private dialog:MatDialog,
              protected route: ActivatedRoute,
              private tableConfigService: TableConfigService) { }

  ngOnInit() {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.route.parent.params.subscribe(params => {
      this.userId = params['userId'];
    });
    this.refreshTable();
  }

  refreshTable() {
    this.loading = true;
    this.selection.clear();
    this.usersManagerService.getRichUserExtSources(this.userId).subscribe(userExtSources => {
      this.userExtSources = userExtSources;
      this.loading = false;
    }, () => this.loading = false);
  }

  addIdentity() {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = { userId: this.userId };
    const dialogRef = this.dialog.open(AddUserExtSourceDialogComponent, config);
    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        this.refreshTable();
      }
    });
  }

  removeIdentity() {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      showSuccess: true,
      theme: 'user-theme',
      userId: this.userId,
      extSources: this.selection.selected
    };
    const dialogRef = this.dialog.open(RemoveUserExtSourceDialogComponent, config);
    dialogRef.afterClosed().subscribe(success => {
      if (success) {
        this.refreshTable();
      }
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
