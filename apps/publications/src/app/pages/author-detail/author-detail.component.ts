import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CabinetManagerService, PublicationForGUI, User, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import {
  TABLE_PUBLICATION_AUTHOR_DETAIL_PUBLICATIONS,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { RemovePublicationDialogComponent } from '../../dialogs/remove-publication-dialog/remove-publication-dialog.component';
import { FilterPublication } from '../../components/publication-filter/publication-filter.component';

@Component({
  selector: 'perun-web-apps-author-detail',
  templateUrl: './author-detail.component.html',
  styleUrls: ['./author-detail.component.scss']
})
export class AuthorDetailComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private cabinetService: CabinetManagerService,
              private tableConfigService: TableConfigService,
              private userService: UsersManagerService,
              private dialog: MatDialog,) { }

  loading: boolean;
  initLoading: boolean;
  publications: PublicationForGUI[];
  selected = new SelectionModel<PublicationForGUI>(true, []);
  pageSize: number;
  tableId = TABLE_PUBLICATION_AUTHOR_DETAIL_PUBLICATIONS;
  author: User;


  ngOnInit(): void {
    this.initLoading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.route.params.subscribe(params => {
      const authorId = params['authorId'];
      this.userService.getUserById(authorId).subscribe(user => {
        this.author = user;
        this.initLoading = false;
        this.refreshTable();
      });
    });
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
      null, null, null, null, null, this.author.id). subscribe(publications => {
      this.publications = publications;
      this.loading = false;
    });
  }

  filterPublication(event: FilterPublication) {
    this.loading = true;
    this.selected.clear();
    this.cabinetService.findPublicationsByGUIFilter(event.title, null, null,
      null, null, event.category, +event.startYear, +event.endYear, this.author.id). subscribe(publications => {
      this.publications = publications;
      this.loading = false;
    });
  }
}
