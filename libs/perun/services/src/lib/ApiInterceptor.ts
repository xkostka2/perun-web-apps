import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RPCError } from '@perun-web-apps/perun/models';
import { AuthService } from './auth.service';
import { StoreService } from './store.service';
import { NotificatorService } from './notificator.service';
import { ApiRequestConfigurationService } from './api-request-configuration.service';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { SessionExpirationDialogComponent } from '@perun-web-apps/perun/session-expiration';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { InitAuthService } from './init-auth.service';


@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private apiRequestConfiguration: ApiRequestConfigurationService,
    private notificator: NotificatorService,
    private store: StoreService,
    private dialog: MatDialog,
    private initAuthService: InitAuthService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const apiUrl = this.store.get('api_url');
    // check if the request is trying to access localization file, if so
    // disable cache
    if (req.url.indexOf("i18n") !== -1) {
      req = req.clone({
        setHeaders: {
          'Cache-control': 'no-cache, must-revalidate'
        }
      });
    }
    if (apiUrl !== undefined && req.url.toString().indexOf(apiUrl) !== -1 && !this.store.skipOidc() && !this.authService.isLoggedIn()) {
      const config = getDefaultDialogConfig();
      config.width = '450px';

      this.dialog.open(SessionExpirationDialogComponent, config);
    }
    // Apply the headers
    req = req.clone({
      setHeaders: {
        'Authorization': this.authService.getAuthorizationHeaderValue()
      }
    });

    // Also handle errors globally, if not disabled
    const shouldHandleError = this.apiRequestConfiguration.shouldHandleError();

    const shouldReloadPrincipal = req.method === "POST" && !this.store.skipOidc();

    return next.handle(req).pipe(
      tap(x => {
      if (x instanceof HttpResponse && shouldReloadPrincipal) {
        this.initAuthService.loadPrincipal();
      }
      }, err => {
        // Handle this err
        const errRpc = this.formatErrors(err, req);
        if (errRpc === undefined) {
          return throwError(err);
        }
        if (shouldHandleError) {
          this.notificator.showRPCError(errRpc);
        } else {
          return throwError(errRpc);
        }
      })
    );
  }

  private formatErrors(error: any, req: HttpRequest<any>) {
    let rpcError;
    console.error(error);
    if (error.error.errorId) {
      rpcError = error.error;
    } else if (error.errorId) {
      rpcError = JSON.parse(error.error) as RPCError;
    }
    if (rpcError === undefined) {
      return undefined;
    }
    rpcError.call = req.url;
    rpcError.payload = req.body;
    return rpcError;
  }
}
