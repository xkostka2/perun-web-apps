import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PerunNavComponent} from './perun-nav/perun-nav.component';
import {RouterModule} from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatStepperModule } from '@angular/material/stepper';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SideMenuComponent} from './side-menu/side-menu.component';
import {SideMenuItemComponent} from './side-menu/side-menu-item/side-menu-item.component';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {CreateGroupDialogComponent} from './components/dialogs/create-group-dialog/create-group-dialog.component';
import {InviteMemberDialogComponent} from './components/dialogs/invite-member-dialog/invite-member-dialog.component';
import {DeleteGroupDialogComponent} from './components/dialogs/delete-group-dialog/delete-group-dialog.component';
import {SettingsToggleItemComponent} from './components/settings-toggle-item/settings-toggle-item.component';
import { ApplicationStatePipe } from './pipes/application-state.pipe';
import { NotificatorComponent } from './components/notificator/notificator.component';
import { AttributeTypeCleanPipe } from './pipes/attribute-type-clean.pipe';
import { NameSpaceToDefPipe } from './pipes/name-space-to-def.pipe';
import { ApplicationReSendNotificationDialogComponent
} from './components/dialogs/application-re-send-notification-dialog/application-re-send-notification-dialog.component';
import { ApplicationRejectDialogComponent } from './components/dialogs/application-reject-dialog/application-reject-dialog.component';
import { AnyToStringPipe } from './pipes/any-to-string.pipe';
import { DeleteAttributeDialogComponent } from './components/dialogs/delete-attribute-dialog/delete-attribute-dialog.component';
import { RemoveMembersDialogComponent } from './components/dialogs/remove-members-dialog/remove-members-dialog.component';
import { SideMenuRootItemComponent } from './side-menu/side-menu-root-item/side-menu-root-item.component';
import { DebuggerPageComponent } from './debugger-page/debugger-page.component';
import { RemoveResourceDialogComponent } from './components/dialogs/remove-resource-dialog/remove-resource-dialog.component';
import { AddManagerDialogComponent } from './components/dialogs/add-manager-dialog/add-manager-dialog.component';
import { RemoveManagerDialogComponent } from './components/dialogs/remove-manager-dialog/remove-manager-dialog.component';
import {AddGroupManagerDialogComponent } from './components/dialogs/add-group-manager-dialog/add-group-manager-dialog.component';
import { RemoveGroupManagerDialogComponent } from './components/dialogs/remove-group-manager-dialog/remove-group-manager-dialog.component';
import { ApplicationFormItemTypePipe } from './pipes/application-form-item-type.pipe';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {
  UpdateApplicationFormDialogComponent
} from './components/dialogs/update-application-form-dialog/update-application-form-dialog.component';
import {
  DeleteApplicationFormItemDialogComponent
} from './components/dialogs/delete-application-form-item-dialog/delete-application-form-item-dialog.component';
import {
  ApplicationFormCopyItemsDialogComponent
} from './components/dialogs/application-form-copy-items-dialog/application-form-copy-items-dialog.component';
import {
  AddApplicationFormItemDialogComponent
} from './components/dialogs/add-application-form-item-dialog/add-application-form-item-dialog.component';
import {
  EditApplicationFormItemDialogComponent
} from './components/dialogs/edit-application-form-item-dialog/edit-application-form-item-dialog.component';
import { ApplicationFormWidgetDescriptionPipe } from './pipes/application-form-widget-description.pipe';
import { AddMemberDialogComponent } from './components/dialogs/add-member-dialog/add-member-dialog.component';
import {MembersCandidatesListComponent} from './components/members-candidates-list/members-candidates-list.component';
import {UserVoPipe} from './pipes/vo-or-ext-source.pipe';
import { CreateResourceTagDialogComponent } from './components/dialogs/create-resource-tag-dialog/create-resource-tag-dialog.component';
import { DeleteResourceTagDialogComponent } from './components/dialogs/delete-resource-tag-dialog/delete-resource-tag-dialog.component';
import { MoveGroupDialogComponent } from './components/dialogs/move-group-dialog/move-group-dialog.component';
import { ManagersPageComponent } from './components/managers-page/managers-page.component';
import {
  DeleteNotificationDialogComponent
} from './components/dialogs/delete-notification-dialog/delete-notification-dialog.component';
import {
  EditEmailFooterDialogComponent
} from './components/dialogs/edit-email-footer-dialog/edit-email-footer-dialog.component';
import {
  AddEditNotificationDialogComponent
} from './components/dialogs/add-edit-notification-dialog/add-edit-notification-dialog.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { TagSectionComponent } from './components/dialogs/add-edit-notification-dialog/tag-section/tag-section.component';
import { TagBarComponent } from './components/dialogs/add-edit-notification-dialog/tag-bar/tag-bar.component';
import {
  NotificationsCopyMailsDialogComponent
} from './components/dialogs/notifications-copy-mails-dialog/notifications-copy-mails-dialog.component';
import {DisplayedRolePipe} from './pipes/displayed-role.pipe';
import { AnimatedRouterOutletComponent } from './components/animated-router-outlet/animated-router-outlet.component';
import { UserEmailPipe } from './pipes/user-email.pipe';
import { ResourcesTagsListComponent } from './components/resources-tags-list/resources-tags-list.component';
// tslint:disable-next-line:max-line-length
import { DeleteAttributeDefinitionDialogComponent } from './components/dialogs/delete-attribute-definition-dialog/delete-attribute-definition-dialog.component';
// tslint:disable-next-line:max-line-length
import { CreateAttributeDefinitionDialogComponent } from './components/dialogs/create-attribute-definition-dialog/create-attribute-definition-dialog.component';
import { UiAlertsModule } from '@perun-web-apps/ui/alerts';
import { EditAttributeDefinitionDialogComponent } from './components/dialogs/edit-attribute-definition-dialog/edit-attribute-definition-dialog.component';
import { EntitylessAttributeKeysListComponent } from './components/entityless-attribute-keys-list/entityless-attribute-keys-list.component';
import { ServicesListComponent } from './components/services-list/services-list.component';
import { RemoveVoDialogComponent } from './components/dialogs/remove-vo-dialog/remove-vo-dialog.component';
import { CreateVoDialogComponent } from './components/dialogs/create-vo-dialog/create-vo-dialog.component';
import { ShowNotificationHistoryDialogComponent } from './components/dialogs/show-notification-history-dialog/show-notification-history-dialog.component';
import { ExtSourcesListComponent } from './components/ext-sources-list/ext-sources-list.component';
import { AddExtSourceDialogComponent } from './components/dialogs/add-ext-source-dialog/add-ext-source-dialog.component';
import { CreateRelationDialogComponent } from './components/dialogs/create-relation-dialog/create-relation-dialog.component';
import { RemoveRelationDialogComponent } from './components/dialogs/remove-relation-dialog/remove-relation-dialog.component';
import { RemoveGroupFromResourceDialogComponent } from './components/dialogs/remove-group-from-resource-dialog/remove-group-from-resource-dialog.component';
import { AssignGroupToResourceDialogComponent } from './components/dialogs/assign-group-to-resource-dialog/assign-group-to-resource-dialog.component';
import { CreateResourceDialogComponent } from './components/dialogs/create-resource-dialog/create-resource-dialog.component';
import { ExtSourceTypePipe } from './pipes/ext-source-type.pipe';
// @ts-ignore
import { PerunSharedComponentsModule } from '@perun-web-apps/perun/components';
import { ConfigTableConfigModule } from '@perun-web-apps/config/table-config';
import { MemberStatusTooltipPipe, PerunPipesModule } from '@perun-web-apps/perun/pipes';
import { RemoveDestinationDialogComponent } from './components/dialogs/remove-destination-dialog/remove-destination-dialog.component';
import { DestinationListComponent } from './components/destination-list/destination-list.component';
import { AddServicesDestinationDialogComponent } from './components/dialogs/add-services-destination-dialog/add-services-destination-dialog.component';
import { AddGroupResourceDialogComponent } from './components/dialogs/add-group-resource-dialog/add-group-resource-dialog.component';
import { RemoveGroupResourceDialogComponent } from './components/dialogs/remove-group-resource-dialog/remove-group-resource-dialog.component';
import { TwoEntityAttributePageComponent } from './components/two-entity-attribute-page/two-entity-attribute-page.component';
import { UserLoginsPipe } from './pipes/user-logins.pipe';
import { AttributeImportDialogComponent } from './components/dialogs/attribute-import-dialog/attribute-import-dialog.component';
import { HostsListComponent } from './components/hosts-list/hosts-list.component';
import { BlacklistListComponent } from './components/blacklist-list/blacklist-list.component';
import { SecurityTeamsListComponent } from './components/security-teams-list/security-teams-list.component';
import { AddUserExtSourceDialogComponent } from './components/dialogs/add-user-ext-source-dialog/add-user-ext-source-dialog.component';
import { AddHostDialogComponent } from './components/dialogs/add-host-dialog/add-host-dialog.component';
import { RemoveHostDialogComponent } from './components/dialogs/remove-host-dialog/remove-host-dialog.component';
import { AddFacilityOwnerDialogComponent } from './components/dialogs/add-facility-owner-dialog/add-facility-owner-dialog.component';
import { RemoveFacilityOwnerDialogComponent } from './components/dialogs/remove-facility-owner-dialog/remove-facility-owner-dialog.component';
import { NotFoundPageComponent } from './components/not-found-page/not-found-page.component';
import { CreateEditServiceDialogComponent } from './components/dialogs/create-edit-service-dialog/create-edit-service-dialog.component';
import { DeleteServiceDialogComponent } from './components/dialogs/delete-service-dialog/delete-service-dialog.component';
import { AddMemberToResourceDialogComponent } from './components/dialogs/add-member-to-resource-dialog/add-member-to-resource-dialog.component';
import { CreateFacilityDialogComponent } from './components/dialogs/create-facility-dialog/create-facility-dialog.component';
import { DeleteFacilityDialogComponent } from './components/dialogs/delete-facility-dialog/delete-facility-dialog.component';
import { IdentityDetailComponent } from './components/identity-detail/identity-detail.component';
import { AssignServiceToResourceDialogComponent } from './components/dialogs/assign-service-to-resource-dialog/assign-service-to-resource-dialog.component';
import { RemoveServiceFromResourceDialogComponent } from './components/dialogs/remove-service-from-resource-dialog/remove-service-from-resource-dialog.component';
import { AddMemberGroupDialogComponent } from './components/dialogs/add-member-group-dialog/add-member-group-dialog.component';
import { RemoveMemberGroupDialogComponent } from './components/dialogs/remove-member-group-dialog/remove-member-group-dialog.component';
import { AddRequiredAttributesDialogComponent } from './components/dialogs/add-required-attributes-dialog/add-required-attributes-dialog.component';
import { RemoveRequiredAttributesDialogComponent } from './components/dialogs/remove-required-attributes-dialog/remove-required-attributes-dialog.component';
import { AttrDefListComponent} from './components/attr-def-list/attr-def-list.component';
import { TransformMemberStatusPipe } from './pipes/transform-member-status.pipe';
import { ConnectIdentity } from './components/dialogs/connect-identity/connect-identity';
import { DisconnectIdentity } from './components/dialogs/disconnect-identity/disconnect-identity';
import { EditUserDialogComponent } from './components/dialogs/edit-user-dialog/edit-user-dialog.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { DeleteTaskResultDialogComponent } from './components/dialogs/delete-task-result-dialog/delete-task-result-dialog.component';
import { EditApplicationFormItemDataDialogComponent } from './components/dialogs/edit-application-form-item-data-dialog/edit-application-form-item-data-dialog.component';
import { CreateServiceDialogComponent } from './components/dialogs/create-service-dialog/create-service-dialog.component';
import { UsersListComponent } from './components/users-list/users-list.component';
import { CreateSponsoredMemberDialogComponent } from './components/dialogs/create-sponsored-member-dialog/create-sponsored-member-dialog.component';
import { GenerateSponsoredMembersDialogComponent } from './components/dialogs/generate-sponsored-members-dialog/generate-sponsored-members-dialog.component';
import { SponsoredMembersListComponent } from './components/sponsored-members-list/sponsored-members-list.component';
import { EditMemberSponsorsDialogComponent } from './components/dialogs/edit-member-sponsors-dialog/edit-member-sponsors-dialog.component';
import { CreateAttributeDialogComponent } from './components/dialogs/create-attribute-dialog/create-attribute-dialog.component';
import { AttributeFriendlyNamePipe } from './pipes/attribute-friendly-name.pipe';
import { PasswordResetRequestDialogComponent } from './components/dialogs/password-reset-request-dialog/password-reset-request-dialog.component';
import { NewVersionDialogComponent } from './components/dialogs/new-version-dialog/new-version-dialog.component';
import { SponsorExistingMemberDialogComponent } from './components/dialogs/sponsor-existing-member-dialog/sponsor-existing-member-dialog.component';
import { DeleteServiceFromFacilityComponent } from './components/dialogs/delete-service-from-facility/delete-service-from-facility.component';
import { DeleteTaskDialogComponent } from './components/dialogs/delete-task-dialog/delete-task-dialog.component';
import { RemoveExtSourceDialogComponent } from './components/dialogs/remove-ext-source-dialog/remove-ext-source-dialog.component';
import { AddOwnerDialogComponent } from './components/add-owner-dialog/add-owner-dialog.component';
import { DeleteOwnerDialogComponent } from './components/delete-owner-dialog/delete-owner-dialog.component';
import { StatisticsCardComponent } from './components/statistics-card/statistics-card.component';
import { ApplicationFormItemDisabledPipe } from './pipes/application-form-item-disabled.pipe';
import { ApplicationFormItemHiddenPipe } from './pipes/application-form-item-hidden.pipe';
import { DeleteEntityDialogComponent } from './components/dialogs/delete-entity-dialog/delete-entity-dialog.component';
import { MatListModule } from '@angular/material/list';
import { EditApplicationFormItemLineComponent } from './components/dialogs/edit-application-form-item-dialog/edit-application-form-item-line/edit-application-form-item-line.component';
import { AddGroupToRegistrationComponent } from './components/dialogs/add-group-to-registration/add-group-to-registration.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
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
    NgxMatSelectSearchModule,
    MatListModule
  ],
  exports: [
    NgxMatSelectSearchModule,
    PerunNavComponent,
    MatAutocompleteModule,
    MatInputModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    SideMenuComponent,
    MatSidenavModule,
    TranslateModule,
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
    MatCardModule,
    MatStepperModule,
    SettingsToggleItemComponent,
    MatRippleModule,
    ApplicationStatePipe,
    MatPaginatorModule,
    NotificatorComponent,
    AttributeTypeCleanPipe,
    NameSpaceToDefPipe,
    ApplicationFormItemTypePipe,
    DragDropModule,
    ApplicationFormWidgetDescriptionPipe,
    RemoveManagerDialogComponent,
    AddManagerDialogComponent,
    AddGroupManagerDialogComponent,
    RemoveGroupManagerDialogComponent,
    AnyToStringPipe,
    AddMemberDialogComponent,
    MembersCandidatesListComponent,
    UserVoPipe,
    MatChipsModule,
    MatChipsModule,
    MatExpansionModule,
    MatMenuModule,
    ScrollingModule,
    ManagersPageComponent,
    ScrollingModule,
    DisplayedRolePipe,
    ScrollingModule,
    AnimatedRouterOutletComponent,
    ResourcesTagsListComponent,
    CreateResourceDialogComponent,
    ExtSourcesListComponent,
    ExtSourceTypePipe,
    ConfigTableConfigModule,
    SideMenuRootItemComponent,
    DestinationListComponent,
    TwoEntityAttributePageComponent,
    HostsListComponent,
    BlacklistListComponent,
    SecurityTeamsListComponent,
    ServicesListComponent,
    AttrDefListComponent,
    TransformMemberStatusPipe,
    MemberStatusTooltipPipe,
    UserLoginsPipe,
    UserEmailPipe,
    UsersListComponent,
    SponsoredMembersListComponent,
    EditMemberSponsorsDialogComponent,
    CreateAttributeDialogComponent,
    AttributeFriendlyNamePipe,
    StatisticsCardComponent
  ],
  declarations: [
    PerunNavComponent,
    SideMenuComponent,
    SideMenuItemComponent,
    CreateGroupDialogComponent,
    InviteMemberDialogComponent,
    DeleteGroupDialogComponent,
    SettingsToggleItemComponent,
    ApplicationStatePipe,
    NotificatorComponent,
    AttributeTypeCleanPipe,
    NameSpaceToDefPipe,
    ApplicationReSendNotificationDialogComponent,
    ApplicationRejectDialogComponent,
    RemoveMembersDialogComponent,
    DebuggerPageComponent,
    RemoveResourceDialogComponent,
    AddManagerDialogComponent,
    RemoveManagerDialogComponent,
    AddGroupManagerDialogComponent,
    RemoveGroupManagerDialogComponent,
    ApplicationFormItemTypePipe,
    UpdateApplicationFormDialogComponent,
    DeleteApplicationFormItemDialogComponent,
    ApplicationFormCopyItemsDialogComponent,
    AddApplicationFormItemDialogComponent,
    EditApplicationFormItemDialogComponent,
    ApplicationFormWidgetDescriptionPipe,
    SideMenuRootItemComponent,
    AnyToStringPipe,
    DeleteAttributeDialogComponent,
    AddMemberDialogComponent,
    MembersCandidatesListComponent,
    UserVoPipe,
    CreateResourceTagDialogComponent,
    DeleteResourceTagDialogComponent,
    MoveGroupDialogComponent,
    DeleteNotificationDialogComponent,
    EditEmailFooterDialogComponent,
    AddEditNotificationDialogComponent,
    TagSectionComponent,
    TagBarComponent,
    NotificationsCopyMailsDialogComponent,
    ManagersPageComponent,
    DisplayedRolePipe,
    AnimatedRouterOutletComponent,
    UserEmailPipe,
    ResourcesTagsListComponent,
    DeleteAttributeDefinitionDialogComponent,
    CreateAttributeDefinitionDialogComponent,
    EditAttributeDefinitionDialogComponent,
    EntitylessAttributeKeysListComponent,
    ServicesListComponent,
    RemoveVoDialogComponent,
    CreateVoDialogComponent,
    ShowNotificationHistoryDialogComponent,
    CreateRelationDialogComponent,
    RemoveRelationDialogComponent,
    RemoveGroupFromResourceDialogComponent,
    AssignGroupToResourceDialogComponent,
    CreateResourceDialogComponent,
    ExtSourcesListComponent,
    AddExtSourceDialogComponent,
    ExtSourceTypePipe,
    RemoveDestinationDialogComponent,
    DestinationListComponent,
    AddServicesDestinationDialogComponent,
    AddGroupResourceDialogComponent,
    RemoveGroupResourceDialogComponent,
    TwoEntityAttributePageComponent,
    UserLoginsPipe,
    AttributeImportDialogComponent,
    HostsListComponent,
    BlacklistListComponent,
    SecurityTeamsListComponent,
    AddUserExtSourceDialogComponent,
    AddHostDialogComponent,
    RemoveHostDialogComponent,
    AddFacilityOwnerDialogComponent,
    RemoveFacilityOwnerDialogComponent,
    NotFoundPageComponent,
    CreateEditServiceDialogComponent,
    DeleteServiceDialogComponent,
    AddMemberToResourceDialogComponent,
    CreateFacilityDialogComponent,
    DeleteFacilityDialogComponent,
    IdentityDetailComponent,
    AssignServiceToResourceDialogComponent,
    RemoveServiceFromResourceDialogComponent,
    AddMemberGroupDialogComponent,
    RemoveMemberGroupDialogComponent,
    AddRequiredAttributesDialogComponent,
    RemoveRequiredAttributesDialogComponent,
    AttrDefListComponent,
    TransformMemberStatusPipe,
    IdentityDetailComponent,
    ConnectIdentity,
    DisconnectIdentity,
    EditUserDialogComponent,
    DeleteTaskResultDialogComponent,
    EditApplicationFormItemDataDialogComponent,
    CreateServiceDialogComponent,
    UsersListComponent,
    EditUserDialogComponent,
    CreateSponsoredMemberDialogComponent,
    GenerateSponsoredMembersDialogComponent,
    SponsoredMembersListComponent,
    EditMemberSponsorsDialogComponent,
    CreateAttributeDialogComponent,
    AttributeFriendlyNamePipe,
    PasswordResetRequestDialogComponent,
    NewVersionDialogComponent,
    SponsorExistingMemberDialogComponent,
    DeleteServiceFromFacilityComponent,
    RemoveExtSourceDialogComponent,
    DeleteTaskDialogComponent,
    AddOwnerDialogComponent,
    DeleteOwnerDialogComponent,
    StatisticsCardComponent,
    ApplicationFormItemDisabledPipe,
    ApplicationFormItemHiddenPipe,
    DeleteEntityDialogComponent,
    EditApplicationFormItemLineComponent,
    AddGroupToRegistrationComponent
  ],
  providers: [
    AnyToStringPipe,
    ExtSourceTypePipe
  ]
})
export class SharedModule {
  constructor(private translate: TranslateService) {
    translate.addLangs(['en', 'cs']);
  }
}
