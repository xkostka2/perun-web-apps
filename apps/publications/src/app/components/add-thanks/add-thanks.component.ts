import { Component, Input, OnInit } from '@angular/core';
import { CabinetManagerService, PublicationForGUI, ThanksForGUI } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import {
  TABLE_PUBLICATION_AUTHORS,
  TABLE_PUBLICATION_THANKS,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddThanksDialogComponent } from '../../dialogs/add-thanks-dialog/add-thanks-dialog.component';
import { UniversalRemoveItemsDialogComponent } from '@perun-web-apps/perun/dialogs';

@Component({
  selector: 'perun-web-apps-add-thanks',
  templateUrl: './add-thanks.component.html',
  styleUrls: ['./add-thanks.component.scss']
})
export class AddThanksComponent implements OnInit {

  constructor(private dialog: MatDialog,
              private cabinetService: CabinetManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private tableConfigService: TableConfigService) { }

  @Input()
  publication: PublicationForGUI;
  @Input()
  selection: SelectionModel<ThanksForGUI> = new SelectionModel<ThanksForGUI>(true, []);

  tableId = TABLE_PUBLICATION_THANKS;
  pageSize: number;

  loading = false;
  filterValue = '';

  ngOnInit(): void {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.refresh();
  }

  refresh() {
    this.loading = true;
    this.cabinetService.findPublicationById(this.publication.id).subscribe(publication => {
      this.publication = publication;
      this.selection.clear();
      this.loading = false;
    });
  }

  onAddThanks() {
    const config = getDefaultDialogConfig();
    config.width = '800px';
    config.data = this.publication;

    const dialogRef = this.dialog.open(AddThanksDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refresh();
      }
    });
  }

  onRemoveThanks() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {items: this.selection.selected.map(thanks => thanks.ownerName),
      title: 'PUBLICATION_DETAIL.REMOVE_THANKS_DIALOG_TITLE',
      description: 'PUBLICATION_DETAIL.REMOVE_THANKS_DIALOG_DESCRIPTION',
      theme: 'user-theme'};

    const dialogRef = this.dialog.open(UniversalRemoveItemsDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.removeThank();
      }
    });
  }

  removeThank() {
    if (this.selection.selected.length === 0) {
      this.translate.get('PUBLICATION_DETAIL.REMOVE_THANKS_SUCCESS').subscribe(success => {
        this.notificator.showSuccess(success);
        this.refresh();
      });
    } else {
      this.cabinetService.deleteThanks(this.selection.selected.pop().id).subscribe(() => {
        this.removeThank()
      })
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
