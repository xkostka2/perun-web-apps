import { Injectable } from '@angular/core';
// tslint:disable-next-line:nx-enforce-module-boundaries
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StoreService } from '@perun-web-apps/perun/services';

declare const tinycolor: any;

export interface Color {
  name: string;
  hex: string;
  darkContrast: boolean;
  red: number;
  green: number;
  blue: number;
}

export interface EntityColorConfig {
  entity: string;
  configValue: string;
  cssVariable: string;
}

export interface ColorConfig {
  configValue: string;
  cssVariable: string;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  constructor(
    private http: HttpClient,
    private storeService: StoreService
  ) { }

  initializeColors(entityColorConfigs: EntityColorConfig[], colorConfigs: ColorConfig[]): Promise<void> {
    return new Promise<void>((resolve => {
      colorConfigs.forEach(cc => {        //configuration for single items
        const color = this.storeService.get('theme', cc.configValue);
        document.documentElement.style.setProperty(cc.cssVariable, color);
      });

      entityColorConfigs.forEach(ecc => {       //configuration for whole entities
        const color = this.storeService.get('theme', ecc.configValue);
        // set CSS variable for given entity
        document.documentElement.style.setProperty(ecc.cssVariable, color);
        // update theme for given entity
        this.setEntityTheme(ecc.entity, color);
      });
      resolve();
    }));
  }

  setEntityTheme(entity: string, color: string): void {
    const primaryColorPalette = computeColors(color);

    for (const paletteColor of primaryColorPalette) {
      const key1 = `--${entity}-theme-primary-${paletteColor.name}`;
      const value1 = `${paletteColor.red},${paletteColor.green},${paletteColor.blue}`;
      const key2 = `--${entity}-theme-primary-contrast-${paletteColor.name}`;
      const value2 = paletteColor.darkContrast ? '30,30,30' : '255,255,255';
      document.documentElement.style.setProperty(key1, value1);
      document.documentElement.style.setProperty(key2, value2);
    }
  }

  /**
   * Load default configuration.
   * If instance is not in production mode, the configuration is also
   * taken as instance configuration and load additional data.
   */
  loadAppDefaultConfig(): Promise<void> {
    return new Promise((resolve) => {

      this.http.get('/assets/config/defaultConfig.json', { headers: this.getNoCacheHeaders() })
        .subscribe(config => {
          this.storeService.setDefaultConfig(config);
          resolve();
        });

    });
  }

  /**
   * Load instance configuration.
   * If instance is in production mode, configuration mode is assigned to
   * instance config and load additional data.
   */
  loadAppInstanceConfig(): Promise<void> {
    return new Promise((resolve, reject) => {

      this.http.get('/assets/config/instanceConfig.json', { headers: this.getNoCacheHeaders() })
        .subscribe(config => {
          this.storeService.setInstanceConfig(config);
          const branding = document.location.hostname;
          if (this.storeService.get('brandings', branding) !== undefined) {
            this.storeService.setBanding(branding);
          }
          resolve();
        }, () => {
          console.log('instance config not detected');
          resolve();
        });
    });
  }

  getNoCacheHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
}

function computeColors(hex: string): Color[] {
  return [
    getColorObject(tinycolor(hex).lighten(52), '50'),
    getColorObject(tinycolor(hex).lighten(37), '100'),
    getColorObject(tinycolor(hex).lighten(26), '200'),
    getColorObject(tinycolor(hex).lighten(12), '300'),
    getColorObject(tinycolor(hex).lighten(6), '400'),
    getColorObject(tinycolor(hex), '500'),
    getColorObject(tinycolor(hex).darken(6), '600'),
    getColorObject(tinycolor(hex).darken(12), '700'),
    getColorObject(tinycolor(hex).darken(18), '800'),
    getColorObject(tinycolor(hex).darken(24), '900'),
    getColorObject(tinycolor(hex).lighten(50).saturate(30), 'A100'),
    getColorObject(tinycolor(hex).lighten(30).saturate(30), 'A200'),
    getColorObject(tinycolor(hex).lighten(10).saturate(15), 'A400'),
    getColorObject(tinycolor(hex).lighten(5).saturate(5), 'A700')
  ];
}

function getColorObject(value, name): Color {
  const c = tinycolor(value);
  const rgb = c.toRgb();
  return {
    name: name,
    hex: c.toHexString(),
    darkContrast: c.isLight(),
    red: rgb.r,
    green: rgb.g,
    blue: rgb.b
  };
}
