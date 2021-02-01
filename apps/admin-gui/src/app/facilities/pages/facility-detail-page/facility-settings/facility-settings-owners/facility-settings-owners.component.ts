import { Component, OnInit } from '@angular/core';
import { FacilitiesManagerService, Facility, Owner } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { AddFacilityOwnerDialogComponent } from '../../../../../shared/components/dialogs/add-facility-owner-dialog/add-facility-owner-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { RemoveFacilityOwnerDialogComponent } from '../../../../../shared/components/dialogs/remove-facility-owner-dialog/remove-facility-owner-dialog.component';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { PageEvent } from '@angular/material/paginator';
import {
  TABLE_FACILITY_OWNERS,
  TableConfigService
} from '@perun-web-apps/config/table-config';

@Component({
  selector: 'app-facility-settings-owners',
  templateUrl: './facility-settings-owners.component.html',
  styleUrls: ['./facility-settings-owners.component.scss']
})
export class FacilitySettingsOwnersComponent implements OnInit {

  facilityId: number;
  facility: Facility;
  owners: Owner[] = [];
  selection = new SelectionModel<Owner>(true, []);
  loading: boolean;
  filterValue: string;
  displayedColumns: string[] = ['id', 'name', 'contact', 'type'];
  pageSize: number;
  tableId = TABLE_FACILITY_OWNERS;

  addAuth: boolean;
  removeAuth: boolean;

  constructor(private facilitiesManagerService: FacilitiesManagerService,
              private tableConfigService: TableConfigService,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private authResolver: GuiAuthResolver) {
  }

  ngOnInit(): void {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.filterValue = '';
    this.route.parent.parent.params.subscribe(params => {
      this.facilityId = parseInt(params['facilityId'], 10);
      this.facility = {
        id: this.facilityId,
        beanName: 'Facility'
      };

      this.refreshTable();
    });
  }

  refreshTable() {
    this.loading = true;
    this.selection.clear();
    this.facilitiesManagerService.getFacilityOwners(this.facilityId).subscribe(owners => {
      this.owners = owners;
      this.setAuthRights();
      this.loading = false;
    });
  }

  setAuthRights(){
    this.addAuth = this.authResolver.isAuthorized('addOwner_Facility_Owner_policy', [this.facility]);
    this.removeAuth = this.authResolver.isAuthorized('removeOwner_Facility_Owner_policy', [this.facility]);

    this.displayedColumns = this.removeAuth ? ['select', 'id', 'name', 'contact', 'type'] : ['id', 'name', 'contact', 'type'];
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  onCreate() {
    const config = getDefaultDialogConfig();
    config.width = '800px';
    config.data = { theme: 'facility-theme', facilityId: this.facilityId, forbiddenOwners: this.owners.map(owner => owner.id) };

    const dialogRef = this.dialog.open(AddFacilityOwnerDialogComponent, config);

    dialogRef.afterClosed().subscribe((response)=> {
      if(response){
        this.refreshTable();
      }
    });
  }

  onRemove() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = { theme: 'facility-theme', owners: this.selection.selected, facilityId: this.facilityId };

    const dialogRef = this.dialog.open(RemoveFacilityOwnerDialogComponent, config);

    dialogRef.afterClosed().subscribe((response)=> {
      if(response){
        this.refreshTable();
      }
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
