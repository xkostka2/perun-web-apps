import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserOrganizationsComponent } from './pages/user-detail-page/user-organizations/user-organizations.component';
import { UserGroupsComponent } from './pages/user-detail-page/user-groups/user-groups.component';
import { UserSettingsComponent } from './pages/user-detail-page/user-settings/user-settings.component';
import { UserSettingsOverviewComponent } from './pages/user-detail-page/user-settings/user-settings-overview/user-settings-overview.component';
import { UserAttributesComponent } from './pages/user-detail-page/user-attributes/user-attributes.component';
import { UserSettingsFacilityAttributesComponent } from './pages/user-detail-page/user-settings/user-settings-facility-attributes/user-settings-facility-attributes.component';
import { PasswordResetComponent } from '@perun-web-apps/perun/components';
import { UserSettingsAppConfigurationComponent } from './pages/user-detail-page/user-settings/user-settings-app-configuration/user-settings-app-configuration.component';
import { UserOverviewComponent } from './pages/user-detail-page/user-overview/user-overview.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UserRolesComponent } from './pages/user-detail-page/user-settings/user-roles/user-roles.component';


const routes: Routes = [
  {
    path: '',
    component: UserProfileComponent,
    children: [
      {
        path: '',
        component: UserOverviewComponent,
        data: { animation: 'UserOverviewPage' }
      },
      {
        path: 'attributes',
        component: UserAttributesComponent,
        data: { animation: 'UserAttributesPage' }
      },
      {
        path: 'organizations',
        component: UserOrganizationsComponent,
        data: { animation: 'UserOrganizationsPage', showPrincipal: true }
      },
      {
        path: 'groups',
        component: UserGroupsComponent,
        data: { animation: 'UserGroupsPage', showPrincipal: true }
      },
      {
        path: 'roles',
        component: UserRolesComponent,
        data: {animation: 'UserRolesPage'}
      },
      {
        path: 'settings',
        component: UserSettingsComponent,
        children: [
          {
            path: '',
            component: UserSettingsOverviewComponent,
            data: { animation: 'UserSettingsOverviewPage' }
          },
          {
            path: 'facilityAttributes',
            component: UserSettingsFacilityAttributesComponent,
            data: { animation: 'UserSettingsFacilityAttributesPage', showPrincipal: true }
          },
          {
            path: 'passwordReset',
            component: PasswordResetComponent,
            data: { animation: 'PasswordResetPage' }
          },
          {
            path: 'guiConfig',
            component: UserSettingsAppConfigurationComponent,
            data: { animation: 'UserAppConfigurationPage' }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {
}
