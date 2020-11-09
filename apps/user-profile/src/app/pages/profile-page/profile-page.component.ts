import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
import { MatDialog } from '@angular/material/dialog';
import { ChangeEmailDialogComponent } from '../../components/dialogs/change-email-dialog/change-email-dialog.component';
import {
  Attribute,
  AttributesManagerService,
  AuthzResolverService,
  UsersManagerService
} from '@perun-web-apps/perun/openapi';
import { UserFullNamePipe } from '@perun-web-apps/perun/pipes';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {

  currentLang = 'en';
  languages = ['en', 'cz'];
  timeZones = moment.tz.names().filter(name => !name.startsWith('Etc/'));

  successMessage: string;

  userId: number;
  loading: boolean;

  constructor(
    private translateService: TranslateService,
    private dialog: MatDialog,
    private authzResolverService: AuthzResolverService,
    private attributesManagerService: AttributesManagerService,
    private usersManagerService: UsersManagerService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private notificator: NotificatorService,
    private storeService:StoreService
  ) {
    translate.get('PROFILE_PAGE.MAIL_CHANGE_SUCCESS').subscribe(res => this.successMessage = res);
  }

  languageAttribute: Attribute;
  timezoneAttribute: Attribute;

  email = '';
  fullName = '';
  organization = '';
  currentTimezone = '';

  additionalAttributes: Attribute[] = []

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const i = params.get('i');
    const m = params.get('m');
    const u = params.get('u');
    this.loading = true;
    if (i && m && u) {
      this.usersManagerService.validatePreferredEmailChange(i, m, Number.parseInt(u, 10)).subscribe(() => {
        this.notificator.showSuccess(this.successMessage);
        this.router.navigate([], { replaceUrl: true });
        this.getData();
      });
    } else {
      this.getData();
    }
  }

  getData() {
    this.authzResolverService.getPerunPrincipal().subscribe(principal => {
      this.userId = principal.userId;

      this.usersManagerService.getRichUserWithAttributes(this.userId).subscribe(richUser => {
        this.fullName = new UserFullNamePipe().transform(richUser);

        const organizationAttribute = richUser.userAttributes.find(att => att.friendlyName === 'organization');
        if (!organizationAttribute) {
            this.organization = '-';
        } else {
          // @ts-ignore
          this.organization = organizationAttribute.value;
        }


        const emailAttribute = richUser.userAttributes.find(att => att.friendlyName === 'preferredMail');
        // @ts-ignore
        this.email = emailAttribute.value;

        this.languageAttribute = richUser.userAttributes.find(att => att.friendlyName === 'preferredLanguage');
        // @ts-ignore
        this.currentLang = this.languageAttribute && this.languageAttribute.value ? this.languageAttribute.value : 'en';

        this.timezoneAttribute = richUser.userAttributes.find(att => att.friendlyName === 'timezone');
        // @ts-ignore
        this.currentTimezone = this.timezoneAttribute && this.timezoneAttribute.value ? this.timezoneAttribute.value : '-';

        const friendlyNames = this.storeService.get('profile_additional_attributes');
        friendlyNames.forEach(friendlyName => {
          const attribute = richUser.userAttributes.find(att => att.friendlyName === friendlyName)
          if(attribute){
            this.additionalAttributes.push(attribute);
          }
        })
        this.loading = false;
      });
    });
  }

  changeLanguage(lang: string) {
    this.currentLang = lang;
    this.translateService.use(this.currentLang);

    if (!this.languageAttribute) {
      this.attributesManagerService.getAttributeDefinitionByName('urn:perun:user:attribute-def:def:preferredLanguage').subscribe(att => {
        this.languageAttribute = att as Attribute;
        this.setLanguage();
      });
    } else {
      this.setLanguage();
    }
  }

  setLanguage() {
    // @ts-ignore
    this.languageAttribute.value = this.currentLang;
    this.attributesManagerService.setUserAttribute({
      user: this.userId,
      attribute: this.languageAttribute
    }).subscribe(() => {
      // this.notificator.showSuccess("done");
    });
  }

  changeTimeZone(tz: string) {
    this.currentTimezone = tz;

    if (!this.timezoneAttribute) {
      this.attributesManagerService.getAttributeDefinitionByName('urn:perun:user:attribute-def:def:timezone').subscribe(att => {
        this.timezoneAttribute = att as Attribute;
        this.setTimeZone();
      });
    } else {
      this.setTimeZone();
    }
  }

  setTimeZone() {
    // @ts-ignore
    this.timezoneAttribute.value = this.currentTimezone;
    this.attributesManagerService.setUserAttribute({
      user: this.userId,
      attribute: this.timezoneAttribute
    }).subscribe(() => {
      // this.notificator.showSuccess("done");
    });
  }

  changeEmail() {
    const config = getDefaultDialogConfig();
    config.width = '350px';
    config.data = { userId: this.userId };

    const dialogRef = this.dialog.open(ChangeEmailDialogComponent, config);

    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.getEmail();
      }
    });
  }

  getEmail() {
    this.attributesManagerService.getUserAttributeByName(this.userId, 'urn:perun:user:attribute-def:def:preferredMail').subscribe(attribute => {
      // @ts-ignore
      this.email = attribute.value;
    });
  }
}
