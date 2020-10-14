import { Component, HostBinding, OnInit } from '@angular/core';
import {MenuItem} from '@perun-web-apps/perun/models';
import {
  Attribute, AttributesManagerService,
  User, UsersManagerService
} from '@perun-web-apps/perun/openapi';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { StoreService } from '@perun-web-apps/perun/services';
import { Urns } from '@perun-web-apps/perun/urns';
import { MatDialog } from '@angular/material/dialog';
import { getDefaultDialogConfig, parseAttributeFriendlyName } from '@perun-web-apps/perun/utils';
import { ChangeEmailDialogComponent } from '@perun-web-apps/perun/dialogs';
import { AttributeFriendlyNamePipe } from '../../../../shared/pipes/attribute-friendly-name.pipe';

@Component({
  selector: 'app-user-overview',
  templateUrl: './user-overview.component.html',
  styleUrls: ['./user-overview.component.scss']
})
export class UserOverviewComponent implements OnInit {

  @HostBinding('class.router-component') true;

  constructor(private userService: UsersManagerService,
              private attributeService: AttributesManagerService,
              private storeService: StoreService,
              private route: ActivatedRoute,
              private dialog: MatDialog) { }

  navItems: MenuItem[] = [];
  user: User;
  userID: number;
  path: string;
  mailDataSource: MatTableDataSource<Attribute>;
  displayedColumns = ['name', 'value'];
  inMyProfile = false;
  preferredMail: Attribute;

  ngOnInit() {
    this.route.params.subscribe(params => {
      if(params['userId'] !== undefined) {
        this.userService.getUserById(params['userId']).subscribe(user => {
          this.user = user;

          this.initNavItems();
        });
      } else {
        this.inMyProfile = true;
        this.userID = this.storeService.getPerunPrincipal().user.id;

        this.attributeService.getUserAttributeByName(this.userID, Urns.USER_DEF_PREFERRED_MAIL).subscribe(mail => {
          this.preferredMail = mail;
          this.handleMailNotDefined();


          this.mailDataSource = new MatTableDataSource<Attribute>([this.preferredMail]);
          this.initNavItems();
        });
      }
    });
  }

  private initNavItems() {
    this.navItems = [
      {
        cssIcon: 'perun-vo',
        url: `organizations`,
        label: 'MENU_ITEMS.ADMIN.ORGANIZATIONS',
        style: 'user-btn'
      },
      {
        cssIcon: 'perun-group',
        url: `groups`,
        label: 'MENU_ITEMS.ADMIN.GROUPS',
        style: 'user-btn'
      },
      ];
    if (window.location.pathname.startsWith('/admin')) {
      this.navItems.push({
          cssIcon: 'perun-group',
          url: `identities`,
          label: 'MENU_ITEMS.USER.IDENTITIES',
          style: 'user-btn'
        },
        {
          cssIcon: 'perun-resource',
          url: `resources`,
          label: "MENU_ITEMS.USER.RESOURCES",
          style: 'user-btn'
        });
    }
    this.navItems.push({
      cssIcon: 'perun-attributes',
      url: `attributes`,
      label: 'MENU_ITEMS.USER.ATTRIBUTES',
      style: 'user-btn'
    });
    this.navItems.push(
      {
        cssIcon: 'perun-group',
        url: `roles`,
        label: 'MENU_ITEMS.USER.ROLES',
        style: 'user-btn'
      },
      {
        cssIcon: 'perun-settings2',
        url: `settings`,
        label: 'MENU_ITEMS.ADMIN.SETTINGS',
        style: 'user-btn'
      });
  }

  changeEmail() {
    const config = getDefaultDialogConfig();
    config.width = '350px';
    config.data = { userId: this.userID };

    const dialogRef = this.dialog.open(ChangeEmailDialogComponent, config);

    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.attributeService.getUserAttributeByName(this.userID, Urns.USER_DEF_PREFERRED_MAIL).subscribe(email => {
          this.preferredMail = email
          this.handleMailNotDefined()

          this.mailDataSource = new MatTableDataSource<Attribute>([this.preferredMail]);
        });
      }
    });
  }

  handleMailNotDefined() {
    if (this.preferredMail === null || this.preferredMail === undefined){
      this.preferredMail = {
        id: -1,
        beanName: 'Attribute',
        displayName: parseAttributeFriendlyName(Urns.USER_DEF_PREFERRED_MAIL.split(':').pop()),
        value: Object('-')
      };
    }
  }
}
