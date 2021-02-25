import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SideMenuItemsService {

  constructor() { }

  getSideMenuItems(): SideMenuItem[] {
    const items: SideMenuItem[] = [];
    items.push({
      label: 'MENU_ITEMS.ALL_PUBLICATIONS',
      icon: 'perun-publications-white',
      isSVG: true,
      link: '/all-publications',
      activatedRegex: '^/all-publications$',
      tabName: 'all-publications'
    });
    items.push({
      label: 'MENU_ITEMS.MY_PUBLICATIONS',
      icon: 'local_library',
      link: '/my-publications',
      activatedRegex: '^/my-publications$',
      tabName: 'my-publications'
    });
    items.push({
      label: 'MENU_ITEMS.CREATE_PUBLICATION',
      icon: 'add_box',
      link: '/create-publication',
      activatedRegex: '^/create-publication$',
      tabName: 'create-publication'
    });
    items.push({
      label: 'MENU_ITEMS.AUTHORS',
      icon: 'groups',
      link: '/authors',
      activatedRegex: '^/authors$',
      tabName: 'authors'
    });
    items.push({
      label: 'MENU_ITEMS.CATEGORIES',
      icon: 'all_inbox',
      link: '/categories',
      activatedRegex: '^/categories$',
      tabName: 'categories'
    });
    items.push({
      label: 'MENU_ITEMS.PUBLICATION_SYSTEMS',
      icon: 'assignment',
      link: '/publication-systems',
      activatedRegex: '^/publication-systems$',
      tabName: 'publication-systems'
    });
    return items;
  }
}

export interface SideMenuItem {
  label: string;
  icon: string;
  isSVG?: boolean
  link: string;
  activatedRegex: string;
  tabName: string;
}
