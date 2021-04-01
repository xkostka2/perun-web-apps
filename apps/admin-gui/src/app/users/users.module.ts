import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { UiAlertsModule } from '@perun-web-apps/ui/alerts';
import { MatBadgeModule } from '@angular/material/badge';
import { PerunSharedComponentsModule } from '@perun-web-apps/perun/components';
import { ConfigTableConfigModule } from '@perun-web-apps/config/table-config';
import { PerunPipesModule } from '@perun-web-apps/perun/pipes';
import { UserDetailPageComponent } from './pages/user-detail-page/user-detail-page.component';
import { UserOverviewComponent } from './pages/user-detail-page/user-overview/user-overview.component';
import { UserGroupsComponent } from './pages/user-detail-page/user-groups/user-groups.component';
import { UserSettingsComponent } from './pages/user-detail-page/user-settings/user-settings.component';
import { UserOrganizationsComponent } from './pages/user-detail-page/user-organizations/user-organizations.component';
import { UserAttributesComponent } from './pages/user-detail-page/user-attributes/user-attributes.component';
import { UserSettingsOverviewComponent } from './pages/user-detail-page/user-settings/user-settings-overview/user-settings-overview.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UserRolesComponent } from './pages/user-detail-page/user-settings/user-roles/user-roles.component';
import { UserSettingsAppConfigurationComponent } from './pages/user-detail-page/user-settings/user-settings-app-configuration/user-settings-app-configuration.component';
import { UserSettingsFacilityAttributesComponent } from './pages/user-detail-page/user-settings/user-settings-facility-attributes/user-settings-facility-attributes.component';
import { UserDashboardComponent } from './pages/user-detail-page/user-dashboard/user-dashboard.component';
import { UserSettingsServiceIdentitiesComponent } from './pages/user-detail-page/user-settings/user-settings-service-identities/user-settings-service-identities.component';
import { UserIdentitiesComponent } from './pages/user-detail-page/user-identities/user-identities.component';
import { UserResourcesComponent } from './pages/user-detail-page/user-resources/user-resources.component';
import { UserSettingsAssociatedUsersComponent } from './pages/user-detail-page/user-settings/user-settings-associated-users/user-settings-associated-users.component';
import { SharedModule } from '../shared/shared.module';
import { DashboardCardComponent } from './pages/user-detail-page/user-dashboard/dashboard-card/dashboard-card.component';
import { DashboardRecentlyViewedButtonFieldComponent } from './pages/user-detail-page/user-dashboard/dashboard-recently-viewed-button-field/dashboard-recently-viewed-button-field.component';
import { UserFacilitiesComponent } from './pages/user-detail-page/user-facilities/user-facilities.component';


@NgModule({
  declarations: [
    UserDetailPageComponent,
    UserOverviewComponent,
    UserGroupsComponent,
    UserSettingsComponent,
    UserOrganizationsComponent,
    UserAttributesComponent,
    UserSettingsOverviewComponent,
    UserProfileComponent,
    UserRolesComponent,
    UserSettingsAppConfigurationComponent,
    UserSettingsFacilityAttributesComponent,
    UserDashboardComponent,
    UserSettingsServiceIdentitiesComponent,
    UserIdentitiesComponent,
    UserResourcesComponent,
    UserSettingsAssociatedUsersComponent,
    DashboardCardComponent,
    DashboardRecentlyViewedButtonFieldComponent,
    UserFacilitiesComponent,
  ],
  exports: [
    UserDetailPageComponent,
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatSidenavModule,
    MatExpansionModule,
    TranslateModule.forChild({}),
    MatButtonModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatTreeModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatDividerModule,
    MatRippleModule,
    MatPaginatorModule,
    MatCardModule,
    MatStepperModule,
    DragDropModule,
    MatCardModule,
    MatChipsModule,
    MatMenuModule,
    ScrollingModule,
    UiAlertsModule,
    MatBadgeModule,
    PerunSharedComponentsModule,
    ConfigTableConfigModule,
    PerunPipesModule,
    SharedModule
  ]
})
export class UsersModule {
  constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'cs']);
  }
}
