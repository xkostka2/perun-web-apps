import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  Author,
  CabinetManagerService, Category,
  PublicationForGUI,
  ThanksForGUI
} from '@perun-web-apps/perun/openapi';
import { PageEvent } from '@angular/material/paginator';
import {
  TABLE_PUBLICATION_AUTHORS, TABLE_PUBLICATION_THANKS,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { AddThanksDialogComponent } from '../../dialogs/add-thanks-dialog/add-thanks-dialog.component';
import { UniversalRemoveItemsDialogComponent } from '@perun-web-apps/perun/dialogs';

@Component({
  selector: 'perun-web-apps-publication-detail',
  templateUrl: './publication-detail.component.html',
  styleUrls: ['./publication-detail.component.scss']
})
export class PublicationDetailComponent implements OnInit {


  constructor(private route: ActivatedRoute,
              private cabinetService: CabinetManagerService,
              private tableConfigService: TableConfigService,
              private matIconRegistry: MatIconRegistry,
              private dialog: MatDialog,
              private domSanitizer: DomSanitizer) {
    this.matIconRegistry.addSvgIcon(
    "publications",
    this.domSanitizer.bypassSecurityTrustResourceUrl("../../assets/img/publications-dark.svg"));
  }

  loading = false;
  pubLoading = false;
  authorsLoading = false;
  thanksLoading = false;
  initLoading = false;

  publicationId: number;
  publication: PublicationForGUI;
  categories: Category[];
  mode: string;

  mainAuthorId: number;
  mainAuthor: Author;

  authors: Author[] = [];
  pageSizeAuthors: number;
  tableIdAuthors = TABLE_PUBLICATION_AUTHORS;
  filterAuthors = '';
  selectionAuthors: SelectionModel<Author> = new SelectionModel<Author>(true, []);

  thanks: ThanksForGUI[] = [];
  pageSizeThanks: number;
  tableIdThanks = TABLE_PUBLICATION_THANKS;
  filterThanks = '';
  selectionThanks: SelectionModel<ThanksForGUI> = new SelectionModel<ThanksForGUI>(true, []);

  ngOnInit(): void {
    this.initLoading = true;
    this.pageSizeAuthors = this.tableConfigService.getTablePageSize(this.tableIdAuthors);
    this.pageSizeThanks = this.tableConfigService.getTablePageSize(this.tableIdThanks);
    this.route.params.subscribe(params => {
      this.publicationId = params['publicationId'];
      this.mainAuthorId = parseInt(params['authorId'], 10);
      this.setMode();

      this.loadAllData();
    });
  }

  setMode(){
    const url = location.pathname;
    if(url.includes('my')){
      this.mode = 'my';
    } else if(url.includes('all')){
      this.mode = 'all';
    } else {
      this.mode = 'authors';
    }
  }

  loadAllData() {
    this.loading = true;
    this.cabinetService.findPublicationById(this.publicationId).subscribe(publication => {
      this.publication = publication;
      this.thanks = this.publication.thanks;

      this.cabinetService.getCategories().subscribe(categories => {
        this.categories = categories;

        this.cabinetService.findAuthorsByPublicationId(this.publicationId).subscribe(authors => {
          this.authors = authors;
          this.mainAuthor = authors.find(author => author.id === this.mainAuthorId);
          this.initLoading = false;
          this.loading = false;
        });
      });
    });
  }

  refreshPublication() {
    this.pubLoading = true;
    this.cabinetService.findPublicationById(this.publicationId).subscribe(publication => {
      this.publication = publication;
      this.pubLoading = false;
    });
  }


  onAddAuthors() {
    // TODO
  }

  onRemoveAuthors() {
    // TODO
  }

  onAddThanks() {
    const config = getDefaultDialogConfig();
    config.width = '800px';
    config.data = this.publication;

    const dialogRef = this.dialog.open(AddThanksDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshThanks();
      }
    });
  }

  onRemoveThanks() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {items: this.selectionThanks.selected.map(thanks => thanks.ownerName),
      title: 'PUBLICATION_DETAIL.REMOVE_THANKS_DIALOG_TITLE',
      description: 'PUBLICATION_DETAIL.REMOVE_THANKS_DIALOG_DESCRIPTION',
      theme: 'user-theme'};

    const dialogRef = this.dialog.open(UniversalRemoveItemsDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.thanksLoading = true;
        this.removeThank();
      }
    });
  }

  removeThank() {
    if (this.selectionThanks.selected.length === 0) {
      this.refreshThanks();
    } else {
      this.cabinetService.deleteThanks(this.selectionThanks.selected.pop().id).subscribe(() => {
        this.removeThank();
      })
    }
  }

  applyFilterAuthors(filterValue: string) {
    this.filterAuthors = filterValue;
  }

  applyFilterThanks(filterValue: string) {
    this.filterThanks = filterValue;
  }

  pageChangedAuthors(event: PageEvent) {
    this.pageSizeAuthors = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableIdAuthors, event.pageSize);
  }

  pageChangedThanks(event: PageEvent) {
    this.pageSizeThanks = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableIdThanks, event.pageSize);
  }

  changeLock() {
    this.pubLoading = true;
    const updatedPublication: any = {
      id: this.publication.id,
      externalId: this.publication.externalId,
      publicationSystemId: this.publication.publicationSystemId,
      title: this.publication.title,
      year: this.publication.year,
      main: this.publication.main,
      isbn: this.publication.isbn,
      doi: this.publication.doi,
      categoryId: this.publication.categoryId,
      rank: this.publication.rank,
      locked: this.publication.locked,
      createdBy: this.publication.createdBy,
      createdDate: this.publication.createdDate,
    };

    this.cabinetService.lockPublications(
      {publications: [updatedPublication], lock: !this.publication.locked}).subscribe(() => {
        this.refreshPublication();
    });
  }

  refreshThanks() {
    this.thanksLoading = true;
    this.cabinetService.findPublicationById(this.publicationId).subscribe(publication => {
      this.publication = publication;
      this.thanks = this.publication.thanks;
      this.selectionThanks.clear();
      this.thanksLoading = false;
    });
  }
}
