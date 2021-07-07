import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment-timezone';
import { MatDialog } from '@angular/material/dialog';
import { ChangeEmailDialogComponent } from '@perun-web-apps/perun/dialogs';
import {
  Attribute, AttributeDefinition,
  AttributesManagerService,
  AuthzResolverService,
  UsersManagerService
} from '@perun-web-apps/perun/openapi';
import { UserFullNamePipe } from '@perun-web-apps/perun/pipes';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiRequestConfigurationService, NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { MailChangeFailedDialogComponent } from '@perun-web-apps/perun/dialogs';

interface DisplayedAttribute {
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
  languages = this.storeService.get('supportedLanguages');
  timeZones = moment.tz.names().filter(name => !name.startsWith('Etc/'));

  successMessage: string;

  userId: number;
  loading: boolean;
  additionalAttributes: DisplayedAttribute[] = [];

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
    private storeService: StoreService,
    private apiRequestConfiguration: ApiRequestConfigurationService
  ) {
    translateService.get('PROFILE_PAGE.MAIL_CHANGE_SUCCESS').subscribe(res => this.successMessage = res);
  }

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const token = params.get('token');
    const u = params.get('u');
    this.loading = true;
    if (token && u) {
      this.apiRequestConfiguration.dontHandleErrorForNext();
      this.usersManagerService.validatePreferredEmailChangeWithToken(token, Number.parseInt(u, 10)).subscribe(() => {
        this.notificator.showSuccess(this.successMessage);
        this.router.navigate([], { replaceUrl: true });
        this.getData();
      }, () => {
        const config = getDefaultDialogConfig();
        config.width = '600px';

        const dialogRef = this.dialog.open(MailChangeFailedDialogComponent, config);
        dialogRef.afterClosed().subscribe(() => {
          this.getData();
        });
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
        const langs = this.storeService.get('supportedLanguages');
        let count = 0;
        additionalAttributesSpecs.forEach(spec => {
          const attribute = richUser.userAttributes.find(att => att.friendlyName === spec.friendly_name);
          if (!attribute) {
            this.attributesManagerService.getAttributeDefinitionByName(`urn:perun:user:attribute-def:${spec.is_virtual ? 'virt' : 'def'}:${spec.friendly_name}`).subscribe(att => {
              this.addAttribute(att, spec, langs);
              count++;
              this.loading = count !== additionalAttributesSpecs.length;
            });
          } else {
            count++;
            this.addAttribute(attribute, spec, langs);
          }
          this.loading = count !== additionalAttributesSpecs.length;
        });
      });
    });
  }

  private addAttribute(att: AttributeDefinition, spec: any, langs: string[]) {
    const displayedAttribute = {
      attribute: att
    }
    for (const lang of langs) {
      displayedAttribute[`displayName_${lang}`] = spec[`display_name_${lang}`] && spec[`display_name_${lang}`].length ? spec[`display_name_${lang}`] : att.displayName;
      displayedAttribute[`tooltip_${lang}`] = spec[`tooltip_${lang}`] ?? '';
    }
    this.additionalAttributes.push(<DisplayedAttribute>displayedAttribute);
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
