import { Component, OnInit } from '@angular/core';
import { SideMenuService } from '../../../core/services/common/side-menu.service';
import { ActivatedRoute } from '@angular/router';
import { SideMenuItemService } from '../../../shared/side-menu/side-menu-item.service';
import { fadeIn } from '@perun-web-apps/perun/animations';
import { Group, GroupsManagerService, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import {
  EditFacilityResourceGroupVoDialogComponent,
  EditFacilityResourceGroupVoDialogOptions
} from '../../../shared/components/dialogs/edit-facility-resource-group-vo-dialog/edit-facility-resource-group-vo-dialog.component';
import { GuiAuthResolver, StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-group-detail-page',
  templateUrl: './group-detail-page.component.html',
  styleUrls: ['./group-detail-page.component.scss'],
  animations: [
    fadeIn
  ]
})
export class GroupDetailPageComponent implements OnInit {

  supportedEntities = ['Vo', 'Resource', 'Group', 'Member'];

  vo: Vo;
  group: Group;
  editAuth = false;
  loading = false;
  roles = this.store.getPerunPrincipal().roles;

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    private route: ActivatedRoute,
    private sideMenuItemService: SideMenuItemService,
    private groupService: GroupsManagerService,
    private dialog: MatDialog,
    private guiAuthResolver: GuiAuthResolver,
    private store: StoreService
  ) {
  }

  ngOnInit() {
    this.loading = true;
    this.route.params.subscribe(params => {
      const voId = params['voId'];
      const groupId = params['groupId'];

      this.voService.getVoById(voId).subscribe(vo => {
        this.vo = vo;
        this.groupService.getGroupById(groupId).subscribe(group => {
          this.group = group;
          this.editAuth = this.guiAuthResolver.isAuthorized('updateGroup_Group_policy', [group]);
          const voSideMenuItem = this.sideMenuItemService.parseVo(vo);
          const groupSideMenuItem = this.sideMenuItemService.parseGroup(group);

          this.sideMenuService.setAccessMenuItems([voSideMenuItem, groupSideMenuItem]);
          this.loading = false;
        }, () => this.loading = false);
      }, () => this.loading = false);
    });
  }

  editGroup() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      theme: 'group-theme',
      group: this.group,
      dialogType: EditFacilityResourceGroupVoDialogOptions.GROUP
    };
    const dialogRef = this.dialog.open(EditFacilityResourceGroupVoDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.groupService.getGroupById(this.group.id).subscribe(group => {
          this.group = group;
        });
      }
    });
  }
}
