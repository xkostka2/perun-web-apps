import { Component, Input, OnInit } from '@angular/core';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddAuthorsDialogComponent } from '../../dialogs/add-authors-dialog/add-authors-dialog.component';
import { UniversalRemoveItemsDialogComponent } from '@perun-web-apps/perun/dialogs';
import { Author, CabinetManagerService, PublicationForGUI } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { TABLE_PUBLICATION_AUTHORS, TableConfigService } from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'perun-web-apps-add-authors',
  templateUrl: './add-authors.component.html',
  styleUrls: ['./add-authors.component.scss']
})
export class AddAuthorsComponent implements OnInit {

  constructor(private dialog: MatDialog,
              private cabinetService: CabinetManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private tableConfigService: TableConfigService) { }


  @Input()
  publication: PublicationForGUI;
  @Input()
  selection: SelectionModel<Author> = new SelectionModel<Author>(true, [])

  filterValue = '';
  loading = false;

  tableId = TABLE_PUBLICATION_AUTHORS;
  pageSize: number;

  ngOnInit(): void {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.cabinetService.findAuthorsByPublicationId(this.publication.id).subscribe(authors => {
      this.publication.authors = authors;
      this.selection.clear();
      this.loading = false;
    });
  }

  onAddAuthors() {
    const config = getDefaultDialogConfig();
    config.width = '800px';
    config.data = {
      publicationId: this.publication.id,
      alreadyAddedAuthors: this.publication.authors
    };

    const dialogRef = this.dialog.open(AddAuthorsDialogComponent, config);

    dialogRef.afterClosed().subscribe(authorshipCreated => {
      if (authorshipCreated) {
        this.selection.clear();
        this.refresh();
      }
    });
  }

  onRemoveAuthors() {
    const config = getDefaultDialogConfig();
    config.width = '800px';
    config.data = {
      items: this.selection.selected.map(author => `${author.titleBefore ? author.titleBefore: ""} ${author.firstName ? author.firstName : ""}  ${author.lastName ? author.lastName : ""} ${author.titleAfter ? author.titleAfter : ""}`),
      title: 'DIALOGS.REMOVE_AUTHORS.TITLE',
      description: 'DIALOGS.REMOVE_AUTHORS.DESCRIPTION',
      theme: 'user-theme'
    };

    const dialogRef = this.dialog.open(UniversalRemoveItemsDialogComponent, config);

    dialogRef.afterClosed().subscribe(authorshipRemoved => {
      if (authorshipRemoved) {
        this.removeAuthors(this.selection.selected);
      }
    });
  }

  removeAuthors(authorsToRemove: Author[]) {
    this.loading = true;
    if(authorsToRemove.length) {
      const author = authorsToRemove.pop();
      this.cabinetService.deleteAuthorship(this.publication.id, author.id).subscribe(() => {
        this.removeAuthors(authorsToRemove);
      }, ()=> this.loading = false);
    } else {
      this.notificator.showSuccess(this.translate.instant('DIALOGS.REMOVE_AUTHORS.SUCCESS_MESSAGE'));
      this.selection.clear();
      this.refresh();
    }
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
