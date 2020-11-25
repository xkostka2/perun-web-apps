import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Group, GroupsManagerService } from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-group-settings-managers',
  templateUrl: './group-settings-managers.component.html',
  styleUrls: ['./group-settings-managers.component.scss']
})
export class GroupSettingsManagersComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private groupService: GroupsManagerService,
    private route: ActivatedRoute,
    private guiAuthResolver: GuiAuthResolver
  ) { }

  group: Group;

  availableRoles: string[] = [];

  selected = 'user';

  type = 'Group';

  theme = 'group-theme';

  ngOnInit() {
    this.route.parent.parent.params.subscribe(parentParentParams => {
      const groupId = parentParentParams ['groupId'];

      this.groupService.getGroupById(groupId).subscribe(group => {
        this.group = group;
      });
    });

    this.guiAuthResolver.assignAvailableRoles(this.availableRoles, 'Group');
  }
}
