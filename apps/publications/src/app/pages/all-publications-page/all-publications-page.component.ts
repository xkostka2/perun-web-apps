import { Component, OnInit } from '@angular/core';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { RemovePublicationDialogComponent } from '../../dialogs/remove-publication-dialog/remove-publication-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { FilterPublication } from '../../components/publication-filter/publication-filter.component';
import { CabinetManagerService, PublicationForGUI } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_PUBLICATION_AUTHOR_DETAIL_PUBLICATIONS, TableConfigService } from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'perun-web-apps-all-publications-page',
  templateUrl: './all-publications-page.component.html',
  styleUrls: ['./all-publications-page.component.scss']
})
export class AllPublicationsPageComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private cabinetService: CabinetManagerService,
              private tableConfigService: TableConfigService,
              private dialog: MatDialog,
              private matIconRegistry: MatIconRegistry,
              private domSanitizer: DomSanitizer,) {
    this.matIconRegistry.addSvgIcon(
      "publications",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/img/publications-dark.svg")
    );
  }

  loading: boolean;
  publications: PublicationForGUI[];
  selected = new SelectionModel<PublicationForGUI>(true, []);
  pageSize: number;
  tableId = TABLE_PUBLICATION_AUTHOR_DETAIL_PUBLICATIONS;

  ngOnInit(): void {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.refreshTable();
  }

  removePublication() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = this.selected.selected;

    const dialogRef = this.dialog.open(RemovePublicationDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  refreshTable() {
    this.loading = true;
    this.selected.clear();
    this.cabinetService.findPublicationsByGUIFilter(null, null, null,
      null, null, null, null, null, null). subscribe(publications => {
      this.publications = publications;
      this.loading = false;
    });
  }

  filterPublication(event: FilterPublication) {
    this.loading = true;
    this.selected.clear();
    this.cabinetService.findPublicationsByGUIFilter(event.title, null, null,
      null, null, event.category, +event.startYear, +event.endYear, null). subscribe(publications => {
      this.publications = publications;
      this.loading = false;
    });
  }

}
