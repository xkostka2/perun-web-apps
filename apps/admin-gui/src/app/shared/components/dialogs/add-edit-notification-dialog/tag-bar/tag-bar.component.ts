import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-tag-bar',
  templateUrl: './tag-bar.component.html',
  styleUrls: ['./tag-bar.component.scss']
})
export class TagBarComponent implements OnInit {

  constructor() { }

  @Output()
  addedTag = new EventEmitter<string>();

  applicationRelatedTags = [];
  userRelatedTags = [];
  validationLinksUsersTags = [];
  applicationLinksUsersTags = [];
  applicationLinksAdministratorsTags = [];
  perunLinksAdministratorsTags = [];
  userInvitationsTags = [];

  ngOnInit() {
    this.getApplicationRelatedTags();
    this.getUserRelatedTags();
    this.getValidationLinksUsersTags();
    this.getApplicationLinksUsersTags();
    this.getApplicationLinksAdministratorsTags();
    this.getPerunLinksAdministratorsTags();
    this.getUserInvitationsTags();
  }

  getApplicationRelatedTags() {
    const tags = [];
    tags.push(['appId', 'APPID_DESCRIPTION']);
    tags.push(['actor', 'ACTOR_DESCRIPTION']);
    tags.push(['extSource', 'EXTSOURCE_DESCRIPTION']);
    tags.push(['voName', 'VONAME_DESCRIPTION']);
    tags.push(['groupName', 'GROUPNAME_DESCRIPTION']);
    tags.push(['mailFooter', 'MAILFOOTER_DESCRIPTION']);
    tags.push(['errors', 'ERRORS_DESCRIPTION']);
    tags.push(['customMessage', 'CUSTOMMESSAGE_DESCRIPTION']);
    this.applicationRelatedTags = tags;
  }

  getUserRelatedTags() {
    const tags = [];
    tags.push(['firstName', 'FIRSTNAME_DESCRIPTION']);
    tags.push(['lastName', 'LASTNAME_DESCRIPTION']);
    tags.push(['displayName', 'DISPLAYNAME_DESCRIPTION']);
    tags.push(['mail', 'MAIL_DESCRIPTION']);
    tags.push(['phone', 'PHONE_DESCRIPTION']);
    tags.push(['login-namespace', 'LOGINNAMESPACE_DESCRIPTION']);
    tags.push(['membershipExpiration', 'MEMBERSHIPEXPIRATION_DESCRIPTION']);
    this.userRelatedTags = tags;
  }

  getValidationLinksUsersTags() {
    const tags = [];
    tags.push(['validationLink', 'VALIDATIONLINK_DESCRIPTION']);
    tags.push(['validationLink-krb', 'VALIDATIONKRB_DESCRIPTION']);
    tags.push(['validationLink-fed', 'VALIDATIONFED_DESCRIPTION']);
    tags.push(['validationLink-cert', 'VALIDATIONCERT_DESCRIPTION']);
    tags.push(['validationLink-non', 'VALIDATIONNON_DESCRIPTION']);
    tags.push(['redirectUrl', 'REDIRECTURL_DESCRIPTION']);
    this.validationLinksUsersTags = tags;
  }

  getApplicationLinksUsersTags() {
    const tags = [];
    tags.push(['appGuiUrl', 'APPGUIURL_DESCRIPTION']);
    tags.push(['appGuiUrl-krb', 'APPGUIURLKRB_DESCRIPTION']);
    tags.push(['appGuiUrl-fed', 'APPGUIURLFED_DESCRIPTION']);
    tags.push(['appGuiUrl-cert', 'APPGUIURLCERT_DESCRIPTION']);
    tags.push(['appGuiUrl-non', 'APPGUIURLNON_DESCRIPTION']);
    this.applicationLinksUsersTags = tags;
  }

  getApplicationLinksAdministratorsTags() {
    const tags = [];
    tags.push(['appDetailUrl', 'APPDETAILURL_DESCRIPTION']);
    tags.push(['appDetailUrl-krb', 'APPDETAILURLKRB_DESCRIPTION']);
    tags.push(['appDetailUrl-fed', 'APPDETAILURLFED_DESCRIPTION']);
    tags.push(['appDetailUrl-cert', 'APPDETAILURLCERT_DESCRIPTION']);
    this.applicationLinksAdministratorsTags = tags;
  }

  getPerunLinksAdministratorsTags() {
    const tags = [];
    tags.push(['perunGuiUrl', 'PERUNGUIURL_DESCRIPTION']);
    tags.push(['perunGuiUrl-krb', 'PERUNGUIURLKRB_DESCRIPTION']);
    tags.push(['perunGuiUrl-fed', 'PERUNGUIURLFED_DESCRIPTION']);
    tags.push(['perunGuiUrl-cert', 'PERUNGUIURLCERT_DESCRIPTION']);
    this.perunLinksAdministratorsTags = tags;
  }

  getUserInvitationsTags() {
    const tags = [];
    tags.push(['voName', 'USER_INVITATIONS_VONAME_DESCRIPTION']);
    tags.push(['groupName', 'USER_INVITATIONS_GROUPNAME_DESCRIPTION']);
    tags.push(['displayName', 'USER_INVITATIONS_DISPLAYNAME_DESCRIPTION']);
    tags.push(['mailFooter', 'USER_INVITATIONS_MAILFOOTER_DESCRIPTION']);
    tags.push(['invitationLink', 'INVITATIONLINK_DESCRIPTION']);
    tags.push(['invitationLink-krb', 'INVITATIONLINKKRB_DESCRIPTION']);
    tags.push(['invitationLink-fed', 'INVITATIONLINKFED_DESCRIPTION']);
    tags.push(['invitationLink-cert', 'INVITATIONLINKCERT_DESCRIPTION']);
    tags.push(['invitationLink-non', 'INVITATIONLINKNON_DESCRIPTION']);
    this.userInvitationsTags = tags;
  }

  addTag(tag: string) {
    this.addedTag.emit(tag);
  }
}
