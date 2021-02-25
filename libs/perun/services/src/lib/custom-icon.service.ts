import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

export class CustomIcon  {
  url: string;
  name: string;
}

@Injectable()
export class CustomIconService {
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {}

  customIcons: CustomIcon[] = [
    {
      url: 'assets/img/PerunWebImages/refresh_tab-black.svg',
      name: 'perun-refresh-enabled'
    },
    {
      url: 'assets/img/PerunWebImages/refresh_tab-grey.svg',
      name: 'perun-refresh-disabled'
    },
    {
      url: 'assets/img/PerunWebImages/manage_facility_white.svg',
      name: 'perun-manage-facility'
    },
    {
      url: 'assets/img/PerunWebImages/vo-white.svg',
      name: 'perun-vo'
    },
    {
      url: 'assets/img/PerunWebImages/user-white.svg',
      name: 'perun-user'
    },
    {
      url: 'assets/img/PerunWebImages/perun_admin-white.svg',
      name: 'perun-perun-admin'
    },
    {
      url: 'assets/img/PerunWebImages/group-white.svg',
      name: 'perun-group'
    },
    {
      url: 'assets/img/PerunWebImages/attributes-white.svg',
      name: 'perun-attributes'
    },
    {
      url: 'assets/img/PerunWebImages/preview-white.svg',
      name: 'perun-preview'
    },
    {
      url: 'assets/img/PerunWebImages/module_dependencies.svg',
      name: 'perun-module-dependencies'
    },
    {
      url: 'assets/img/PerunWebImages/user_destination_relationship.svg',
      name: 'perun-user-destination-relationship'
    },
    {
      url: 'assets/img/PerunWebImages/settings2-white.svg',
      name: 'perun-settings2'
    },
    {
      url: 'assets/img/PerunWebImages/attributes-white.svg',
      name: 'perun-attributes'
    },
    {
      url: 'assets/img/PerunWebImages/applications-white.svg',
      name: 'perun-applications'
    },
    {
      url: 'assets/img/PerunWebImages/manager-white.svg',
      name: 'perun-manager'
    },
    {
      url: 'assets/img/PerunWebImages/application_form-white.svg',
      name: 'perun-application-form'
    },
    {
      url: 'assets/img/PerunWebImages/notification-white.svg',
      name: 'perun-notification'
    },
    {
      url: 'assets/img/PerunWebImages/invite_member-white.svg',
      name: 'perun-invite-member'
    },
    {
      url: 'assets/img/PerunWebImages/service_identity-white.svg',
      name: 'perun-service-identity'
    },
    {
      url: 'assets/img/PerunWebImages/create1-white.svg',
      name: 'perun-create1'
    },
    {
      url: 'assets/img/PerunWebImages/resource-white.svg',
      name: 'perun-resource'
    },
    {
      url: 'assets/img/PerunWebImages/resource_tags-white.svg',
      name: 'perun-resource-tags'
    },
    {
      url: 'assets/img/PerunWebImages/resources_state-white.svg',
      name: 'perun-resources-state'
    },
    {
      url: 'assets/img/PerunWebImages/external_sources-white.svg',
      name: 'perun-external-sources'
    },
    {
      url: 'assets/img/PerunWebImages/vo-dark.svg',
      name: 'perun-vo-black'
    },
    {
      url: 'assets/img/PerunWebImages/group-dark.svg',
      name: 'perun-group-black'
    },
    {
      url: 'assets/img/PerunWebImages/facility-dark.svg',
      name: 'perun-facility-black'
    },
    {
      url: 'assets/img/publications.svg',
      name: 'perun-publications-white'
    },
    // TESTING PURPOSES
    {
      url: 'assets/img/settings1-blue.svg',
      name: 'settings-blue'
    },
    {
      url: 'assets/img/PerunWebImages/service_destination-blue.svg',
      name: 'perun-service_destination'
    },
    {
      url: 'assets/img/PerunWebImages/host-blue.svg',
      name: 'perun-hosts'
    },
    {
      url: 'assets/img/PerunWebImages/home.svg',
      name: 'perun-home-white'
    },
    {
      url: 'assets/img/PerunWebImages/security_admin-blue.svg',
      name: 'perun-security-teams'
    },
    {
      url: 'assets/img/PerunWebImages/black_list-white.svg',
      name: 'perun-black-list'
    },
    {
      url: 'assets/img/PerunWebImages/facility-white.svg',
      name: 'perun-facility-white'
    },
    {
      url: 'assets/img/PerunWebImages/resource-white.svg',
      name: 'perun-resource-white'
    },
    {
      url: 'assets/img/PerunWebImages/service-white.svg',
      name: 'perun-service'
    },
    {
      url: 'assets/img/PerunWebImages/resource-black.svg',
      name: 'perun-resource-black'
    },
    {
      url: 'assets/img/PerunWebImages/service_status-grey.svg',
      name: 'perun-service-status'
    },
    {
      url: 'assets/img/PerunWebImages/user-dark.svg',
      name: 'perun-user-dark'
    }
  ];

  registerPerunRefreshIcon() {
    this.customIcons.forEach(ci => {
      this.matIconRegistry.addSvgIcon(
        ci.name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(ci.url)
      )
    });
  }
}
