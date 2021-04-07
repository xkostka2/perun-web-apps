import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, forwardRef, NgModule, Provider } from '@angular/core';

import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ApiInterceptor, ApiService, CustomIconService, StoreService } from '@perun-web-apps/perun/services';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { ApiModule, Configuration, ConfigurationParameters } from '@perun-web-apps/perun/openapi';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GeneralModule } from '@perun-web-apps/general';
import { MatIconModule } from '@angular/material/icon';
import { PasswordResetDialogComponent } from './dialogs/password-reset-dialog/password-reset-dialog.component';
import { AppRoutingModule } from './app-routing.module';
import { PasswordResetConfigService } from './services/password-reset-config.service';
import { PERUN_API_SERVICE } from '@perun-web-apps/perun/tokens';
import { UiMaterialModule } from '@perun-web-apps/ui/material';
import { TokenExpiredDialogComponent } from './dialogs/token-expired-dialog/token-expired-dialog.component';


export const API_INTERCEPTOR_PROVIDER: Provider = {
  provide: HTTP_INTERCEPTORS,
  useExisting: forwardRef(() => ApiInterceptor),
  multi: true
};


export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function apiConfigFactory(store: StoreService): Configuration {
  const params: ConfigurationParameters = {
    basePath: store.get('api_url')
  };
  return new Configuration(params);
}

const loadConfigs = (appConfig: PasswordResetConfigService) => {
  return () => {
    return appConfig.loadConfigs();
  };
};

@NgModule({
  declarations: [AppComponent, PasswordResetDialogComponent, TokenExpiredDialogComponent],
  imports: [
    BrowserModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    BrowserAnimationsModule,
    MatIconModule,
    GeneralModule,
    ApiModule,
    HttpClientModule,
    AppRoutingModule,
    UiMaterialModule
  ],
  providers: [
    CustomIconService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadConfigs,
      multi: true,
      deps: [PasswordResetConfigService]
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
    },],
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
