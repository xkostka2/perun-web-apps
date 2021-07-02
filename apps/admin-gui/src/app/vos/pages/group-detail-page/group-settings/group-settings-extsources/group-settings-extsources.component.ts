import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { TABLE_GROUP_EXTSOURCES_SETTINGS, TableConfigService } from '@perun-web-apps/config/table-config';
import { ExtSource, ExtSourcesManagerService, Group, GroupsManagerService } from '@perun-web-apps/perun/openapi';
import { SelectionModel } from '@angular/cdk/collections';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddExtSourceDialogComponent } from '../../../../../shared/components/dialogs/add-ext-source-dialog/add-ext-source-dialog.component';
import { RemoveExtSourceDialogComponent } from '../../../../../shared/components/dialogs/remove-ext-source-dialog/remove-ext-source-dialog.component';

@Component({
  selector: 'app-group-settings-extsources',
  templateUrl: './group-settings-extsources.component.html',
  styleUrls: ['./group-settings-extsources.component.scss']
})
export class GroupSettingsExtsourcesComponent implements OnInit {

  constructor(private extSourceService: ExtSourcesManagerService,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private notificator: NotificatorService,
              private tableConfigService: TableConfigService,
              private translate: TranslateService,
              private authResolver: GuiAuthResolver,
              private groupService: GroupsManagerService) {
    this.translate.get('GROUP_DETAIL.SETTINGS.EXT_SOURCES.SUCCESS_REMOVED').subscribe(result => this.successMessage = result);
  }

  voId: number;
  groupId: number;
  group: Group;
  extSources: ExtSource[] = [];
  selection = new SelectionModel<ExtSource>(true, []);
  loading: boolean;
  filterValue = '';
  successMessage: string;
  pageSize: number;
  tableId = TABLE_GROUP_EXTSOURCES_SETTINGS;
  displayedColumns = [];

  addAuth: boolean;
  removeAuth: boolean;

  ngOnInit(): void {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.route.parent.parent.params.subscribe(parentParams => {
      this.voId = parentParams['voId'];
      this.groupId = parentParams['groupId'];

      this.groupService.getGroupById(this.groupId).subscribe( group => {
        this.group = group;
        this.refreshTable();
      });
    });
  }

  setAuthRights(){
    this.addAuth = this.authResolver.isAuthorized('addExtSource_Group_ExtSource_policy', [this.group]);
    this.removeAuth = this.authResolver.isAuthorized('removeExtSource_Group_ExtSource_policy', [this.group]);
    this.displayedColumns = this.removeAuth ? ['select', 'id', 'name', 'type'] : ['id', 'name', 'type'];
  }

  refreshTable() {
    this.loading = true;
    this.extSourceService.getGroupExtSources(this.groupId).subscribe(sources => {
      this.extSources = sources;
      this.selection.clear();
      this.setAuthRights();
      this.loading = false;
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  onAdd() {
    const config = getDefaultDialogConfig();
    config.width = '1000px';
    config.data= {
      voId: this.voId,
      groupId: this.groupId,
      extSources: this.extSources,
      theme: 'group-theme'
    };

    const dialogRef = this.dialog.open(AddExtSourceDialogComponent, config);
    dialogRef.afterClosed().subscribe(added => {
      if (added) {
        this.refreshTable();
      }
    });
  }

  onRemove() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data= {
      voId: this.voId,
      groupId: this.groupId,
      extSources: this.selection.selected,
      theme: 'group-theme'
    };

    const dialogRef = this.dialog.open(RemoveExtSourceDialogComponent, config);
    dialogRef.afterClosed().subscribe(removed => {
      if (removed) {
        this.refreshTable();
      }
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

}
