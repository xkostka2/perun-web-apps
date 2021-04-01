import { Component, OnInit } from '@angular/core';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { RemovePublicationDialogComponent } from '../../dialogs/remove-publication-dialog/remove-publication-dialog.component';
import { PageEvent } from '@angular/material/paginator';
import { FilterPublication } from '../../components/publication-filter/publication-filter.component';
import { AuthzResolverService, CabinetManagerService, PublicationForGUI } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_PUBLICATION_AUTHOR_DETAIL_PUBLICATIONS, TableConfigService } from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-my-publications-page',
  templateUrl: './my-publications-page.component.html',
  styleUrls: ['./my-publications-page.component.scss']
})
export class MyPublicationsPageComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private cabinetService: CabinetManagerService,
              private tableConfigService: TableConfigService,
              private dialog: MatDialog,
              private authResolver: AuthzResolverService,) { }

  loading: boolean;
  initLoading: boolean;
  publications: PublicationForGUI[];
  selected = new SelectionModel<PublicationForGUI>(true, []);
  pageSize: number;
  tableId = TABLE_PUBLICATION_AUTHOR_DETAIL_PUBLICATIONS;
  authorId: number;

  ngOnInit(): void {
    this.initLoading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);

    this.authResolver.getPerunPrincipal().subscribe(perunPrincipal => {
      this.authorId = perunPrincipal.userId;
      this.initLoading = false;
      this.refreshTable();
    })
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
      null, null, null, null, null, this.authorId). subscribe(publications => {
      this.publications = publications;
      this.loading = false;
    });
  }

  filterPublication(event: FilterPublication) {
    this.loading = true;
    this.selected.clear();
    this.cabinetService.findPublicationsByGUIFilter(event.title, null, null,
      null, null, event.category, +event.startYear, +event.endYear, this.authorId). subscribe(publications => {
      this.publications = publications;
      this.loading = false;
    });
  }

}
