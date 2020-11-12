import { Component, OnInit } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { AddSshDialogComponent } from '../../../components/dialogs/add-ssh-dialog/add-ssh-dialog.component';
import { RemoveStringValueDialogComponent } from '../../../components/dialogs/remove-string-value-dialog/remove-string-value-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ShowSshDialogComponent } from '../../../components/dialogs/show-ssh-dialog/show-ssh-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-settings-ssh-keys',
  templateUrl: './settings-ssh-keys.component.html',
  styleUrls: ['./settings-ssh-keys.component.scss']
})
export class SettingsSSHKeysComponent implements OnInit {

  constructor(private store: StoreService,
              private attributesManagerService: AttributesManagerService,
              private dialog: MatDialog,
              private translateService: TranslateService
  ) {
    translateService.get('SSH_KEYS.REMOVE_DIALOG_DESCRIPTION').subscribe(value => this.removeDialogDescription = value);
    translateService.get('SSH_KEYS.REMOVE_DIALOG_TITLE').subscribe(value => this.removeDialogTitle = value);
    translateService.get('ALERTS.NO_ALT_PASSWORDS').subscribe(value => this.alertText = value);
    translateService.get('SSH_KEYS.HEADER_COLUMN').subscribe(value => this.headerColumnText = value);
  }


  adminKeys: string[] = [];
  userKeys: string[] = [];

  userUrn = 'urn:perun:user:attribute-def:def:sshPublicKey';
  adminUrn = 'urn:perun:user:attribute-def:def:sshPublicAdminKey';

  userKeyAttribute: Attribute;
  adminKeyAttribute: Attribute;

  userId: number;
  selection = new SelectionModel<string>(false, []);
  selectionAdmin = new SelectionModel<string>(false, []);

  removeDialogTitle: string;
  removeDialogDescription: string;

  alertText: string;
  headerColumnText: string;

  loading: boolean;

  ngOnInit() {
    this.userId = this.store.getPerunPrincipal().userId;
    this.translateService.onLangChange.subscribe(() => {
      this.translateService.get('SSH_KEYS.REMOVE_DIALOG_DESCRIPTION').subscribe(value => this.removeDialogDescription = value);
      this.translateService.get('SSH_KEYS.REMOVE_DIALOG_TITLE').subscribe(value => this.removeDialogTitle = value);
      this.translateService.get('ALERTS.NO_ALT_PASSWORDS').subscribe(value => this.alertText = value);
      this.translateService.get('SSH_KEYS.HEADER_COLUMN').subscribe(value => this.headerColumnText = value);
    })
    this.loading= true;
    this.getUserSSH();
    this.getAdminSSH();
  }

  addKey(admin: boolean) {
    const config = getDefaultDialogConfig();
    config.width = '800px';
    config.data = { attribute: admin ? this.adminKeyAttribute : this.userKeyAttribute,
      userId: this.userId };

    const dialogRef = this.dialog.open(AddSshDialogComponent, config);

    dialogRef.afterClosed().subscribe(sshAdded => {
      if (sshAdded) {
        admin ? this.getAdminSSH() : this.getUserSSH();
      }
    });
  }

  removeKey(key: string, admin: boolean) {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      values: [key],
      attribute: admin ? this.adminKeyAttribute : this.userKeyAttribute,
      userId: this.userId,
      title: this.removeDialogTitle,
      description: this.removeDialogDescription
    };

    const dialogRef = this.dialog.open(RemoveStringValueDialogComponent, config);

    dialogRef.afterClosed().subscribe(sshAdded => {
      if (sshAdded) {
        this.loading = true;
        admin ? this.getAdminSSH() : this.getUserSSH();
        admin ? this.selectionAdmin.clear() : this.selection.clear();
      }
    });
  }

  getUserSSH() {
    this.attributesManagerService.getUserAttributeByName(this.userId, this.userUrn).subscribe(sshKeys => {
      this.userKeyAttribute = sshKeys;
      // @ts-ignore
      this.userKeys = sshKeys.value;
      this.loading = false;
    });
  }

  getAdminSSH() {
    this.attributesManagerService.getUserAttributeByName(this.userId, this.adminUrn).subscribe(sshKeys => {
      this.adminKeyAttribute = sshKeys;
      // @ts-ignore
      this.adminKeys = sshKeys.value;
      this.loading = false;
    });
  }

  showWholeKey(key: string) {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      value: key
    };

    this.dialog.open(ShowSshDialogComponent, config);
  }
}
