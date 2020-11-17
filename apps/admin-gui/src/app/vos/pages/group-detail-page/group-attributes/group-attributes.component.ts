import {Component, HostBinding, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SelectionModel} from '@angular/cdk/collections';
import {AttributesListComponent} from '@perun-web-apps/perun/components';
import { GuiAuthResolver, MembersService, NotificatorService } from '@perun-web-apps/perun/services';
import {TranslateService} from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import {
  DeleteAttributeDialogComponent
} from '../../../../shared/components/dialogs/delete-attribute-dialog/delete-attribute-dialog.component';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import {
  Attribute,
  AttributesManagerService, Group, GroupsManagerService,
} from '@perun-web-apps/perun/openapi';
import {
  TABLE_ATTRIBUTES_SETTINGS,
  TableConfigService
} from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';
import { EditAttributeDialogComponent } from '@perun-web-apps/perun/dialogs';
import { CreateAttributeDialogComponent } from '../../../../shared/components/dialogs/create-attribute-dialog/create-attribute-dialog.component';

@Component({
  selector: 'app-group-attributes',
  templateUrl: './group-attributes.component.html',
  styleUrls: ['./group-attributes.component.scss']
})
export class GroupAttributesComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private route: ActivatedRoute,
    private attributesManager: AttributesManagerService,
    private groupManager: GroupsManagerService,
    private notificator: NotificatorService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private tableConfigService: TableConfigService,
    private authResolver: GuiAuthResolver
  ) {
    this.translate.get('GROUP_DETAIL.SETTINGS.ATTRIBUTES.SUCCESS_SAVE').subscribe(value => this.saveSuccessMessage = value);
    this.translate.get('GROUP_DETAIL.SETTINGS.ATTRIBUTES.SUCCESS_DELETE').subscribe(value => this.deleteSuccessMessage = value);
  }

  @ViewChild('list')
  list: AttributesListComponent;

  saveSuccessMessage: string;
  deleteSuccessMessage: string;
  selection = new SelectionModel<Attribute>(true, []);
  attributes: Attribute[] = [];
  groupId: number;
  group: Group;

  groupResourceAttAuth: boolean;
  groupMemberAttAuth: boolean;

  loading: boolean;
  filterValue = '';
  tableId = TABLE_ATTRIBUTES_SETTINGS;
  pageSize: number;

  ngOnInit() {
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.route.parent.params.subscribe(params => {
      this.groupId = params['groupId'];

      this.groupManager.getGroupById(this.groupId).subscribe(group => {
        this.group = group;

        this.groupResourceAttAuth = this.authResolver.isAuthorized('getAssignedResources_Group_policy', [this.group]);
        this.groupMemberAttAuth = this.authResolver.isAuthorized('getCompleteRichMembers_Group_List<String>_List<String>_boolean_policy', [this.group]);
        this.refreshTable();
      });
    });
  }

  onCreate() {
    const config = getDefaultDialogConfig();
    config.width = '1050px';
    config.data = {
      entityId: this.groupId,
      entity: 'group',
      notEmptyAttributes: this.attributes,
      style: 'group-theme'
    };

    const dialogRef = this.dialog.open(CreateAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  onSave() {
    // have to use this to update attribute with map in it, before saving it
    this.list.updateMapAttributes();

    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      entityId: this.groupId,
      entity: 'group',
      attributes: this.selection.selected
    };

    const dialogRef = this.dialog.open(EditAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshTable();
      }
    });
  }

  onDelete() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      entityId: this.groupId,
      entity: 'group',
      attributes: this.selection.selected
    };

    const dialogRef = this.dialog.open(DeleteAttributeDialogComponent, config);

    dialogRef.afterClosed().subscribe(didConfirm => {
      if (didConfirm) {
        this.refreshTable();
      }
    });
  }

  refreshTable() {
    // TODO Does not apply filter on refresh.
    this.loading = true;
    this.attributesManager.getGroupAttributes(this.groupId).subscribe(attributes => {
      this.attributes = attributes;
      this.selection.clear();
      this.loading = false;
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
