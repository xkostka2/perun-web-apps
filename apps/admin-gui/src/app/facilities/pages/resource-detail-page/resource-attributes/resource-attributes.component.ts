import {Component, HostBinding, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import {
  Resource,
  ResourcesManagerService
} from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-resource-attributes',
  templateUrl: './resource-attributes.component.html',
  styleUrls: ['./resource-attributes.component.scss']
})
export class ResourceAttributesComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(private route: ActivatedRoute,
              private authResolver: GuiAuthResolver,
              private resourceManager: ResourcesManagerService) { }

  resourceId: number;
  resource: Resource;

  resourceGroupAttAuth: boolean;
  resourceMemberAttAuth: boolean;

  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      this.resourceId = parseInt(params['resourceId'], 10);

      this.resourceManager.getResourceById(this.resourceId).subscribe(resource => {
        this.resource = resource;

        this.resourceGroupAttAuth = this.authResolver.isAuthorized('getAssignedGroups_Resource_policy', [this.resource]);
        this.resourceMemberAttAuth = this.authResolver.isAuthorized('getAssignedRichMembers_Resource_policy', [this.resource]);
      });
    });
  }
}
