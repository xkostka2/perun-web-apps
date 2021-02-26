import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReportIssueDialogComponent } from '../report-issue-dialog/report-issue-dialog.component';
import { StoreService } from '@perun-web-apps/perun/services';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { version } from '../../../../../../package.json';

@Component({
  selector: 'perun-web-apps-footer',
  templateUrl: './perun-footer.component.html',
  styleUrls: ['./perun-footer.component.scss']
})
export class PerunFooterComponent implements OnInit {

  constructor(
    private storeService: StoreService,
    private dialog: MatDialog,
    private store: StoreService
  ) { }

  perunwebpage = '';
  perunTeamWebpage = '';
  privacyPolicy = '';
  userDocumentationWebpage = '';
  administratorDocumentationWebpage = '';
  supportMail = '';
  version = '';
  copyright: [] = [];
  backgroundColor = this.store.get('theme', 'footer_bg_color');
  footerCopyrightTextColor = this.store.get('theme', 'footer_copyright_text_color');
  linksTextColor = this.store.get('theme', 'footer_links_text_color');
  footerHeadersTextColor = this.store.get('theme', 'footer_headers_text_color');
  githubRepository = this.storeService.get('footer_github_releases');

  currentYear = (new Date()).getFullYear();

  ngOnInit() {
    console.log(this.backgroundColor);
    this.perunwebpage = this.storeService.get('footer_perun_web_web');
    this.perunTeamWebpage = this.storeService.get('footer_perun_team_web');
    this.privacyPolicy = this.storeService.get('footer_privacy_policy_web');
    this.userDocumentationWebpage = this.storeService.get('footer_users_documentation_web');
    this.administratorDocumentationWebpage = this.storeService.get('footer_administrator_documentation');
    this.supportMail = this.storeService.get('footer_support_mail');
    this.version = version;
    this.copyright = this.storeService.get('footer_copyright');
  }

  openBugReportDialog() {
    const config = getDefaultDialogConfig();
    config.width = '550px';

    this.dialog.open(ReportIssueDialogComponent, config);
  }
}
