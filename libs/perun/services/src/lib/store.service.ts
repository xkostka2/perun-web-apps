import { Injectable } from '@angular/core';
import { PerunPrincipal } from '@perun-web-apps/perun/openapi';

/**
 * Class that just store data about instance and default configuration.
 * No logic involved.
 */
@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private instanceConfig;
  private defaultConfig;
  private principal: PerunPrincipal;
  private initialPageId: number;

  constructor() { }

  setInstanceConfig(instanceConfig: any) {
    this.instanceConfig = instanceConfig;
  }

  setDefaultConfig(defaultConfig: any) {
    this.defaultConfig = defaultConfig;
  }

  setPerunPrincipal(principal: PerunPrincipal): void {
    this.principal = principal;
  }

  getPerunPrincipal(): PerunPrincipal {
    return this.principal;
  }

  getInitialPageId(): number {
    return this.initialPageId;
  }

  setInitialPageId(pageId: number) {
    this.initialPageId = pageId;
  }

  getLoginAttributeNames(): Array<string> {
    return this.get("login_namespace_attributes");
  }

  getMemberProfileAttributeNames(): Array<string> {
    return this.get("member_profile_attributes_friendly_names");
  }

  skipOidc(): boolean {
    return this.get('skip_oidc');
  }

  /**
   * Get key from json configuration. If key is not present in instance
   * configuration method returns value from default configuration.
   * @param keys
   */
  get(...keys: string[]) : any {
    let currentValue: string;

    if (this.instanceConfig !== undefined) {
      for (let i = 0; i < keys.length; ++i) {
        if (i === 0) {
          currentValue = this.instanceConfig[keys[i]];
        } else {
          if (currentValue === undefined) {
            break;
          }
          currentValue = currentValue[keys[i]];
        }
      }
    }

    if (this.defaultConfig === undefined) {
      return undefined;
    }
    if (currentValue === undefined) {
      for (let i = 0; i < keys.length; ++i) {
        if (i === 0) {
          currentValue = this.defaultConfig[keys[i]];
        } else {
          if (currentValue === undefined) {
            console.error('Missing value in default config: ' + keys);
            break;
          }
          currentValue = currentValue[keys[i]];
        }
      }
    }

    return currentValue;
  }
}
