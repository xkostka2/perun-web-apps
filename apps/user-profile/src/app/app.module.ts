import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, forwardRef, NgModule, Provider } from '@angular/core';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { IdentitiesPageComponent } from './pages/identities-page/identities-page.component';
import { GroupsPageComponent } from './pages/groups-page/groups-page.component';
import { VosPageComponent } from './pages/vos-page/vos-page.component';
import { ServicesPageComponent } from './pages/services-page/services-page.component';
import { SettingsPageComponent } from './pages/settings-page/settings-page.component';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Configuration, ConfigurationParameters } from '@perun-web-apps/perun/openapi';
import { SettingsOverviewComponent } from './pages/settings-page/settings-overview/settings-overview.component';
import { SettingsSSHKeysComponent } from './pages/settings-page/settings-ssh-keys/settings-ssh-keys.component';
import { SettingsPreferredUnixGroupNamesComponent } from './pages/settings-page/settings-preferred-unix-group-names/settings-preferred-unix-group-names.component';
import { SettingsPreferredShellsComponent } from './pages/settings-page/settings-preferred-shells/settings-preferred-shells.component';
import { SettingsDataQuotasComponent } from './pages/settings-page/settings-data-quotas/settings-data-quotas.component';
import { SettingsAlternativePasswordsComponent } from './pages/settings-page/settings-alternative-passwords/settings-alternative-passwords.component';
import { SettingsSambaPasswordComponent } from './pages/settings-page/settings-samba-password/settings-samba-password.component';
import { SettingsMailingListsComponent } from './pages/settings-page/settings-mailing-lists/settings-mailing-lists.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CustomIconService, StoreService } from '@perun-web-apps/perun/services';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserProfileConfigService } from './services/user-profile-config.service';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PrivacyPageComponent } from './pages/privacy-page/privacy-page.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { PerunSharedComponentsModule } from '@perun-web-apps/perun/components';
import { ChangeEmailDialogComponent } from './components/dialogs/change-email-dialog/change-email-dialog.component';
import { MatTableExporterModule } from 'mat-table-exporter';
import { UiAlertsModule } from '@perun-web-apps/ui/alerts';
import { AddSshDialogComponent } from './components/dialogs/add-ssh-dialog/add-ssh-dialog.component';
import { AddUnixGroupDialogComponent } from './components/dialogs/add-unix-group-dialog/add-unix-group-dialog.component';
import { RemoveStringValueDialogComponent } from './components/dialogs/remove-string-value-dialog/remove-string-value-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { ShowGeneratedPasswordDialogComponent } from './components/dialogs/show-generated-password-dialog/show-generated-password-dialog.component';
import { StringListComponent } from './components/string-list/string-list.component';
import { RemoveAltPasswordDialogComponent } from './components/dialogs/remove-alt-password-dialog/remove-alt-password-dialog.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { RequestChangeDataQuotaDialogComponent } from './components/dialogs/request-change-data-quota-dialog/request-change-data-quota-dialog.component';
import { PerunPipesModule, UserFullNamePipe } from '@perun-web-apps/perun/pipes';
import { MembershipListComponent } from './components/membership-list/membership-list.component';
import { ValidateExpirationPipe } from './pipes/validate-expiration.pipe';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatRippleModule } from '@angular/material/core';
import { ShowSshDialogComponent } from './components/dialogs/show-ssh-dialog/show-ssh-dialog.component';
import { ApiInterceptor } from '@perun-web-apps/perun/services';
import { NotificatorComponent } from './components/notificator/notificator.component';
import { PERUN_API_SERVICE } from '@perun-web-apps/perun/tokens';
import { ApiService } from '@perun-web-apps/perun/services';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';

export const API_INTERCEPTOR_PROVIDER: Provider = {
  provide: HTTP_INTERCEPTORS,
  useExisting: forwardRef(() => ApiInterceptor),
  multi: true
};

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function apiConfigFactory(store: StoreService): Configuration {
  const params: ConfigurationParameters = {
    basePath: store.get('api_url')
  };
  return new Configuration(params);
}

const loadConfigs = (appConfig: UserProfileConfigService) => {
  return () => {
    return appConfig.loadConfigs();
  };
};

@NgModule({
  declarations: [
    AppComponent,
    ProfilePageComponent,
    IdentitiesPageComponent,
    GroupsPageComponent,
    VosPageComponent,
    ServicesPageComponent,
    SettingsPageComponent,
    SettingsOverviewComponent,
    SettingsSSHKeysComponent,
    SettingsPreferredUnixGroupNamesComponent,
    SettingsPreferredShellsComponent,
    SettingsDataQuotasComponent,
    SettingsAlternativePasswordsComponent,
    SettingsSambaPasswordComponent,
    SettingsMailingListsComponent,
    SideMenuComponent,
    HeaderComponent,
    FooterComponent,
    PrivacyPageComponent,
    HomePageComponent,
    ChangeEmailDialogComponent,
    AddSshDialogComponent,
    AddUnixGroupDialogComponent,
    RemoveStringValueDialogComponent,
    ShowGeneratedPasswordDialogComponent,
    StringListComponent,
    RemoveAltPasswordDialogComponent,
    RequestChangeDataQuotaDialogComponent,
    MembershipListComponent,
    ValidateExpirationPipe,
    ShowSshDialogComponent,
    NotificatorComponent,
    BreadcrumbsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    AppRoutingModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
    MatButtonModule,
    FlexLayoutModule,
    MatToolbarModule,
    PerunSharedComponentsModule,
    MatTableExporterModule,
    UiAlertsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatTableModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatCardModule,
    ClipboardModule,
    PerunPipesModule,
    MatAutocompleteModule,
    MatRippleModule,
    MatTooltipModule
  ],
  providers: [
    CustomIconService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfigs,
      multi: true,
      deps: [UserProfileConfigService]
    },
    {
      provide: Configuration,
      useFactory: apiConfigFactory,
      deps:[StoreService]
    },
    UserFullNamePipe,
    ApiInterceptor,
    API_INTERCEPTOR_PROVIDER,
    {
      provide: PERUN_API_SERVICE,
      useClass: ApiService
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    private customIconService: CustomIconService,
    private translate: TranslateService
  ) {
    this.translate.setDefaultLang('en');
    this.translate.use('en');
    this.customIconService.registerPerunRefreshIcon();
  }
}
