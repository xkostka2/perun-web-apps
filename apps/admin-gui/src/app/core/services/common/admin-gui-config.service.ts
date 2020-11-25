import { Injectable } from '@angular/core';
import {
  GuiAuthResolver,
  InitAuthService, StoreService
} from '@perun-web-apps/perun/services';
import { AppConfigService, ColorConfig, EntityColorConfig } from '@perun-web-apps/config';
import { AuthzResolverService } from '@perun-web-apps/perun/openapi';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { ServerDownDialogComponent } from '@perun-web-apps/general';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { Title } from '@angular/platform-browser';


@Injectable({
  providedIn: 'root'
})
export class AdminGuiConfigService {

  constructor(
    private initAuthService: InitAuthService,
    private appConfigService: AppConfigService,
    private store: StoreService,
    private authzSevice: AuthzResolverService,
    private dialog: MatDialog,
    private location: Location,
    private translate: TranslateService,
    private guiAuthResolver: GuiAuthResolver,
    private titleService: Title
  ) {}

  entityColorConfigs: EntityColorConfig[] = [
    {
      entity: 'vo',
      configValue: 'vo_color',
      cssVariable: '--vo-color'
    },
    {
      entity: 'group',
      configValue: 'group_color',
      cssVariable: '--group-color'
    },
    {
      entity: 'user',
      configValue: 'user_color',
      cssVariable: '--user-color'
    },
    {
      entity: 'member',
      configValue: 'member_color',
      cssVariable: '--member-color'
    },
    {
      entity: 'facility',
      configValue: 'facility_color',
      cssVariable: '--facility-color'
    },
    {
      entity: 'resource',
      configValue: 'resource_color',
      cssVariable: '--resource-color'
    },
    {
      entity: 'admin',
      configValue: 'admin_color',
      cssVariable: '--admin-color'
    },
    {
      entity: 'service',
      configValue: 'service_color',
      cssVariable: '--service-color'
    }
  ];

  colorConfigs: ColorConfig[] = [
    {
      configValue: 'sidemenu_hover_color',
      cssVariable: '--side-root-item-hover'
    },
    {
      configValue: 'sidemenu_root_active_color',
      cssVariable: '--side-root-item-active'
    },
    {
      configValue: 'sidemenu-link-active',
      cssVariable: '--side-link-active'
    },
    {
      configValue: 'sidemenu-link-hover',
      cssVariable: '--side-link-hover'
    }
  ];

  loadConfigs(): Promise<void> {
    return this.appConfigService.loadAppDefaultConfig()
      .then(() => this.appConfigService.loadAppInstanceConfig())
      .then(() => this.setApiUrl())
      .then(() => this.appConfigService.initializeColors(this.entityColorConfigs, this.colorConfigs))
      .then(() => this.initAuthService.authenticateUser())
      .catch(err => {
        // if there is an error, it means user probably navigated to /api-callback without logging in
        console.error(err);
        this.location.go("/");
        location.reload();
        throw err;
      })
      .then(isAuthenticated => {
        // if the authentication is successful, continue
        if (isAuthenticated) {
          return this.initAuthService.loadPrincipal()
            .catch(err => this.handlePrincipalErr(err))
            .then(() => this.loadPolicies())
            .then(() => this.guiAuthResolver.loadRolesManagementRules());
        }
        // if it was not, do nothing because it will do a redirect to oidc server
      });
  }

  /**
   *  We need to set basePath for authzService before loading principal, otherwise authzService uses its default basePath
   */
  private setApiUrl() {
    return new Promise((resolve) => {
      this.authzSevice.configuration.basePath = this.store.get('api_url');
      this.titleService.setTitle(this.store.get('document_title'));
      resolve();
    });
  }

  private handlePrincipalErr(err: any) {
    const config = getDefaultDialogConfig();
    // FIXME: during initialization phase, it might happen that the translations are not loaded.
    config.data = {
      title: 'GENERAL.PRINCIPAL_ERROR.TITLE',
      message: err.status === 0 ? 'GENERAL.PRINCIPAL_ERROR.MESSAGE' : err.message,
      action: 'GENERAL.PRINCIPAL_ERROR.ACTION',
    };

    this.dialog.open(ServerDownDialogComponent, config);
    console.error(err);
    throw err;
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
