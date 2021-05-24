import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { Author, Authorship, CabinetManagerService } from '@perun-web-apps/perun/openapi';
import { TableConfigService } from '@perun-web-apps/config/table-config';
import {
  TABLE_PUBLICATION_AUTHORS
} from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';

export interface AddAuthorsDialogData {
  publicationId: number,
  alreadyAddedAuthors: Author[]
}

@Component({
  selector: 'perun-web-apps-add-authors-dialog',
  templateUrl: './add-authors-dialog.component.html',
  styleUrls: ['./add-authors-dialog.component.scss']
})
export class AddAuthorsDialogComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<AddAuthorsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: AddAuthorsDialogData,
    private notificator: NotificatorService,
    private tableConfigService: TableConfigService,
    private cabinetService: CabinetManagerService,
    private translate: TranslateService,
  ) {
    translate.get('DIALOGS.ADD_AUTHORS.SUCCESS_MESSAGE').subscribe(value => this.successMessage = value);
    this.publicationId = data.publicationId;
    this.alreadyAddedAuthors = data.alreadyAddedAuthors;
  }

  searchControl: FormControl;
  successMessage: string;
  loading = false;
  searchLoading = false;
  firstSearchDone = false;
  publicationId: number;
  authors: Author[] = [];
  alreadyAddedAuthors: Author[] = [];
  authorsToAdd: Author[] = [];
  pageSizeAuthors: number;
  pageSizeAddAuthors: number;
  tableIdAuthors = TABLE_PUBLICATION_AUTHORS;
  selection = new SelectionModel<Author>(false, []);
  reloadTable= false;

  ngOnInit(): void {
    this.searchControl = new FormControl('', [Validators.required, Validators.pattern('.*[\\S]+.*')]);
    this.pageSizeAuthors = 5;
    this.pageSizeAddAuthors = 5;
  }

  onSearchByString() {
    this.searchLoading = true;
    const removeAuthors = [...this.alreadyAddedAuthors, ...this.authorsToAdd];
    this.cabinetService.findNewAuthors(this.searchControl.value).subscribe(authors => {
      authors = authors.filter(item => removeAuthors.map(author => author.id).indexOf(item.id) <= -1);
      this.authors = authors;
      this.firstSearchDone = true;
      this.searchLoading = false;
    }, () => {
      this.searchLoading = false;
    });
  }

  onAdd() {
    this.loading = true;
    if(this.authorsToAdd.length) {
      const author = this.authorsToAdd.pop();
      this.cabinetService.createAutorship({authorship: {id: 0, beanName: 'Authorship', publicationId: this.publicationId, userId: author.id}}).subscribe(() => {
        this.onAdd();
      }, ()=> this.loading = false);
    } else {
      this.notificator.showSuccess(this.successMessage);
      this.loading = false;
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  addAuthor(author: Author) {
    this.authors = this.authors.filter(a => a !== author);
    this.authorsToAdd.push(author);
    this.reloadTable = !this.reloadTable;
  }

  removeAuthor(author: Author) {
    this.authorsToAdd = this.authorsToAdd.filter(a => a !== author);
  }

  pageChangedAuthors(event: PageEvent) {
    this.pageSizeAuthors = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableIdAuthors, event.pageSize);
  }

  pageChangedAuthorsToAdd(event: PageEvent) {
    this.pageSizeAddAuthors = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableIdAuthors, event.pageSize);
  }

}
