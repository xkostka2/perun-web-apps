import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FacilitiesRoutingModule } from './facilities-routing.module';
import { FacilitySelectPageComponent } from './pages/facility-select-page/facility-select-page.component';
import {SharedModule} from '../shared/shared.module';
import { FacilityDetailPageComponent } from './pages/facility-detail-page/facility-detail-page.component';
import { FacilityOverviewComponent } from './pages/facility-detail-page/facility-overview/facility-overview.component';
import { FacilityResourcesComponent } from './pages/facility-detail-page/facility-resources/facility-resources.component';
import {FacilityAllowedGroupsComponent} from './pages/facility-detail-page/facility-allowed-groups/facility-allowed-groups.component';
import { ResourceDetailPageComponent } from './pages/resource-detail-page/resource-detail-page.component';
import { ResourceOverviewComponent } from './pages/resource-detail-page/resource-overview/resource-overview.component';
import { FacilitySettingsComponent } from './pages/facility-detail-page/facility-settings/facility-settings.component';
import {
  FacilitySettingsOverviewComponent
} from './pages/facility-detail-page/facility-settings/facility-settings-overview/facility-settings-overview.component';
import {
  FacilityAttributesComponent
} from './pages/facility-detail-page/facility-attributes/facility-attributes.component';
import { ResourceSettingsComponent } from './pages/resource-detail-page/resource-settings/resource-settings.component';
import {
  ResourceSettingsOverviewComponent
} from './pages/resource-detail-page/resource-settings/resource-settings-overview/resource-settings-overview.component';
import {
  ResourceAttributesComponent
} from './pages/resource-detail-page/resource-attributes/resource-attributes.component';
import { UiAlertsModule } from '@perun-web-apps/ui/alerts';
import { ResourceGroupsComponent } from './pages/resource-detail-page/resource-groups/resource-groups.component';
import { PerunSharedComponentsModule } from '@perun-web-apps/perun/components';
import { FacilityServiceConfigComponent } from './pages/facility-detail-page/facility-service-config/facility-service-config.component';
import { FacilitySettingsManagersComponent } from './pages/facility-detail-page/facility-settings/facility-settings-managers/facility-settings-managers.component';
import { FacilityServicesDestinationsComponent } from './pages/facility-detail-page/facility-services-destinations/facility-services-destinations.component';
import { FacilitySettingsOwnersComponent } from './pages/facility-detail-page/facility-settings/facility-settings-owners/facility-settings-owners.component';
import { FacilityHostsComponent } from './pages/facility-detail-page/facility-hosts/facility-hosts.component';
import { FacilitySettingsBlacklistComponent } from './pages/facility-detail-page/facility-settings/facility-settings-blacklist/facility-settings-blacklist.component';
import { FacilityHostsDetailComponent } from './pages/facility-detail-page/facility-hosts/facility-hosts-detail/facility-hosts-detail.component';
import { FacilitySecurityTeamsComponent } from './pages/facility-detail-page/facility-security-teams/facility-security-teams.component';
import { PerunPipesModule, UserFullNamePipe } from '@perun-web-apps/perun/pipes';
import { ResourceSettingsManagersComponent } from './pages/resource-detail-page/resource-settings/resource-settings-managers/resource-settings-managers.component';
import { FacilityServiceStatusComponent } from './pages/facility-detail-page/facility-service-status/facility-service-status.component';
import { ResourceAssignedServicesComponent } from './pages/resource-detail-page/resource-assigned-services/resource-assigned-services.component';
import { FacilityAllowedUsersComponent } from './pages/facility-detail-page/facility-allowed-users/facility-allowed-users.component';
import { ResourceAssignedMembersComponent } from './pages/resource-detail-page/resource-assigned-members/resource-assigned-members.component';
import { FacilityTaskResultsComponent } from './pages/facility-detail-page/facility-service-status/facility-task-results/facility-task-results.component';
import { UsersModule } from '../users/users.module';

@NgModule({
  declarations: [
    FacilitySelectPageComponent,
    FacilityDetailPageComponent,
    FacilityOverviewComponent,
    FacilityResourcesComponent,
    FacilityAllowedGroupsComponent,
    ResourceDetailPageComponent,
    ResourceOverviewComponent,
    FacilitySettingsComponent,
    FacilitySettingsOverviewComponent,
    FacilityAttributesComponent,
    ResourceSettingsComponent,
    ResourceSettingsOverviewComponent,
    ResourceAttributesComponent,
    ResourceGroupsComponent,
    FacilityServiceConfigComponent,
    FacilitySettingsManagersComponent,
    FacilityServicesDestinationsComponent,
    FacilitySettingsOwnersComponent,
    FacilityHostsComponent,
    FacilitySettingsBlacklistComponent,
    FacilityHostsDetailComponent,
    FacilitySecurityTeamsComponent,
    ResourceSettingsManagersComponent,
    ResourceAssignedServicesComponent,
    FacilityServiceStatusComponent,
    FacilityAllowedUsersComponent,
    ResourceAssignedMembersComponent,
    FacilityTaskResultsComponent
  ],
  imports: [
    CommonModule,
    FacilitiesRoutingModule,
    SharedModule,
    UiAlertsModule,
    PerunSharedComponentsModule,
    PerunPipesModule,
    UsersModule
  ],
  providers: [
    UserFullNamePipe
  ]
})
export class FacilitiesModule { }
