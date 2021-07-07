import { Injectable } from '@angular/core';
import { StoreService } from '@perun-web-apps/perun/services';

@Injectable({
  providedIn: 'root'
})
export class SideMenuItemService {

  constructor(private store: StoreService) { }

  getSideMenuItems(): SideMenuItem[] {
    const tabs = this.store.get('displayed_tabs');
    const items: SideMenuItem[] = []
    tabs.forEach(tab => {
      switch (tab){
        case 'profile':
          items.push({
            label: 'MENU_ITEMS.PROFILE',
            icon: 'account_box',
            link: '/profile',
            activatedRegex: '^/profile$',
            tabName: 'profile'
          });
          break;
        case 'identities':
          items.push({
            label: 'MENU_ITEMS.IDENTITIES',
            icon: 'remove_red_eye',
            link: '/profile/identities',
            activatedRegex: '^/profile/identities$',
            tabName: 'identities'
          });
          break;
        case 'services':
          items.push({
            label: 'MENU_ITEMS.SERVICES',
            icon: 'build',
            link: '/profile/services',
            activatedRegex: '^/profile/services$',
            tabName: 'services'
          });
          break;
        case 'groups':
          items.push({
            label: 'MENU_ITEMS.GROUPS',
            icon: 'group',
            link: '/profile/groups',
            activatedRegex: '^/profile/groups$',
            tabName: 'groups'
          });
          break;
        case 'vos':
          items.push({
            label: 'MENU_ITEMS.VOS',
            icon: 'account_balance',
            link: '/profile/organizations',
            activatedRegex: '^/profile/organizations$',
            tabName: 'vos'
          });
          break;
        case 'privacy':
          items.push({
            label: 'MENU_ITEMS.PRIVACY',
            icon: 'vpn_key',
            link: '/profile/privacy',
            activatedRegex: '^/profile/privacy$',
            tabName: 'privacy'
          });
          break;
        case 'settings':
          items.push({
            label: 'MENU_ITEMS.SETTINGS',
            icon: 'settings',
            link: '/profile/settings',
            activatedRegex: '^/profile/settings',
            tabName: 'settings'
          });
          break;
      }
    })
    const externalServices = this.store.get('external_services');
    externalServices.forEach(service => {
      const item = {
        icon: 'insert_link',
        link: service['url'],
        activatedRegex: '^/profile/external',
        tabName: 'external',
        external: true
      }
      this.store.get('supportedLanguages').forEach(lang => {
        item[`label_${lang}`] = service[`label_${lang}`] ?? service[`label_en`];
      })
      items.push(item)
    })
    return items;
  }
}

export interface SideMenuItem {
  icon: string;
  link: string;
  activatedRegex: string;
  tabName: string;
  external?: boolean;
  [key:string]: string | boolean;
}
