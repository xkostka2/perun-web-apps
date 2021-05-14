import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, forwardRef, NgModule, Provider } from '@angular/core';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ApiInterceptor, ApiService, CustomIconService, StoreService } from '@perun-web-apps/perun/services';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ApiModule, Configuration, ConfigurationParameters } from '@perun-web-apps/perun/openapi';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { PublicationsConfigService } from './services/publications-config.service';
import { PERUN_API_SERVICE } from '@perun-web-apps/perun/tokens';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GeneralModule } from '@perun-web-apps/general';
import { UiMaterialModule } from '@perun-web-apps/ui/material';
import { AppRoutingModule } from './app-routing.module';
import { AllPublicationsPageComponent } from './pages/all-publications-page/all-publications-page.component';
import { MyPublicationsPageComponent } from './pages/my-publications-page/my-publications-page.component';
import { CreatePublicationPageComponent } from './pages/create-publication-page/create-publication-page.component';
import { AuthorsPageComponent } from './pages/authors-page/authors-page.component';
import { CategoriesPageComponent } from './pages/categories-page/categories-page.component';
import { PublicationSystemsPageComponent } from './pages/publication-systems-page/publication-systems-page.component';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { HeaderComponent } from './components/header/header.component';
import { CategoriesListComponent } from './components/categories-list/categories-list.component';
import { AddCategoryDialogComponent } from './dialogs/add-category-dialog/add-category-dialog.component';
import { RemoveCategoryDialogComponent } from './dialogs/remove-category-dialog/remove-category-dialog.component';
import { UiAlertsModule } from '@perun-web-apps/ui/alerts';
import { PublicationSystemsListComponent } from './components/publication-systems-list/publication-systems-list.component';
import { UpdateRankDialogComponent } from './dialogs/update-rank-dialog/update-rank-dialog.component';
import { AuthorsListComponent } from './components/authors-list/authors-list.component';
import { PerunPipesModule } from '@perun-web-apps/perun/pipes';
import { AuthorDetailComponent } from './pages/author-detail/author-detail.component';
import { PublicationsListComponent } from './components/publications-list/publications-list.component';
import { ShowCiteDialogComponent } from './dialogs/show-cite-dialog/show-cite-dialog.component';
import { RemovePublicationDialogComponent } from './dialogs/remove-publication-dialog/remove-publication-dialog.component';
import { PublicationFilterComponent } from './components/publication-filter/publication-filter.component';
import { MomentDateModule } from '@angular/material-moment-adapter';
import { PublicationDetailComponent } from './pages/publication-detail/publication-detail.component';
import { PublicationDetailListComponent } from './components/publication-detail-list/publication-detail-list.component';
import { ThanksListComponent } from './components/thanks-list/thanks-list.component';
import { PerunLoginModule } from '@perun-web-apps/perun/login';
import { AddThanksDialogComponent } from './dialogs/add-thanks-dialog/add-thanks-dialog.component';

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

const loadConfigs = (appConfig: PublicationsConfigService) => {
  return () => {
    return appConfig.loadConfigs();
  };
};

@NgModule({
  declarations: [
    AppComponent,
    AllPublicationsPageComponent,
    MyPublicationsPageComponent,
    CreatePublicationPageComponent,
    AuthorsPageComponent,
    CategoriesPageComponent,
    PublicationSystemsPageComponent,
    SideMenuComponent,
    HeaderComponent,
    CategoriesListComponent,
    AddCategoryDialogComponent,
    RemoveCategoryDialogComponent,
    PublicationSystemsListComponent,
    UpdateRankDialogComponent,
    AuthorsListComponent,
    AuthorDetailComponent,
    PublicationsListComponent,
    ShowCiteDialogComponent,
    RemovePublicationDialogComponent,
    PublicationFilterComponent,
    PublicationDetailComponent,
    PublicationDetailListComponent,
    ThanksListComponent,
    AddThanksDialogComponent
  ],
  imports: [
    BrowserModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    BrowserAnimationsModule,
    UiMaterialModule,
    GeneralModule,
    ApiModule,
    HttpClientModule,
    AppRoutingModule,
    UiAlertsModule,
    PerunPipesModule,
    PerunLoginModule
  ],
  providers: [
    CustomIconService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfigs,
      multi: true,
      deps: [PublicationsConfigService]
    },
    {
      provide: Configuration,
      useFactory: apiConfigFactory,
      deps:[StoreService]
    },
    ApiInterceptor,
    API_INTERCEPTOR_PROVIDER,
    {
      provide: PERUN_API_SERVICE,
      useClass: ApiService
    },
    MomentDateModule
  ],
  bootstrap: [AppComponent],
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
