import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RichUser, UsersManagerService } from '@perun-web-apps/perun/openapi';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { PageEvent } from '@angular/material/paginator';
import { TABLE_USER_SERVICE_IDENTITIES, TableConfigService } from '@perun-web-apps/config/table-config';
import { SelectionModel } from '@angular/cdk/collections';
import { Urns } from '@perun-web-apps/perun/urns';
import { FormControl, Validators } from '@angular/forms';

export interface AddUserServiceIdentityData {
  userId: number;
  theme: string;
  isService: boolean;
}

@Component({
  selector: 'app-connect-identity',
  templateUrl: './connect-identity.html',
  styleUrls: ['./connect-identity.scss']
})
export class ConnectIdentity implements OnInit {

  constructor(private dialogRef: MatDialogRef<ConnectIdentity>,
              @Inject(MAT_DIALOG_DATA) private data: AddUserServiceIdentityData,
              private tableConfigService: TableConfigService,
              public userManager: UsersManagerService,
              private storeService: StoreService,
              private notificator: NotificatorService,
              private translate: TranslateService) {
  }

  theme: string;
  userId: number;
  isService: boolean;
  loading = false;

  identities: RichUser[];
  selection = new SelectionModel<RichUser>(false, []);

  firstSearchDone = false;
  displayedColumns = ['select', 'id', 'user', 'name', 'email', 'logins', 'organization'];

  pageSize: number;
  tableId = TABLE_USER_SERVICE_IDENTITIES;

  searchCtrl: FormControl;

  ngOnInit(): void {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.theme = this.data.theme;
    this.userId = this.data.userId;
    this.isService = this.data.isService;
    this.searchCtrl = new FormControl('', [Validators.required, Validators.pattern('.*[\\S]+.*')]);
  }

  onAdd() {
    this.loading = true;
    let owner: number;
    let specificUser: number;

    if (this.isService){
      owner = this.selection.selected[0].id;
      specificUser = this.userId;
    } else {
      owner = this.userId;
      specificUser = this.selection.selected[0].id;
    }

    this.userManager.addSpecificUserOwner(owner, specificUser).subscribe(() => {
      this.notificator.showSuccess(this.translate.instant('DIALOGS.CONNECT_IDENTITY.SUCCESS'));
      this.dialogRef.close(true);
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  onSearchByString() {
    if (this.searchCtrl.invalid) {
      this.searchCtrl.markAllAsTouched()
      return;
    }
    this.loading = true;
    this.firstSearchDone = true;
    let attributes = [
      Urns.USER_DEF_ORGANIZATION,
      Urns.USER_DEF_PREFERRED_MAIL];
    attributes = attributes.concat(this.storeService.getLoginAttributeNames());
    this.userManager.findRichUsersWithAttributes(this.searchCtrl.value, attributes).subscribe(identities => {
      this.identities = this.filterIdentities(identities);
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  onKeyInput(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearchByString();
    }
  }

  filterIdentities(identities: RichUser[]): RichUser[] {
    if (this.isService){
      return identities.filter(identity => !identity.serviceUser);
    }

    return identities.filter(identity => identity.serviceUser);
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

}
