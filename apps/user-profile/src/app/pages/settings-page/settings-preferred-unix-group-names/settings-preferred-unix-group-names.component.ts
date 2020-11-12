import { Component, OnInit} from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { AddUnixGroupDialogComponent } from '../../../components/dialogs/add-unix-group-dialog/add-unix-group-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { RemoveStringValueDialogComponent } from '../../../components/dialogs/remove-string-value-dialog/remove-string-value-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';

@Component({
  selector: 'perun-web-apps-settings-preferred-unix-group-names',
  templateUrl: './settings-preferred-unix-group-names.component.html',
  styleUrls: ['./settings-preferred-unix-group-names.component.scss']
})
export class SettingsPreferredUnixGroupNamesComponent implements OnInit {

  constructor(private store: StoreService,
              private attributesManagerService: AttributesManagerService,
              private dialog: MatDialog,
              private translateService: TranslateService
  ) {
    translateService.get('PREFERRED_UNIX_GROUP_NAMES.REMOVE_DIALOG_DESCRIPTION').subscribe(value => this.removeDialogDescription = value);
    translateService.get('PREFERRED_UNIX_GROUP_NAMES.REMOVE_DIALOG_TITLE').subscribe(value => this.removeDialogTitle = value);
    translateService.get('ALERTS.NO_PREFERRED_UNIX_GROUPS').subscribe(value => this.alertText = value);
    translateService.get('PREFERRED_UNIX_GROUP_NAMES.HEADER_COLUMN').subscribe(value => this.headerColumnText = value);
  }

  namespaces: string[] = [];
  userId = this.store.getPerunPrincipal().userId;
  groupNames: Map<string, string[]> = new Map<string, string[]>();
  groupNameAttributes: Attribute[] = [];

  selectionList: SelectionModel<string>[] = [];

  alertText: string;
  headerColumnText: string;
  removeDialogTitle: string;
  removeDialogDescription: string;

  ngOnInit() {
    this.namespaces = this.store.get('preferred_unix_group_names');
    this.translateService.onLangChange.subscribe(() => {
      this.translateService.get('PREFERRED_UNIX_GROUP_NAMES.REMOVE_DIALOG_DESCRIPTION').subscribe(value => this.removeDialogDescription = value);
      this.translateService.get('PREFERRED_UNIX_GROUP_NAMES.REMOVE_DIALOG_TITLE').subscribe(value => this.removeDialogTitle = value);
      this.translateService.get('ALERTS.NO_PREFERRED_UNIX_GROUPS').subscribe(value => this.alertText = value);
      this.translateService.get('PREFERRED_UNIX_GROUP_NAMES.HEADER_COLUMN').subscribe(value => this.headerColumnText = value);
    })
    this.initSelection();
    this.namespaces.forEach(group => {
      this.getAttribute(group);
    });
  }

  initSelection(){
    for (let i = 0; i < this.namespaces.length; i++) {
      this.selectionList.push(new SelectionModel<string>(true, []));
    }
  }

  getAttribute(namespace: string) {
    this.attributesManagerService.getUserAttributeByName(this.userId, `urn:perun:user:attribute-def:def:preferredUnixGroupName-namespace:${namespace}`).subscribe(names => {
      const value = names.value ? names.value : [];
      // @ts-ignore
      this.groupNames.set(namespace, value);
      this.groupNameAttributes.push(names);
    });
  }

  addGroupName(namespace: string) {
    const groups = this.groupNames.get(namespace);

    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = { groups: groups, namespace: namespace, userId: this.userId };

    const dialogRef = this.dialog.open(AddUnixGroupDialogComponent, config);

    dialogRef.afterClosed().subscribe(added => {
      if (added) {
        this.getAttribute(namespace);
      }
    });
  }

  removeGroupName(namespace: string, index: number) {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      values: this.selectionList[index].selected,
      attribute: this.groupNameAttributes[index],
      userId: this.userId,
      title: this.removeDialogTitle,
      description: this.removeDialogDescription
    };

    const dialogRef = this.dialog.open(RemoveStringValueDialogComponent, config);

    dialogRef.afterClosed().subscribe(added => {
      if (added) {
        this.selectionList[index].clear();
        this.getAttribute(namespace);
      }
    });
  }
}
