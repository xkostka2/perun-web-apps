import { Component, HostListener, Input } from '@angular/core';
import {NotificationData} from '@perun-web-apps/perun/models';
import {NotificatorService} from '@perun-web-apps/perun/services';
import {flyInOut} from '@perun-web-apps/perun/animations';
import { NotificationStorageService } from '@perun-web-apps/perun/services';

@Component({
  selector: 'perun-web-apps-notificator',
  templateUrl: './notificator.component.html',
  styleUrls: ['./notificator.component.scss'],
  animations: [
    flyInOut
  ]
})
export class NotificatorComponent {

  constructor(
    private notificator: NotificatorService,
    private notificationStorageService: NotificationStorageService
  ) {
    this.notificator.addNotification.subscribe(notificationData => {
      this.processNotification(notificationData);
    });
    this.getScreenSize();
  }

  private mobileView = false;
  minWidth = 992;

  @Input()
  displayWarning = false;

  notifications: NotificationData[] = [];

  @HostListener('window:resize', ['$event'])
  getScreenSize() {
    this.mobileView = window.innerWidth <= this.minWidth;
  }

  private processNotification(data: NotificationData): void {
    this.notifications.push(data);
    this.notificationStorageService.storeNotification(data);
  }

  getNotificatorTop() {
    if (this.mobileView) {
      return 'initial';
    }
    return this.displayWarning ? '112px' : '64px';
  }

  removeNotification(index: number){
    this.notifications.splice(index, 1);
  }
}
