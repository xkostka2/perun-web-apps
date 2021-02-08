import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { AddManagerDialogComponent } from '../dialogs/add-manager-dialog/add-manager-dialog.component';
import { RemoveManagerDialogComponent } from '../dialogs/remove-manager-dialog/remove-manager-dialog.component';
import { RemoveGroupManagerDialogComponent } from '../dialogs/remove-group-manager-dialog/remove-group-manager-dialog.component';
import { AddGroupManagerDialogComponent } from '../dialogs/add-group-manager-dialog/add-group-manager-dialog.component';
import { AuthzResolverService, Facility, Group, Resource, RichUser, Vo } from '@perun-web-apps/perun/openapi';
import { Urns } from '@perun-web-apps/perun/urns';
import { TABLE_GROUP_MANAGERS_PAGE, TableConfigService } from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { GuiAuthResolver, StoreService } from '@perun-web-apps/perun/services';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'app-managers-page',
  templateUrl: './managers-page.component.html',
  styleUrls: ['./managers-page.component.scss']
})
export class ManagersPageComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private dialog: MatDialog,
    private tableConfigService: TableConfigService,
    private authzService: AuthzResolverService,
    private storeService: StoreService,
    public guiAuthResolver: GuiAuthResolver
  ) {
  }


  groups: Group[] = null;
  managers: RichUser[] = null;

  @Input()
  complementaryObject: Group | Vo | Facility | Resource;

  @Input()
  availableRoles: string[];

  @Input()
  complementaryObjectType: string;

  @Input()
  theme: string;

  selectionUsers = new SelectionModel<RichUser>(true, []);
  selectionGroups = new SelectionModel<Group>(true, []);

  selectedMode = '';
  selectedRole: string;

  loading = false;

  tableId = TABLE_GROUP_MANAGERS_PAGE;
  pageSize: number;

  routeAuth: boolean;
  manageAuth: boolean;
  roleModes: string[];

  availableRolesPrivileges: Map<string, any> = new Map<string, any>();

  ngOnInit() {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);

    this.guiAuthResolver.getRolesAuthorization(this.availableRoles, this.complementaryObject, this.availableRolesPrivileges);
    this.availableRoles = this.availableRoles.filter(role => {
      return this.availableRolesPrivileges.get(role).readAuth;
    });

    if (this.availableRoles.length !== 0){
      this.selectedRole = this.availableRoles[0];
    }

    this.routeAuth = this.guiAuthResolver.isPerunAdmin();
    this.refreshUsers();
  }

  changeRolePrivileges() {
    this.manageAuth = this.availableRolesPrivileges.get(this.selectedRole).manageAuth;
    this.roleModes = this.availableRolesPrivileges.get(this.selectedRole).modes;
    let roleHasThisMode = false;
    for (const mode of this.roleModes){
      if (this.selectedMode === mode.toLowerCase()){
        roleHasThisMode = true;
        break;
      }
    }
    if (!roleHasThisMode){
      this.selectedMode = this.roleModes[0].toLowerCase();
    }
  }

  tabChanged(event: MatTabChangeEvent) {
    this.loading = true;

    if(event.index === 0) {
      this.selectedMode = 'user';
      this.refreshUsers();
    } else {
      this.selectedMode = 'group';
      this.refreshGroups();
    }
  }

  refreshUsers() {
    this.loading = true;
    this.changeRolePrivileges();

    let attributes = [
      Urns.USER_DEF_ORGANIZATION,
      Urns.USER_DEF_PREFERRED_MAIL];
    attributes = attributes.concat(this.storeService.getLoginAttributeNames());
    this.authzService.getAuthzRichAdmins(this.selectedRole, this.complementaryObject.id, this.complementaryObjectType,
      attributes,false, true).subscribe(managers => {
      this.managers = managers;
      this.selectionUsers.clear();
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  refreshGroups() {
    this.loading = true;
    this.changeRolePrivileges();

    this.authzService.getAuthzAdminGroups(this.selectedRole, this.complementaryObject.id, this.complementaryObjectType).subscribe(groups => {
      this.groups = groups;
      this.selectionGroups.clear();
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  addManager() {
    const config = getDefaultDialogConfig();
    config.width = '1000px';
    config.data = {
      complementaryObject: this.complementaryObject,
      theme: this.theme,
      availableRoles: this.availableRoles,
      selectedRole: this.selectedRole
    };

    const dialogRef = this.dialog.open(AddManagerDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.refreshUsers();
      }
    });
  }

  removeManager() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      managers: this.selectionUsers.selected,
      complementaryObject: this.complementaryObject,
      role: this.selectedRole,
      theme: this.theme
    };

    const dialogRef = this.dialog.open(RemoveManagerDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshUsers();
      }
    });
  }

  removeGroup() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      groups: this.selectionGroups.selected,
      complementaryObject: this.complementaryObject,
      role: this.selectedRole,
      theme: this.theme
    };

    const dialogRef = this.dialog.open(RemoveGroupManagerDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshGroups();
      }
    });
  }

  addGroup() {
    const config = getDefaultDialogConfig();
    config.width = '1000px';
    config.data = {
      complementaryObject: this.complementaryObject,
      availableRoles: this.availableRoles,
      theme: this.theme,
      selectedRole: this.selectedRole
    };

    const dialogRef = this.dialog.open(AddGroupManagerDialogComponent, config);
    dialogRef.afterClosed().subscribe(result => {
      if (result){
        this.refreshGroups();
      }
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
