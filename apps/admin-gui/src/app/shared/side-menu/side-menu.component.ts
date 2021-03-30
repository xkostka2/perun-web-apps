import {Component, Input, OnInit} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import {SideMenuService} from '../../core/services/common/side-menu.service';
import {AppComponent} from '../../app.component';
import {SideMenuItemService} from './side-menu-item.service';
import {GuiAuthResolver} from '@perun-web-apps/perun/services';
import {rollInOut} from '@perun-web-apps/perun/animations';
import { StoreService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss'],
  animations: [
    rollInOut
  ]
})
export class SideMenuComponent implements OnInit {

  constructor(
    private sideMenuService: SideMenuService,
    private sideMenuItemService: SideMenuItemService,
    public authResolver: GuiAuthResolver,
    private store: StoreService
  ) { }

  accessItems: SideMenuItem[] = [];
  facilityItems: SideMenuItem[] = [];
  adminItems: SideMenuItem[] = [];
  homeItems: SideMenuItem[] = [];
  userItems: SideMenuItem[] = [];

  accessItem = this.sideMenuItemService.getAccessManagementItem();
  adminItem = this.sideMenuItemService.getAdminItem();
  facilityItem = this.sideMenuItemService.getFacilitiesManagementItem();
  homeItem = this.sideMenuItemService.getHomeItem();
  userItem = this.sideMenuItemService.getUserItem();


  @Input()
  sideNav: MatSidenav;

  mobileView = true;
  adminItemOpened = false;
  userItemOpened = false;

  ngOnInit(): void {

    this.mobileView = window.innerWidth <= AppComponent.minWidth;
    if (this.mobileView) {
      this.sideNav.close();
    } else {
      this.sideNav.open();
    }

    this.sideMenuService.facilityItemsChange.subscribe(items => {
      this.setFacilityItems(items);
    });
    this.sideMenuService.accessItemsChange.subscribe(items => {
      this.setAccessItems(items);
    });
    this.sideMenuService.adminItemsChange.subscribe(items => {
      this.setAdminItems(items);
    });
    this.sideMenuService.userItemsChange.subscribe(items => {
      this.setUserItems(items);
    });
    this.sideMenuService.homeItemsChange.subscribe(items => {
      this.setHomeItems(items);
    });
    this.sideMenuService.resetChange.subscribe(() => {
      this.reset();
    });
  }

  private reset(): void {
      this.adminItemOpened = false;
      this.userItemOpened = false;
      this.setNewItems(this.homeItems, []);
      this.setNewItems(this.adminItems, []);
      this.setNewItems(this.accessItems, []);
      this.setNewItems(this.facilityItems, []);
      this.setNewItems(this.userItems, []);
  }

  private resetExceptHome(): void {
    this.adminItemOpened = false;
    this.userItemOpened = false;
    this.setNewItems(this.adminItems, []);
    this.setNewItems(this.accessItems, []);
    this.setNewItems(this.facilityItems, []);
    this.setNewItems(this.userItems, []);
  }

  private resetExceptFacility(): void {
      this.adminItemOpened = false;
      this.userItemOpened = false;
      this.setNewItems(this.homeItems, []);
      this.setNewItems(this.adminItems, []);
      this.setNewItems(this.accessItems, []);
      this.setNewItems(this.userItems, []);
  }

  private resetExceptAccess(): void {
      this.adminItemOpened = false;
      this.userItemOpened = false;
      this.setNewItems(this.homeItems, []);
      this.setNewItems(this.adminItems, []);
      this.setNewItems(this.facilityItems, []);
      this.setNewItems(this.userItems, []);
  }

  private resetExceptAdmin(): void {
      this.userItemOpened = false;
      this.setNewItems(this.homeItems, []);
      this.setNewItems(this.accessItems, []);
      this.setNewItems(this.facilityItems, []);
      this.setNewItems(this.userItems, []);
  }

  private resetExceptUser(): void {
    this.adminItemOpened = false;
    this.setNewItems(this.accessItems, []);
    this.setNewItems(this.facilityItems, []);
    this.setNewItems(this.adminItems, []);
  }

  private setHomeItems(items: SideMenuItem[]) {
    this.resetExceptHome();
    this.setNewItems(this.homeItems, items);
  }

  private setFacilityItems(items: SideMenuItem[]) {
      this.resetExceptFacility();
      this.setNewItems(this.facilityItems, items);
  }

  private setAccessItems(items: SideMenuItem[]) {
    this.resetExceptAccess();
    this.setNewItems(this.accessItems, items);
  }

  private setUserItems(items: SideMenuItem[]) {
    this.userItemOpened = true;
    this.resetExceptUser();
    this.setNewItems(this.userItems, items);
  }

  private setAdminItems(items: SideMenuItem[]) {
    // hide the main Perun admin menu when some sub menu is opened
    this.adminItemOpened = items.length === 0;
    this.resetExceptAdmin();
    this.setNewItems(this.adminItems, items);
  }

  /**
   * This method is used to set new sideMenuItems to an existing array of items.
   *
   * The method replaces only items that were not int the origin array.
   * If the new array has smaller size, excessive items are removed from the origin array.
   * This method is used because of animations. Without this, they do not work properly.
   *
   * @param originItems origin array
   * @param newItems new items
   */
  private setNewItems(originItems: SideMenuItem[], newItems: SideMenuItem[]) {
    const maxLength = originItems.length > newItems.length ? originItems.length : newItems.length;

    for (let i = 0; i < maxLength; i ++) {
      if (i > originItems.length - 1) {
        originItems.push(newItems[i]);
      } else if (i > newItems.length - 1) {
        const originItemsLength = originItems.length;
        for (let j = 0; j < originItemsLength - i; j++) {
          originItems.pop();
        }
        break;
      } else if (!this.areSameItems(originItems[i], newItems[i])) {
        originItems[i] = newItems[i];
      }
      // items are same, dont switch
    }
  }

  private areSameItems(item1: SideMenuItem, item2: SideMenuItem) {
    return item1.label === item2.label && item1.labelClass === item2.labelClass;
  }
}

export interface SideMenuItem {
  label: string;
  labelClass?: string;
  colorClass: string;
  activatedClass?: string;
  links: EntityMenuLink[];
  icon: string;
  baseLink?: any[];
  expandable?: boolean;
  baseColorClass?: string;
  baseColorClassRegex?: string;
  linksClass?: string;
  backgroundColorCss?: string;
  textColorCss?: string;
}

export interface EntityMenuLink {
  label: string;
  url:  any[] | string;
  activatedRegex: string;
  children?: EntityMenuLink[];
  showChildrenRegex?: string;
}
