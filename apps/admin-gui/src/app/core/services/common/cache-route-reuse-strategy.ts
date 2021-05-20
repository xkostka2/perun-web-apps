import {RouteReuseStrategy} from '@angular/router/';
import {ActivatedRouteSnapshot, DetachedRouteHandle} from '@angular/router';
import {VoMembersComponent} from '../../../vos/pages/vo-detail-page/vo-members/vo-members.component';
import {VoGroupsComponent} from '../../../vos/pages/vo-detail-page/vo-groups/vo-groups.component';
import {VoApplicationsComponent} from '../../../vos/pages/vo-detail-page/vo-applications/vo-applications.component';
import {GroupApplicationsComponent} from '../../../vos/pages/group-detail-page/group-applications/group-applications.component';
import {GroupResourcesComponent} from '../../../vos/pages/group-detail-page/group-resources/group-resources.component';
import {GroupSubgroupsComponent} from '../../../vos/pages/group-detail-page/group-subgroups/group-subgroups.component';
import {GroupMembersComponent} from '../../../vos/pages/group-detail-page/group-members/group-members.component';
import {
  FacilityAllowedGroupsComponent
} from '../../../facilities/pages/facility-detail-page/facility-allowed-groups/facility-allowed-groups.component';
import {FacilityResourcesComponent} from '../../../facilities/pages/facility-detail-page/facility-resources/facility-resources.component';
import {MemberGroupsComponent} from '../../../vos/pages/member-detail-page/member-groups/member-groups.component';
import {
  VoResourcesPreviewComponent
} from '../../../vos/pages/vo-detail-page/vo-resources/vo-resources-preview/vo-resources-preview.component';
import {VoResourcesStatesComponent} from '../../../vos/pages/vo-detail-page/vo-resources/vo-resources-states/vo-resources-states.component';
import { AdminUsersComponent } from '../../../admin/pages/admin-page/admin-users/admin-users.component';
import { VoSettingsApplicationFormComponent } from '../../../vos/pages/vo-detail-page/vo-settings/vo-settings-application-form/vo-settings-application-form.component';
import { GroupSettingsApplicationFormComponent } from '../../../vos/pages/group-detail-page/group-settings/group-settings-application-form/group-settings-application-form.component';
import { Injectable } from "@angular/core";
import { VoSelectPageComponent } from '../../../vos/pages/vo-select-page/vo-select-page.component';
import { FacilitySelectPageComponent } from '../../../facilities/pages/facility-select-page/facility-select-page.component';
import { VoSettingsSponsoredMembersComponent } from '../../../vos/pages/vo-detail-page/vo-settings/vo-settings-sponsored-members/vo-settings-sponsored-members.component';

export class CachedRoute {
  routeHandle: DetachedRouteHandle;
  saveTimeStamp: number;
}

@Injectable()
export class CacheRouteReuseStrategy implements RouteReuseStrategy {

  // typeToComponentToHandlers: Map<string, Map<string, DetachedRouteHandle>>;
  typeToComponentToHandlers: Map<string, Map<string, CachedRoute>>;

  allowCachePages = [
    {
      type: 'vo',
      components: [
        VoMembersComponent.id,
        VoGroupsComponent.id,
        VoApplicationsComponent.id,
        VoResourcesPreviewComponent.id,
        VoResourcesStatesComponent.id,
        VoSettingsApplicationFormComponent.id,
        VoSettingsSponsoredMembersComponent.id
      ]
    },
    {
      type: 'group',
      components: [
        GroupMembersComponent.id,
        GroupSubgroupsComponent.id,
        GroupResourcesComponent.id,
        GroupApplicationsComponent.id,
        GroupSettingsApplicationFormComponent.id
      ]
    },
    {
      type: 'facility',
      components: [
        FacilityAllowedGroupsComponent.id,
        FacilityResourcesComponent.id
      ]
    },
    {
      type: 'member',
      components: [
        MemberGroupsComponent.id
      ]
    },
    {
      type: 'admin',
      components: [
        AdminUsersComponent.id
      ]
    },
    {
      type: 'entitySelect',
      components: [
        VoSelectPageComponent.id,
        FacilitySelectPageComponent.id
      ]
    }
  ];

  private cacheTimeMs = 300_000;

