import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { AddAuthImgDialogComponent } from '../../../components/dialogs/add-auth-img-dialog/add-auth-img-dialog.component';
import { Attribute, AttributesManagerService } from '@perun-web-apps/perun/openapi';
import { AuthService, StoreService } from '@perun-web-apps/perun/services';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { RemoveStringValueDialogComponent } from '../../../components/dialogs/remove-string-value-dialog/remove-string-value-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { UserManager, UserManagerSettings } from 'oidc-client';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'perun-web-apps-settings-authentication',
  templateUrl: './settings-authentication.component.html',
  styleUrls: ['./settings-authentication.component.scss']
})
export class SettingsAuthenticationComponent implements OnInit {

  removeDialogTitle: string;

  imgAtt: Attribute;
  imageSrc = '';
  tokens: MFAToken[] = [];
  removeDialogDescription: string;

  constructor(private dialog: MatDialog,
              private attributesManagerService: AttributesManagerService,
              private store: StoreService,
              private translate: TranslateService,
              private authService: AuthService) {
    translate.get('AUTHENTICATION.DELETE_IMG_DIALOG_TITLE').subscribe(res => this.removeDialogTitle = res);
    translate.get('AUTHENTICATION.DELETE_IMG_DIALOG_DESC').subscribe(res => this.removeDialogDescription = res);
  }

  displayedColumns: string[] = ['type', 'nickname', 'revoked', 'added', 'used'];
  dataSource: MatTableDataSource<string>;
  pageSize = 5;
  exporting = false;
  mfaAtt: Attribute;
  accessToken: string;
  idToken: string;

  @ViewChild('toggle', { static: true })
  toggle: MatSlideToggle;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {
    this.authService.manager.getUser().then(user => {
      this.accessToken = user.access_token;
      this.idToken = user.id_token;
    });
    this.loadMFA();
    this.loadImage();
  }

  private loadMFA() {
    this.attributesManagerService.getUserAttributeByName(this.store.getPerunPrincipal().userId, 'urn:perun:user:attribute-def:def:mfaEnabled').subscribe(attr => {
      if (!attr) {
        this.attributesManagerService.getAttributeDefinitionByName('urn:perun:user:attribute-def:def:mfaEnabled').subscribe(att => {
          this.mfaAtt = att as Attribute;
        });
      } else {
        this.mfaAtt = attr;
        if(this.mfaAtt.value){
          this.toggle.toggle();
        }
        // Make sure that it won't cause any problems if it is here
        this.toggle.change.subscribe(() => {
          if (this.toggle.checked) {
            this.reAuthenticate();
            // Set MFA on
          } else {
            // MFA is off
          }
        });

        this.attributesManagerService.getUserAttributeByName(this.store.getPerunPrincipal().userId, 'urn:perun:user:attribute-def:def:mfaTokens').subscribe(attr => {
          if (!attr) {
            this.attributesManagerService.getAttributeDefinitionByName('urn:perun:user:attribute-def:def:mfaTokens').subscribe(att => {
              attr = att as Attribute;
            });
          } else {
            if(attr.value){
              this.tokens = attr.value as MFAToken[];
            }
          }
        });
      }
    });
  }

  onAddImg() {
    const config = getDefaultDialogConfig();
    config.width = '550px';
    config.data = { theme: 'user-theme', attribute: this.imgAtt };

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
    this.attributesManagerService.getUserAttributeByName(this.store.getPerunPrincipal().userId, 'urn:perun:user:attribute-def:def:antiphishingImage').subscribe(attr => {
      if (!attr) {
        this.attributesManagerService.getAttributeDefinitionByName('urn:perun:user:attribute-def:def:antiphishingImage').subscribe(att => {
          this.imgAtt = att as Attribute;
        });
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
      extraQueryParams: { 'max_age': 0 }
      // max_age: 0
    };
  }

  reAuthenticate() {
    this.authService.manager = new UserManager(this.getClientSettings());
    this.authService.manager.signinRedirect();
  }
}

export interface MFAToken {
  type: string;
  revoked: boolean;
  added: string | Date;
  used: string | Date;
  secret: string;
}
