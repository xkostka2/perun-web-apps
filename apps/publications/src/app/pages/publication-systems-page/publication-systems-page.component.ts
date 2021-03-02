import { Component, OnInit } from '@angular/core';
import { CabinetManagerService, PublicationSystem } from '@perun-web-apps/perun/openapi';
import { TABLE_GROUP_RESOURCES_LIST, TableConfigService } from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'perun-web-apps-publication-systems-page',
  templateUrl: './publication-systems-page.component.html',
  styleUrls: ['./publication-systems-page.component.scss']
})
export class PublicationSystemsPageComponent implements OnInit {

  constructor(private cabinetManagerService: CabinetManagerService,
              private tableConfigService: TableConfigService) {
  }

  publicationSystems: PublicationSystem[] = [];
  loading: boolean;
  filterValue = '';
  pageSize: number;
  tableId = TABLE_GROUP_RESOURCES_LIST;

  ngOnInit() {
    this.refreshTable();
  }

  refreshTable() {
    this.loading = true;
    this.cabinetManagerService.getPublicationSystems().subscribe(pubSys => {
      this.publicationSystems = pubSys;
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
