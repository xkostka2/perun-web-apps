import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
import { MatDialog } from '@angular/material/dialog';
import { ChangeEmailDialogComponent } from '@perun-web-apps/perun/dialogs';
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

interface AdditionalAttribute {
  attribute: Attribute;
  displayName_en: string;
  displayName_cz: string;
  tooltip_en: string;
  tooltip_cz: string;
}

@Component({
  selector: 'perun-web-apps-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {

  currentLang = 'en';
  languages = ['en', 'cs'];
  timeZones = moment.tz.names().filter(name => !name.startsWith('Etc/'));

  successMessage: string;

  userId: number;
  loading: boolean;
  additionalAttributes: AdditionalAttribute[] = [];

  languageAttribute: Attribute;
  timezoneAttribute: Attribute;

  email = '';
  fullName = '';
  organization = '';
  currentTimezone = '';

  constructor(
    public translateService: TranslateService,
    private dialog: MatDialog,
    private authzResolverService: AuthzResolverService,
    private attributesManagerService: AttributesManagerService,
    private usersManagerService: UsersManagerService,
    private route: ActivatedRoute,
    private router: Router,
    private notificator: NotificatorService,
    private storeService: StoreService
  ) {
    translateService.get('PROFILE_PAGE.MAIL_CHANGE_SUCCESS').subscribe(res => this.successMessage = res);
  }

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const token = params.get('token');
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
    } else if (token && u) {
      this.usersManagerService.validatePreferredEmailChangeWithToken(token, Number.parseInt(u, 10)).subscribe(() => {
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

        const emailAttribute = richUser.userAttributes.find(att => att.friendlyName === 'preferredMail');
        // @ts-ignore
        this.email = emailAttribute.value;

        this.languageAttribute = richUser.userAttributes.find(att => att.friendlyName === 'preferredLanguage');
        // @ts-ignore
        this.currentLang = this.languageAttribute && this.languageAttribute.value ? this.languageAttribute.value : 'en';

        this.timezoneAttribute = richUser.userAttributes.find(att => att.friendlyName === 'timezone');
        // @ts-ignore
        this.currentTimezone = this.timezoneAttribute && this.timezoneAttribute.value ? this.timezoneAttribute.value : '-';

        const additionalAttributesSpecs = this.storeService.get('profile_page_attributes');
        let count = 0;
        additionalAttributesSpecs.forEach(spec => {
          const attribute = richUser.userAttributes.find(att => att.friendlyName === spec.friendly_name);
          if(!attribute){
            this.attributesManagerService.getAttributeDefinitionByName(`urn:perun:user:attribute-def:${spec.is_virtual ? 'virt' : 'def'}:${spec.friendly_name}`).subscribe(att => {
              this.additionalAttributes.push(<AdditionalAttribute>{
                attribute: att,
                displayName_en: spec.display_name_en && spec.display_name_en.length ? spec.display_name_en : att.displayName,
                displayName_cz: spec.display_name_cz && spec.display_name_cz.length ? spec.display_name_cz : att.displayName,
                tooltip_en: spec.tooltip_en ?? '',
                tooltip_cz: spec.tooltip_cz ?? ''
              });
              count++;
              this.loading = count !==additionalAttributesSpecs.length
            })
          } else {
            count++;
            this.additionalAttributes.push(<AdditionalAttribute>{
              attribute: attribute,
              displayName_en: spec.display_name_en && spec.display_name_en.length ? spec.display_name_en : attribute.displayName,
              displayName_cz: spec.display_name_cz && spec.display_name_cz.length ? spec.display_name_cz : attribute.displayName,
              tooltip_en: spec.tooltip_en ?? '',
              tooltip_cz: spec.tooltip_cz ?? ''
            });
          }
          this.loading = count !==additionalAttributesSpecs.length
        });
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
