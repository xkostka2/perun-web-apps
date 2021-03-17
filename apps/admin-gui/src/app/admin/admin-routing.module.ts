import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {AdminPageComponent} from './pages/admin-page/admin-page.component';
import {AdminOverviewComponent} from './pages/admin-page/admin-overview/admin-overview.component';
import {AdminAttributesComponent} from './pages/admin-page/admin-attributes/admin-attributes.component';
import {AdminVisualizerComponent} from './pages/admin-page/admin-visualizer/admin-visualizer.component';
import {
  VisualizerAttrModulesComponent
} from './pages/admin-page/admin-visualizer/visualizer-attr-modules/visualizer-attr-modules.component';
import {VisualizerOverviewComponent} from './pages/admin-page/admin-visualizer/visualizer-overview/visualizer-overview.component';
import {
  UserDestinationRelationshipComponent
} from './pages/admin-page/admin-visualizer/user-destination-relationship/user-destination-relationship.component';
import {
  UserDestinationGraphComponent
} from './pages/admin-page/admin-visualizer/user-destination-relationship/user-destination-graph/user-destination-graph.component';
import {AdminUsersComponent} from './pages/admin-page/admin-users/admin-users.component';
import {AdminUserDetailPageComponent} from './pages/admin-user-detail-page/admin-user-detail-page.component';
import {UserOverviewComponent} from '../users/pages/user-detail-page/user-overview/user-overview.component';
import {UserOrganizationsComponent} from '../users/pages/user-detail-page/user-organizations/user-organizations.component';
import {UserGroupsComponent} from '../users/pages/user-detail-page/user-groups/user-groups.component';
import {UserSettingsComponent} from '../users/pages/user-detail-page/user-settings/user-settings.component';
import {UserAttributesComponent} from '../users/pages/user-detail-page/user-attributes/user-attributes.component';
import {
  UserSettingsOverviewComponent
} from '../users/pages/user-detail-page/user-settings/user-settings-overview/user-settings-overview.component';
import { AdminExtSourcesComponent } from './pages/admin-page/admin-ext-sources/admin-ext-sources.component';
import { UserRolesComponent } from '../users/pages/user-detail-page/user-settings/user-roles/user-roles.component';
import { UserSettingsFacilityAttributesComponent } from '../users/pages/user-detail-page/user-settings/user-settings-facility-attributes/user-settings-facility-attributes.component';
import { UserSettingsServiceIdentitiesComponent } from '../users/pages/user-detail-page/user-settings/user-settings-service-identities/user-settings-service-identities.component';
import { UserIdentitiesComponent } from '../users/pages/user-detail-page/user-identities/user-identities.component';
import { AdminServicesComponent } from './pages/admin-page/admin-services/admin-services.component';
import { UserResourcesComponent } from '../users/pages/user-detail-page/user-resources/user-resources.component';
import { IdentityDetailComponent } from '../shared/components/identity-detail/identity-detail.component';
import { ServiceDetailPageComponent } from './pages/admin-page/admin-services/service-detail-page/service-detail-page.component';
import { ServiceOverviewComponent } from './pages/admin-page/admin-services/service-detail-page/service-overview/service-overview.component';
import { ServiceRequiredAttributesComponent } from './pages/admin-page/admin-services/service-detail-page/service-required-attributes/service-required-attributes.component';
import { UserSettingsAssociatedUsersComponent } from '../users/pages/user-detail-page/user-settings/user-settings-associated-users/user-settings-associated-users.component';
import { ServiceDestinationsComponent } from './pages/admin-page/admin-services/service-detail-page/service-destinations/service-destinations.component';
import { AdminOwnersComponent } from './pages/admin-page/admin-owners/admin-owners.component';

