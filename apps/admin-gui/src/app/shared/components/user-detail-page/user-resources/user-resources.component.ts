import { Component, OnInit } from '@angular/core';
import {
  RichResource, UsersManagerService
} from '@perun-web-apps/perun/openapi';
import { TABLE_ADMIN_USER_RESOURCES_LIST, TableConfigService } from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-perun-web-apps-user-resources',
  templateUrl: './user-resources.component.html',
  styleUrls: ['./user-resources.component.scss']
})
export class UserResourcesComponent implements OnInit {

  constructor(private userManager: UsersManagerService,
              private tableConfigService: TableConfigService,
              private route: ActivatedRoute) {
  }

  resources: RichResource[] = [];
  loading: boolean;
  pageSize: number;
  tableId = TABLE_ADMIN_USER_RESOURCES_LIST;
  filterValue = '';

  ngOnInit(): void {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.refreshTable();
  }

  refreshTable() {
    this.loading = true;
    this.route.parent.params.subscribe(parentParams => {
      const userId = parentParams['userId'];
      this.userManager.getAssignedRichResourcesForUser(userId).subscribe(richResources => {
        this.resources = richResources;
        this.loading = false;
      });
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
