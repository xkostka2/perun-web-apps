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
import { MfaService } from '../../../services/mfa.service';
import { AddTokenInfoDialogComponent } from '../../../components/add-token-info-dialog/add-token-info-dialog.component';

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

  displayedColumns: string[] = ['type', 'nickname', 'added'];
  dataSource: MatTableDataSource<MFAToken>;
  @ViewChild('toggle')
  toggle: MatSlideToggle;
  pageSize = 5;
  exporting = false;
  mfaAtt: Attribute;
  accessToken: string;
  idToken: string;

  constructor(private dialog: MatDialog,
              private attributesManagerService: AttributesManagerService,
              private store: StoreService,
              private translate: TranslateService,
              private authService: AuthService,
              private mfaService: MfaService) {
    translate.get('AUTHENTICATION.DELETE_IMG_DIALOG_TITLE').subscribe(res => this.removeDialogTitle = res);
    translate.get('AUTHENTICATION.DELETE_IMG_DIALOG_DESC').subscribe(res => this.removeDialogDescription = res);
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {
    this.authService.manager.getUser().then(user => {
      this.accessToken = user.access_token;
      this.idToken = user.id_token;
    });
    this.translate.onLangChange.subscribe(() => {
      this.translate.get('AUTHENTICATION.DELETE_IMG_DIALOG_TITLE').subscribe(res => this.removeDialogTitle = res);
      this.translate.get('AUTHENTICATION.DELETE_IMG_DIALOG_DESC').subscribe(res => this.removeDialogDescription = res);
    });

    this.loadMFA();
    this.loadImage();
  }

  onAddImg() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { theme: 'user-theme', attribute: this.imgAtt };

    const dialogRef = this.dialog.open(AddAuthImgDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadImage();
      }
    });
  }

  // private transformTextToImg(text: string) {
  //   const canvas = document.createElement('canvas');
  //   const context = canvas.getContext('2d');
  //   context.font = "100px Calibri";
  //   context.fillText(text, 1, 70);
  //   return canvas.toDataURL('image/png');
  // }

  reAuthenticate() {
    sessionStorage.setItem('mfa_route', '/profile/settings/auth');
    this.authService.manager = new UserManager(this.getClientSettings());
    this.authService.manager.signinRedirect();
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
    const imgAttributeName = this.store.get('mfa', 'security_image_attribute')
    this.attributesManagerService.getUserAttributeByName(this.store.getPerunPrincipal().userId, imgAttributeName).subscribe(attr => {
      if (!attr) {
        this.attributesManagerService.getAttributeDefinitionByName(imgAttributeName).subscribe(att => {
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
      extraQueryParams: { 'max_age': 0, 'acr_values': 'https://refeds.org/profile/mfa'}
    };
  }

  addTOTP() {
    const config = getDefaultDialogConfig();
    config.width = '600px';

    this.dialog.open(AddTokenInfoDialogComponent, config);
  }

  addWebAuthn() {
    window.open('https://id.muni.cz/simplesaml/module.php/muni/register-webauthn.php', '_blank');
  }

    private loadMFA() {
      const enforceMfaAttributeName = this.store.get('mfa', 'enforce_mfa_attribute')
      const tokensAttributeName = this.store.get('mfa', 'tokens_attribute')
      this.attributesManagerService.getUserAttributeByName(this.store.getPerunPrincipal().userId, enforceMfaAttributeName).subscribe(attr => {
      if (sessionStorage.getItem('mfa_route')) {
        sessionStorage.removeItem('mfa_route');
        this.mfaService.enableMfa(!attr || !attr.value, this.idToken).subscribe(() => {
          // Should I do here something else than loadMFA()?
          this.loadMFA();
        }, () => this.loadMFA());
      } else {
        if (!attr) {
          this.attributesManagerService.getAttributeDefinitionByName(enforceMfaAttributeName).subscribe(att => {
            this.mfaAtt = att as Attribute;
          });
        } else {
          this.mfaAtt = attr;

          if (this.toggle) {
            if (this.mfaAtt.value) {
              this.toggle.toggle();
            }

            this.toggle.change.subscribe(() => {
              this.reAuthenticate();
            });
          }

          this.attributesManagerService.getUserAttributeByName(this.store.getPerunPrincipal().userId, tokensAttributeName).subscribe(mfaTokenAttr => {
            if (!mfaTokenAttr) {
              this.attributesManagerService.getAttributeDefinitionByName(tokensAttributeName).subscribe(att => {
                mfaTokenAttr = att as Attribute;
              });
            } else {
              if (mfaTokenAttr.value) {
                const tokenStrings = mfaTokenAttr.value as string[];
                tokenStrings.forEach(token => {
                  const parsedToken = JSON.parse(token);
                  this.tokens.push({
                    added: parsedToken['added'],
                    revoked: parsedToken['revoked'],
                    data: parsedToken['data'],
                    used: parsedToken['used'],
                    type: parsedToken['type'].toUpperCase(),
                    nickname: parsedToken['name']
                  });
                });
              }
            }
            this.dataSource = new MatTableDataSource<MFAToken>(this.tokens);
          });
        }
      }
    });
  }
}

export interface MFAToken {
  type: string;
  revoked: boolean;
  nickname: string;
  added: string | Date;
  used: string | Date;
  data: any;
}
