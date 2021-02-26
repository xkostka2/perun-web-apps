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
import { MatIconModule } from '@angular/material/icon';
import { GeneralModule } from '@perun-web-apps/general';
import { UiMaterialModule } from '@perun-web-apps/ui/material';
import { AppRoutingModule } from './app-routing.module';
import { AllPublicationsPageComponent } from './pages/all-publications-page/all-publications-page.component';
import { MyPublicationsPageComponent } from './pages/my-publications-page/my-publications-page.component';
import { CreatePublicationPageComponent } from './pages/create-publication-page/create-publication-page.component';
import { AuthorsPageComponent } from './pages/authors-page/authors-page.component';
import { CategoriesPageComponent } from './pages/categories-page/categories-page.component';
import { PublicationSystemsPageComponent } from './pages/publication-systems-page/publication-systems-page.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SideMenuComponent } from './components/side-menu/side-menu.component';
import { MatListModule } from '@angular/material/list';
import { PerunSharedComponentsModule } from '@perun-web-apps/perun/components';
import { HeaderComponent } from './components/header/header.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

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
  declarations: [AppComponent, AllPublicationsPageComponent, MyPublicationsPageComponent, CreatePublicationPageComponent, AuthorsPageComponent, CategoriesPageComponent, PublicationSystemsPageComponent, SideMenuComponent, HeaderComponent],
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
    MatIconModule,
    GeneralModule,
    ApiModule,
    HttpClientModule,
    AppRoutingModule,
    MatSidenavModule,
    MatListModule,
    PerunSharedComponentsModule,
    MatMenuModule,
    MatToolbarModule
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
