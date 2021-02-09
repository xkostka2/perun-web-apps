import { Injectable } from '@angular/core';
import { GuiAuthResolver, InitAuthService, StoreService } from '@perun-web-apps/perun/services';
import { AppConfigService } from '@perun-web-apps/config';
import { Location } from '@angular/common';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';

@Injectable({
  providedIn: 'root'
})
export class PublicationsConfigService {

  constructor(
    private initAuthService: InitAuthService,
    private appConfigService: AppConfigService,
    private storeService: StoreService,
    private location: Location,
    private authzSevice: AuthzResolverService,
    private guiAuthResolver: GuiAuthResolver
  ) { }

  loadConfigs(): Promise<void> {
    return this.appConfigService.loadAppDefaultConfig()
      .then(() => this.appConfigService.loadAppInstanceConfig())
      .then(() => this.setApiUrl())
      .then(() => this.initAuthService.authenticateUser())
      .catch(err => {
        console.error(err);
        this.location.go("/");
        location.reload();
        throw err;
      })
      .then(isAuthenticated => {
        // if the authentication is successful, continue
        if (isAuthenticated) {
          return this.initAuthService.loadPrincipal()
            .then(() => this.loadPolicies());
        }
        // if it was not, do nothing because it will do a redirect to oidc server
      });
  }

  private setApiUrl() {
    return new Promise((resolve) => {
      this.authzSevice.configuration.basePath = this.storeService.get('api_url');
      resolve();
    });
  }

  private loadPolicies(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.authzSevice.getAllPolicies().subscribe( policies => {
        this.guiAuthResolver.setPerunPolicies(policies);
        resolve();
      }, error => reject(error));
    });
  }

}
