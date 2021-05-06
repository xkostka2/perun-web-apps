import { Injectable, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UiAlertsModule } from '@perun-web-apps/ui/alerts';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { VosListComponent } from './vos-list/vos-list.component';
import { GroupsListComponent } from './groups-list/groups-list.component';
import { RefreshButtonComponent } from './refresh-button/refresh-button.component';
import { GroupMenuComponent } from './group-menu/group-menu.component';
import { TableOptionsComponent } from './table-options/table-options.component';
import { BackButtonComponent } from './back-button/back-button.component';
import { ImmediateFilterComponent } from './immediate-filter/immediate-filter.component';
import { AttributeValueStringComponent } from './attributes-list/attribute-value/attribute-value-string/attribute-value-string.component';
import { AttributeValueMapComponent } from './attributes-list/attribute-value/attribute-value-map/attribute-value-map.component';
import { AttributeValueListComponent } from './attributes-list/attribute-value/attribute-value-list/attribute-value-list.component';
import { AttributeValueBooleanComponent } from './attributes-list/attribute-value/attribute-value-boolean/attribute-value-boolean.component';
import { AttributeValueComponent } from './attributes-list/attribute-value/attribute-value.component';
import { AttributesListComponent } from './attributes-list/attributes-list.component';
import { MatChipsModule } from '@angular/material/chips';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ResourcesListComponent } from './resources-list/resources-list.component';
import { MenuButtonsFieldComponent } from './menu-buttons-field/menu-buttons-field.component';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatDateFormats, MatOptionModule,
  MatRippleModule,
  NativeDateAdapter
} from '@angular/material/core';
import { PerunPipesModule } from '@perun-web-apps/perun/pipes';
import { AttributeValueIntegerComponent } from './attributes-list/attribute-value/attribute-value-integer/attribute-value-integer.component';
import { NotificationComponent } from './notification/notification.component';
import { AutoFocusDirective } from '@perun-web-apps/perun/directives';
import { UserExtSourcesListComponent } from './user-ext-sources-list/user-ext-sources-list.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { GroupsTreeComponent } from './groups-tree/groups-tree.component';
import { MatTreeModule } from '@angular/material/tree';
import { ServicesStatusListComponent } from './services-status-list/services-status-list.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { ForceRouterLinkDirective } from '@perun-web-apps/perun/directives';
import { RedirectPageComponent } from './redirect-page/redirect-page.component';
import { VoSearchSelectComponent } from './vo-search-select/vo-search-select.component';
import { MatSelectModule } from '@angular/material/select';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MembersListComponent } from './members-list/members-list.component';
import { TaskResultsListComponent } from './task-results-list/task-results-list.component';
import { GroupSearchSelectComponent } from './group-search-select/group-search-select.component';
import { MiddleClickRouterLinkDirective } from '@perun-web-apps/perun/directives';
import { EntitySearchSelectComponent } from './entity-search-select/entity-search-select.component';
import { ResourceSearchSelectComponent } from './resource-search-select/resource-search-select.component';
import { MemberSearchSelectComponent } from './member-search-select/member-search-select.component';
import { FacilitySearchSelectComponent } from './facility-search-select/facility-search-select.component';
import { UserSearchSelectComponent } from './user-search-select/user-search-select.component';
import { ExpirationSelectComponent } from './expiration-select/expiration-select.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { RecentlyViewedIconComponent } from './recently-viewed-icon/recently-viewed-icon.component';
import { FacilitiesListComponent } from './facilities-list/facilities-list.component';
import { DateRangeComponent } from './date-range/date-range.component';
import { ObjectListValuesComponent } from './object-list-values/object-list-values.component';
import { PerunFooterComponent } from './perun-footer/perun-footer.component';
import { ReportIssueDialogComponent } from './report-issue-dialog/report-issue-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CreateGroupFormComponent } from './create-group-form/create-group-form.component';
import { DebounceFilterComponent } from './debounce-filter/debounce-filter.component';
import { MembersDynamicListComponent } from './members-dynamic-list/members-dynamic-list.component';
import { AppFormItemSearchSelectComponent } from './app-form-item-search-select/app-form-item-search-select.component';

