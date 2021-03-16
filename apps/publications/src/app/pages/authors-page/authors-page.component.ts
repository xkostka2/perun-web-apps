import { Component, OnInit } from '@angular/core';
import { Author, CabinetManagerService } from '@perun-web-apps/perun/openapi';
import {
  TABLE_PUBLICATION_AUTHORS,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'perun-web-apps-authors-page',
  templateUrl: './authors-page.component.html',
  styleUrls: ['./authors-page.component.scss']
})
export class AuthorsPageComponent implements OnInit {

  constructor(private tableConfigService: TableConfigService,
              private cabinetService: CabinetManagerService) { }

  filterValue = '';
  loading: boolean;
  authors: Author[];
  pageSize: number;
  tableId = TABLE_PUBLICATION_AUTHORS;

  ngOnInit(): void {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.refreshTable();
  }

  refreshTable() {
    this.loading = true;
    this.cabinetService.findAllAuthors().subscribe(authors => {
      this.authors = authors;
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
