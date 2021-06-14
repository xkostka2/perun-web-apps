import {Component, HostBinding, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import {
  Group,
  GroupsManagerService,
} from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-group-attributes',
  templateUrl: './group-attributes.component.html',
  styleUrls: ['./group-attributes.component.scss']
})
export class GroupAttributesComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(
    private route: ActivatedRoute,
    private groupManager: GroupsManagerService,
    private authResolver: GuiAuthResolver
  ) {}

  groupId: number;
  group: Group;

  groupResourceAttAuth: boolean;
  groupMemberAttAuth: boolean;

  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.groupId = params['groupId'];

      this.groupManager.getGroupById(this.groupId).subscribe(group => {
        this.group = group;

        this.groupResourceAttAuth = this.authResolver.isAuthorized('getAssignedResources_Group_policy', [this.group]);
        this.groupMemberAttAuth = this.authResolver.isAuthorized('getCompleteRichMembers_Group_List<String>_List<String>_List<String>_boolean_policy', [this.group]);
      });
    });
  }
}
