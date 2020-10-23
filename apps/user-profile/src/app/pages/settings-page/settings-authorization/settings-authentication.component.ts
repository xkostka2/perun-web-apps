import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddAuthImgDialogComponent } from '../../../components/dialogs/add-auth-img-dialog/add-auth-img-dialog.component';
import { Attribute, AttributesManagerService} from '@perun-web-apps/perun/openapi';
import { AuthService, StoreService } from '@perun-web-apps/perun/services';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { RemoveStringValueDialogComponent } from '../../../components/dialogs/remove-string-value-dialog/remove-string-value-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { UserManager, UserManagerSettings } from 'oidc-client';

@Component({
  selector: 'perun-web-apps-settings-authentication',
  templateUrl: './settings-authentication.component.html',
  styleUrls: ['./settings-authentication.component.scss']
})
export class SettingsAuthenticationComponent implements OnInit {

  removeDialogTitle: string;

               imgAtt: Attribute;

  imageSrc = '';
  tokens: AuthToken[] = [];
  removeDialogDescription: string;

  constructor( private dialog: MatDialog,
               private attributesManagerService: AttributesManagerService,
               private store: StoreService,
               private translate: TranslateService,
               private authService: AuthService) {
    translate.get('AUTHENTICATION.DELETE_IMG_DIALOG_TITLE').subscribe(res => this.removeDialogTitle = res);
    translate.get('AUTHENTICATION.DELETE_IMG_DIALOG_DESC').subscribe(res => this.removeDialogDescription = res);
  }

  displayedColumns: string[] = ['type', 'revoked', 'added', 'used', 'secret'];
  dataSource: MatTableDataSource<string>;
  pageSize = 5;
  exporting = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {
    this.loadImage();
  }

  onAddImg() {
    const config = getDefaultDialogConfig();
    config.width = '550px';
    config.data = {theme: 'user-theme', attribute: this.imgAtt};

    const dialogRef = this.dialog.open(AddAuthImgDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadImage();
      }
    });
  }

  onDeleteImg() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = {
      doNotShowValues: true,
      attribute: this.imgAtt,
      userId: this.store.getPerunPrincipal().userId,
      title: this.removeDialogTitle,
      description: this.removeDialogDescription
    };

    const dialogRef = this.dialog.open(RemoveStringValueDialogComponent, config);

    dialogRef.afterClosed().subscribe(sshAdded => {
      if (sshAdded) {
        this.loadImage();
      }
    });
  }

  private loadImage() {
    this.attributesManagerService.getUserAttributeByName(this.store.getPerunPrincipal().userId,'urn:perun:user:attribute-def:opt:auth-img').subscribe(attr => {
      if(!attr){
        this.attributesManagerService.getAttributeDefinitionByName('urn:perun:user:attribute-def:opt:auth-img').subscribe(att => {
          this.imgAtt = att as Attribute;
        })
      } else {
        this.imgAtt = attr;
        this.imageSrc = this.imgAtt.value as unknown as string;
      }
    });
  }

  getClientSettings(): UserManagerSettings {
    return {
      authority: this.store.get('oidc_client', 'oauth_authority'),
      client_id: this.store.get('oidc_client', 'oauth_client_id'),
      redirect_uri: this.store.get('oidc_client', 'oauth_redirect_uri'),
      post_logout_redirect_uri: this.store.get('oidc_client', 'oauth_post_logout_redirect_uri'),
      response_type: this.store.get('oidc_client', 'oauth_response_type'),
      scope: this.store.get('oidc_client', 'oauth_scopes'),
      filterProtocolClaims: true,
      loadUserInfo: this.store.get('oidc_client', 'oauth_load_user_info'),
      automaticSilentRenew: true,
      silent_redirect_uri: this.store.get('oidc_client', 'oauth_silent_redirect_uri'),
      extraQueryParams: {"max_age": 0},
      // max_age: 0
    };
  }

  reAuthenticate() {
    this.authService.manager = new UserManager(this.getClientSettings());
    this.authService.manager.signinRedirect();
  }
}

export interface AuthToken{
  type: string;
  revoked: boolean;
  added: string | Date;
  used: string | Date;
  secret: string;
}