  resets = [
    {
      lastValue: null,
      resetType: 'vo',
      resetPath: ':voId',
      param: 'voId'
    },
    {
      lastValue: null,
      resetType: 'group',
      resetPath: ':voId/groups/:groupId',
      param: 'groupId'
    },
    {
      lastValue: null,
      resetType: 'facility',
      resetPath: ':facilityId',
      param: 'facilityId'
    },
    {
      lastValue: null,
      resetType: 'member',
      resetPath: ':voId/members/:memberId',
      param: 'memberId'
    },
    {
      lastValue: null,
      resetType: 'admin',
      resetPath: 'admin/users'
    }
  ];

  private isUserNavigatingBack = false;

  constructor(
  ) {
    this.typeToComponentToHandlers = new Map<string, Map<string, CachedRoute>>();
    for (const pages of this.allowCachePages) {
      this.typeToComponentToHandlers.set(pages.type, new Map<string, CachedRoute>());
    }
  }

  setLastNavigationType(type: 'back' | 'direct'): void {
    this.isUserNavigatingBack = type === 'back';
  }

  /**
   * Checks if some resets should be done on given route.
   *
   * Checks all resets and if their reset condition is fulfilled, pages of
   * given type are removed from cache.
   *
   * @param newRoute new route
   */
  checkResets(newRoute: ActivatedRouteSnapshot): void {
    const newPath = this.getPath(newRoute);

    for (const reset of this.resets) {
      // if the reset should be used and update it
      if (reset.resetPath === newPath) {
        const newParamValue = newRoute.params[reset.param];

        // remove all cached pages for given type
        if (reset.lastValue !== null && reset.lastValue !== newParamValue) {
          this.typeToComponentToHandlers.get(reset.resetType).clear();
        }

        reset.lastValue = newParamValue;
      }
    }
  }

  shouldReuseRoute(before: ActivatedRouteSnapshot, curr:  ActivatedRouteSnapshot): boolean {
    this.checkResets(curr);
    return before.routeConfig === curr.routeConfig;
  }

  /**
   * Return handlers from cache or null if they are not cached,
   *
   * @param route route
   */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (route.component) {
      const componentName = this.getComponentName(route.component);
      for (const pages of this.allowCachePages) {
        if (pages.components.indexOf(componentName) !== -1) {
          const cachedData =  this.typeToComponentToHandlers.get(pages.type).get(componentName);

          return cachedData === undefined ? null : cachedData.routeHandle;
        }
      }
    }

    return null;
  }

  /**
   * Returns true if the route should be used from cache.
   *
   * @param route route
   */
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    if (!this.isUserNavigatingBack) {
      return false;
    }

    if (route.component) {
      const componentName = this.getComponentName(route.component);
      for (const pages of this.allowCachePages) {
        const cachedData = this.typeToComponentToHandlers.get(pages.type).get(componentName);
        if (cachedData !== undefined && (this.getCurrentTimestamp() - cachedData.saveTimeStamp) < this.cacheTimeMs) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Returns true if the route should be cached.
   *
   * @param route route
   */
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (route.component) {
      const componentName = this.getComponentName(route.component);
      for (let i = 0; i < this.allowCachePages.length; ++i) {
        const pages = this.allowCachePages[i];
        if (pages.components.indexOf(componentName) !== -1) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Stores given handlers for given route.
   *
   * @param route route
   * @param detachedTree handlers
   */
  store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle): void {
    if (route.component) {
      while(document.getElementsByTagName('mat-tooltip-component').length > 0) {
        document.getElementsByTagName('mat-tooltip-component')[0].remove();
      }
      const type = this.getComponentType(route);
      this.typeToComponentToHandlers
        .get(type)
        .set(this.getComponentName(route.component), {
          routeHandle: detachedTree,
          saveTimeStamp: this.getCurrentTimestamp()
        });
    }
  }

  private getCurrentTimestamp(): number {
    return + Date.now();
  }

  /**
   * Parses component name from its source.
   *
   * @param component in string format
   */
  private getComponentName(component: any) {
    return component.id;
  }

  /**
   * Get cache type for given component.
   *
   * @param route route
   */
  private getComponentType(route: ActivatedRouteSnapshot): string {
    const componentName = this.getComponentName(route.component);
    for (const pages of this.allowCachePages) {
      if (pages.components.indexOf(componentName) !== -1) {
        return pages.type;
      }
    }

    return null;
  }

  /**
   * Returns path from given route.
   *
   * @param route route
   */
  private getPath(route: ActivatedRouteSnapshot): string {
    if (route.routeConfig !== null && route.routeConfig.path !== null) {
      return route.routeConfig.path;
    }
    return '';
  }
}
