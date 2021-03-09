import { Component, OnInit } from '@angular/core';
import { Owner, OwnersManagerService } from '@perun-web-apps/perun/openapi';
import { TABLE_GROUP_RESOURCES_LIST, TableConfigService } from '@perun-web-apps/config/table-config';
import { MatDialog } from '@angular/material/dialog';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { DeleteOwnerDialogComponent } from '../../../../shared/components/delete-owner-dialog/delete-owner-dialog.component';
import { AddOwnerDialogComponent } from '../../../../shared/components/add-owner-dialog/add-owner-dialog.component';

@Component({
  selector: 'app-admin-owners',
  templateUrl: './admin-owners.component.html',
  styleUrls: ['./admin-owners.component.scss']
})
export class AdminOwnersComponent implements OnInit {

  constructor(private ownersManagerService:OwnersManagerService,
              private tableConfigService: TableConfigService,
              private dialog: MatDialog,
              private guiAuthResolver: GuiAuthResolver) {
  }

  owners: Owner[] = [];
  selected = new SelectionModel<Owner>(true, []);
  loading: boolean;
  filterValue = '';
  pageSize: number;
  tableId = TABLE_GROUP_RESOURCES_LIST;

  removeAuth: boolean;
  addAuth: boolean;

  ngOnInit() {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.setAuth();
    this.refreshTable();
  }

  setAuth() {
    this.removeAuth = this.guiAuthResolver.isAuthorized('deleteOwner_Owner_policy', []);
    this.addAuth = this.guiAuthResolver.isAuthorized('createOwner_Owner_policy', []);
  }

  refreshTable() {
    this.loading = true;
    this.ownersManagerService.getAllOwners().subscribe(owners => {
      this.owners = owners;
      this.selected.clear();
      this.loading = false;
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  addOwner() {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {};

    const dialogRef = this.dialog.open(AddOwnerDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  removeOwner() {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = this.selected.selected;

    const dialogRef = this.dialog.open(DeleteOwnerDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selected.clear();
        this.refreshTable();
      }
    });
  }


}
