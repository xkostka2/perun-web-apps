import { Injectable } from '@angular/core';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { AuthService } from './auth.service';
import { StoreService } from './store.service';
import { AuthResolverService } from './auth-resolver.service';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';

@Injectable({
  providedIn: 'root'
})
export class InitAuthService {

  constructor(
    private authService: AuthService,
    private storeService: StoreService,
    private authResolver: AuthResolverService,
    private authzService: AuthzResolverService
  ) {
  }

  /**
   * Load additional data. First it init authService with necessarily data, then
   * start authentication.
   */
  authenticateUser(): Promise<any> {
    return new Promise((resolve) => {
      this.authService.loadConfigData();

      if (this.storeService.get('skip_oidc')) {
        resolve();
      } else {
        this.authService.authenticate().then(() => {
          resolve();
        });
      }
    });
  }

  /**
   * Load principal
   */
  loadPrincipal(): Promise<any> {
    console.log('Started principal');
    return this.authzService.getPerunPrincipal()
      .toPromise()
      .then(perunPrincipal => {
        this.storeService.setPerunPrincipal(perunPrincipal);
        this.authResolver.init(perunPrincipal);
      });
  }
}