@Injectable()
export class AppDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day: string = date.getDate().toString();
      // day = +day < 10 ? '0' + day : day;
      const month: string = (date.getMonth() + 1).toString();
      // month = +month < 10 ? '0' + month : month;
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    }
    return date.toDateString();
  }
}

export const APP_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' }
  },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'numeric' },
    dateA11yLabel: {
      year: 'numeric', month: 'long', day: 'numeric'
    },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};

@NgModule({
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatTableModule,
    FormsModule,
    MatChipsModule,
    DragDropModule,
    TranslateModule,
    RouterModule,
    MatSortModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    UiAlertsModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatRippleModule,
    PerunPipesModule,
    ClipboardModule,
    MatTreeModule,
    MatDatepickerModule,
    MatRadioModule,
    MatOptionModule,
    MatSelectModule,
    NgxMatSelectSearchModule,
    ScrollingModule,
    MatDialogModule
  ],
  declarations: [
    VosListComponent,
    GroupsListComponent,
    TableOptionsComponent,
    GroupMenuComponent,
    RefreshButtonComponent,
    BackButtonComponent,
    ImmediateFilterComponent,
    AttributesListComponent,
    AttributeValueComponent,
    AttributeValueBooleanComponent,
    AttributeValueListComponent,
    AttributeValueMapComponent,
    AttributeValueStringComponent,
    ResourcesListComponent,
    MenuButtonsFieldComponent,
    AttributeValueIntegerComponent,
    NotificationComponent,
    AutoFocusDirective,
    UserExtSourcesListComponent,
    PasswordResetComponent,
    GroupsTreeComponent,
    ServicesStatusListComponent,
    ForceRouterLinkDirective,
    RedirectPageComponent,
    VoSearchSelectComponent,
    MembersListComponent,
    TaskResultsListComponent,
    GroupSearchSelectComponent,
    MiddleClickRouterLinkDirective,
    ResourceSearchSelectComponent,
    MemberSearchSelectComponent,
    FacilitySearchSelectComponent,
    UserSearchSelectComponent,
    ExpirationSelectComponent,
    RecentlyViewedIconComponent,
    FacilitiesListComponent,
    EntitySearchSelectComponent,
    DateRangeComponent,
    ObjectListValuesComponent,
    PerunFooterComponent,
    ReportIssueDialogComponent,
    CreateGroupFormComponent,
    DebounceFilterComponent,
    MembersDynamicListComponent,
    AppFormItemSearchSelectComponent
  ],
  exports: [
    VosListComponent,
    GroupsListComponent,
    TableOptionsComponent,
    GroupMenuComponent,
    RefreshButtonComponent,
    BackButtonComponent,
    ImmediateFilterComponent,
    AttributesListComponent,
    AttributeValueComponent,
    AttributeValueBooleanComponent,
    AttributeValueListComponent,
    AttributeValueMapComponent,
    AttributeValueStringComponent,
    ResourcesListComponent,
    MenuButtonsFieldComponent,
    NotificationComponent,
    AutoFocusDirective,
    UserExtSourcesListComponent,
    PasswordResetComponent,
    GroupsTreeComponent,
    ServicesStatusListComponent,
    ForceRouterLinkDirective,
    RedirectPageComponent,
    VoSearchSelectComponent,
    MembersListComponent,
    TaskResultsListComponent,
    GroupSearchSelectComponent,
    MiddleClickRouterLinkDirective,
    ResourceSearchSelectComponent,
    MemberSearchSelectComponent,
    FacilitySearchSelectComponent,
    UserSearchSelectComponent,
    ExpirationSelectComponent,
    RecentlyViewedIconComponent,
    FacilitiesListComponent,
    EntitySearchSelectComponent,
    DateRangeComponent,
    PerunFooterComponent,
    ReportIssueDialogComponent,
    CreateGroupFormComponent,
    DebounceFilterComponent,
    MembersDynamicListComponent,
    AppFormItemSearchSelectComponent,
  ],
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS }
  ]
})
export class PerunSharedComponentsModule {
}
