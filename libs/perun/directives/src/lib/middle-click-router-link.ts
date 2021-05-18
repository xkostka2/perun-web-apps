import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[perunWebAppsMiddleClickRouterLink]'
})
export class MiddleClickRouterLinkDirective{

  constructor(){ }

  @Input()
  perunWebAppsMiddleClickRouterLink: any[];

  @HostListener('mouseup', ['$event']) onClick(event: MouseEvent) {
    if (event.button === 1 && (this.perunWebAppsMiddleClickRouterLink !== null && this.perunWebAppsMiddleClickRouterLink !== undefined)){
      const fullUrl = this.perunWebAppsMiddleClickRouterLink.join('/');
      const queryParams = location.search;
      window.open(fullUrl+queryParams);
    }
  }

}
