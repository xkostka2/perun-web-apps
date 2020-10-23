import { Component, OnInit } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';

interface TabItem {
  icon: string;
  url: string;
  label: string;
  tabName: string;
}

@Component({
  selector: 'perun-web-apps-settings-overview',
  templateUrl: './settings-overview.component.html',
  styleUrls: ['./settings-overview.component.scss']
})
export class SettingsOverviewComponent implements OnInit {

  constructor(private storeService: StoreService) { }

  items: TabItem[] = [];

  ngOnInit() {
    this.initItems();
    const displayedTabs: string[] = this.storeService.get('displayed_tabs');
    this.items = this.items.filter(item => displayedTabs.includes(item.tabName));
  }

  private initItems() {
    this.items = [
      {
        icon: 'lock_open',
        url: `/profile/settings/altPasswords`,
        label: 'SETTINGS.ALTERNATIVE_PASSWORDS',
        tabName: 'alt_passwords'
      },
      {
        icon: 'admin_panel_settings',
        url: `/profile/settings/auth`,
        label: 'SETTINGS.AUTHENTICATION',
        tabName: 'auth'
      },
      {
        icon: 'storage',
        url: `/profile/settings/dataQuotas`,
        label: 'SETTINGS.DATA_QUOTAS',
        tabName: 'data_quotas'
      },
      {
        icon: 'unsubscribe',
        url: `/profile/settings/mailingLists`,
        label: 'SETTINGS.MAILING_LISTS',
        tabName: 'opt_out'
      },
      {
        icon: 'chevron_right',
        url: `/profile/settings/prefShells`,
        label: 'SETTINGS.PREFERRED_SHELLS',
        tabName: 'pref_shells'
      },
      {
        icon: 'group',
        url: `/profile/settings/prefGroupNames`,
        label: 'SETTINGS.PREFERRED_UNIX_GROUP_NAMES',
        tabName: 'pref_group_names'
      },
      {
        icon: 'lock_open',
        url: `/profile/settings/sambaPassword`,
        label: 'SETTINGS.SAMBA_PASSWORD',
        tabName: 'samba'
      },
      {
        icon: 'vpn_key',
        url: `/profile/settings/sshKeys`,
        label: 'SETTINGS.SSH_KEYS',
        tabName: 'ssh_keys'
      },
      {
        icon: 'lock',
        url: `/profile/settings/passwordReset`,
        label: 'SETTINGS.PASSWORD_RESET',
        tabName: 'password_reset'
      }
    ];
  }
}
