import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { TABLE_ADMIN_FACILITIES, TableConfigService } from '@perun-web-apps/config/table-config';
import { EnrichedFacility, FacilitiesManagerService, Facility } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-facilities',
  templateUrl: './user-facilities.component.html',
  styleUrls: ['./user-facilities.component.scss']
})
export class UserFacilitiesComponent implements OnInit {

  constructor(
    private facilityManager: FacilitiesManagerService,
    private tableConfigService: TableConfigService,
    private route: ActivatedRoute,
  ) { }

  facilities: EnrichedFacility[] = [];

  userId: number;

  loading: boolean;
  filterValue = '';
  pageSize: number;
  tableId = TABLE_ADMIN_FACILITIES;
  displayedColumns = ['id', 'name', 'description'];


  ngOnInit(): void {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.route.parent.params.subscribe(params => {
      this.userId = params['userId'];
      this.refreshTable();
    });
  }

  refreshTable() {
    this.loading = true;
    this.facilityManager.getAssignedFacilitiesByUser(this.userId).subscribe(facilities => {
      this.facilities = facilities.map(f => ({ facility: f }));
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

}
