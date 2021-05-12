import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StoreService } from '@perun-web-apps/perun/services';
import {
  CabinetManagerService,
  Owner,
  OwnersManagerService,
  PublicationForGUI
} from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { TABLE_ADD_THANKS_DIALOG, TableConfigService } from '@perun-web-apps/config/table-config';

@Component({
  selector: 'perun-web-apps-add-thanks-dialog',
  templateUrl: './add-thanks-dialog.component.html',
  styleUrls: ['./add-thanks-dialog.component.scss']
})
export class AddThanksDialogComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<AddThanksDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: PublicationForGUI,
              private ownersManagerService: OwnersManagerService,
              private storeService: StoreService,
              private tableConfigService: TableConfigService,
              private cabinetManagerService: CabinetManagerService) { }

  loading: boolean;
  owners: Owner[];
  selected = new SelectionModel<Owner>(true, []);
  filterValue: string;
  pageSize: number;
  tableId = TABLE_ADD_THANKS_DIALOG;

    ngOnInit(): void {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    const allowedOwners = this.storeService.get('allowed_owners_for_thanks');
    this.ownersManagerService.getAllOwners().subscribe(owners => {
      if (allowedOwners.length !== 0) {
        this.owners = owners.filter(item => allowedOwners.indexOf(item.id) > -1);
      } else {
        this.owners = owners;
      }
      this.owners = this.owners.filter(item => this.data.thanks.map(thanks => thanks.ownerId).indexOf(item.id) <= -1);

      this.loading = false;
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  onSubmit() {
    this.loading = true;
    if (this.selected.selected.length === 0) {
      this.dialogRef.close(true);
    } else {
      this.cabinetManagerService.createThanks({thanks: {publicationId: this.data.id, ownerId: this.selected.selected.pop().id,
          createdBy: this.storeService.getPerunPrincipal().actor, createdByUid: this.storeService.getPerunPrincipal().userId,
          createdDate: Date.now().toString(), id: 0, beanName: 'Thanks'}}).subscribe(thanks => {
        this.onSubmit();
      }, () => this.loading = false);
    }

  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