const routes: Routes = [
  {
    path: '',
    component: AdminPageComponent,
    children: [
      {
        path: '',
        component: AdminOverviewComponent,
        data: {animation: 'AdminOverviewPage'}
      },
      {
        path: 'attributes',
        component: AdminAttributesComponent,
        data: {animation: 'AdminAttributesPage'}
      },
      {
        path: 'users',
        component: AdminUsersComponent,
        data: {animation: 'AdminUsersPage'}
      },
      {
        path: 'owners',
        component: AdminOwnersComponent,
        data: {animation: 'AdminOwnersPage'}
      },
      {
        path: 'services',
        component: AdminServicesComponent,
        data: {animation: 'AdminServicesPage'}
      },
      {
        path: 'visualizer',
        component: AdminVisualizerComponent,
        children: [
          {
            path: '',
            component: VisualizerOverviewComponent,
            data: {animation: 'VisualizerOverviewPage'}
          },
          {
            path: 'attrDependencies',
            component: VisualizerAttrModulesComponent,
            data: {animation: 'VisualizerAttrModulesPage'}
          },
          {
            path: 'userDestinationRelationship',
            component: UserDestinationRelationshipComponent,
            data: {animation: 'UserDestinationRelationshipPage'}
          },
          {
            path: 'userDestinationRelationship/graph',
            component: UserDestinationGraphComponent,
            data: {animation: 'UserDestinationGraphPage'}
          }
        ]
      },
      {
        path: 'ext_sources',
        component: AdminExtSourcesComponent,
        data: {animation: 'AdminExtSourcesPage'}
      }
    ]
  },
  {
    path: 'users/:userId',
    component: AdminUserDetailPageComponent,
    children: [
      {
        path: '',
        component: UserOverviewComponent,
        data: {animation: 'UserOverviewPage'}
      },
      {
        path: 'attributes',
        component: UserAttributesComponent,
        data: {animation: 'UserAttributesPage'}
      },
      {
        path: 'organizations',
        component: UserOrganizationsComponent,
        data: {animation: 'UserOrganizationsPage', showPrincipal: false}
      },
      {
        path: 'groups',
        component: UserGroupsComponent,
        data: {animation: 'UserGroupsPage', showPrincipal: false}
      },
      {
        path: 'identities',
        component: UserIdentitiesComponent,
        data: {animation: 'UserIdentitiesPage'}
      },
      {
        path: 'resources',
        component: UserResourcesComponent,
        data: {animation: 'UserRoles'}
      },
      {
        path: 'identities/:identityId',
        component: IdentityDetailComponent,
        data: {animation: 'UserIdentityDetailPage'}
      },
      {
        path: 'settings',
        component: UserSettingsComponent,
        children: [
          {
            path: '',
            component: UserSettingsOverviewComponent,
            data: {animation: 'UserSettingsOverviewPage'}
          },
          {
            path: 'facilityAttributes',
            component: UserSettingsFacilityAttributesComponent,
            data: {animation: 'UserSettingsFacilityAttributesPage', showPrincipal: false}
          },
          {
            path: 'roles',
            component: UserRolesComponent,
            data: {animation: 'UserRolesPage'}
          },
          {
            path: 'service-identities',
            component: UserSettingsServiceIdentitiesComponent,
            data: {animation: 'UserServiceIdentities'}
          },
          {
            path: 'associated-users',
            component: UserSettingsAssociatedUsersComponent,
            data: {animation: 'AssociatedUsersPage'}
          }
        ]
      }
    ]
  },
  {
    path: 'services/:serviceId',
    component: ServiceDetailPageComponent,
    children: [
      {
        path: '',
        component: ServiceOverviewComponent,
        data: {animation: 'ServiceOverviewPage'}
      },
      {
        path: 'required-attributes',
        component: ServiceRequiredAttributesComponent,
        data: {animation: 'ServiceRequiredAttributesPage'}
      },
      {
        path: 'destinations',
        component: ServiceDestinationsComponent,
        data: {animation: 'ServiceDestinationsPage'}
      }
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})

export class AdminRoutingModule { }
