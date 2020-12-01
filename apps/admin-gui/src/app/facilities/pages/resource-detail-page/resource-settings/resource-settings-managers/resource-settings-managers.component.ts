import { Component, OnInit } from '@angular/core';
import { Resource, ResourcesManagerService } from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-resource-settings-managers',
  templateUrl: './resource-settings-managers.component.html',
  styleUrls: ['./resource-settings-managers.component.scss']
})
export class ResourceSettingsManagersComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private resourceService: ResourcesManagerService,
    private guiAuthResolver: GuiAuthResolver
  ) { }

  resource: Resource;
  availableRoles: string[] = [];
  type = "Resource";
  theme = 'resource-theme';



  ngOnInit(): void {
    this.route.parent.parent.params.subscribe(params => {
      const resourceId = params["resourceId"];

      this.resourceService.getResourceById(resourceId).subscribe(resource => {
        this.resource = resource;
      });
    });

    this.guiAuthResolver.assignAvailableRoles(this.availableRoles, 'Resource');
  }
}
