import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import {
  AddApplicationFormItemDialogComponent
} from '../../../../../shared/components/dialogs/add-application-form-item-dialog/add-application-form-item-dialog.component';
import {
  EditApplicationFormItemDialogComponent
} from '../../../../../shared/components/dialogs/edit-application-form-item-dialog/edit-application-form-item-dialog.component';
import {
  ApplicationFormCopyItemsDialogComponent
} from '../../../../../shared/components/dialogs/application-form-copy-items-dialog/application-form-copy-items-dialog.component';
import {
  UpdateApplicationFormDialogComponent
} from '../../../../../shared/components/dialogs/update-application-form-dialog/update-application-form-dialog.component';
import {
  ApplicationForm,
  ApplicationFormItem,
  AttributesManagerService,
  Group,
  GroupsManagerService,
  RegistrarManagerService
} from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService } from '@perun-web-apps/perun/services';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { MatSlideToggle } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-group-settings-application-form',
  templateUrl: './group-settings-application-form.component.html',
  styleUrls: ['./group-settings-application-form.component.scss']
})
export class GroupSettingsApplicationFormComponent implements OnInit {

  static id = 'GroupSettingsApplicationFormComponent';

  @HostBinding('class.router-component') true;

  constructor(
    private registrarManager: RegistrarManagerService,
    protected route: ActivatedRoute,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private apiRequest: ApiRequestConfigurationService,
    private router: Router,
    private guiAuthResolver: GuiAuthResolver,
    private groupsManager: GroupsManagerService,
    private attributesManager: AttributesManagerService) {
  }

  @ViewChild('autoRegToggle')
  autoRegToggle: MatSlideToggle;

  loading = false;
  applicationForm: ApplicationForm;
  applicationFormItems: ApplicationFormItem[] = [];
  voId: number;
  groupId: number;
  noApplicationForm = false;
  itemsChanged = false;
  group: Group;
  editAuth = false;
  createEmptyForm = false;
  voHasEmbeddedGroupApplication = false;
  autoRegistrationEnabled: boolean;
  changeAutoRegistration: boolean;

  // This counter is used to generate ids for newly added items. This fake ids are used in backend
  // to recognize new items in other items' dependencies
  private idCounter = -1;

  ngOnInit() {
    this.loading = true;
    this.route.parent.parent.params.subscribe(params => {
      this.voId = params['voId'];
      this.groupId = params['groupId'];
      this.groupsManager.getGroupById(this.groupId).subscribe(group => {
        this.group = group;
        // FIXME this might not work in case of some race condition (other request finishes sooner)
        this.apiRequest.dontHandleErrorForNext();
        this.registrarManager.getGroupApplicationForm(this.groupId).subscribe(form => {
          this.applicationForm = form;
          this.registrarManager.getFormItemsForGroup(this.groupId).subscribe(formItems => {
            this.applicationFormItems = formItems;
            this.attributesManager.getGroupAttributeByName(this.groupId, "urn:perun:group:attribute-def:virt:autoRegistrationEnabled").subscribe(attr => {
              this.voHasEmbeddedGroupApplication = attr.value !== null;
              this.autoRegistrationEnabled = !!attr.value;
              this.setAuth();
              this.loading = false;
            });
          }, () => this.loading = false);
        }, error => {
          if (error.error.name === 'FormNotExistsException') {
            this.noApplicationForm = true;
            this.setAuth();
            this.loading = false;
          } else {
            this.notificator.showRPCError(error.error);
          }
        });
      }, () => this.loading = false);
    });
  }

  setAuth() {
    this.editAuth = this.guiAuthResolver.isAuthorized('group-updateFormItems_ApplicationForm_List<ApplicationFormItem>_policy', [this.group]);
    this.createEmptyForm = this.guiAuthResolver.isAuthorized('createApplicationFormInGroup_Group_policy', [this.group]);
    this.changeAutoRegistration = this.guiAuthResolver.isAuthorized('addGroupsToAutoRegistration_List<Group>_policy', [this.group]);
  }

  add() {
    let config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = {
      applicationFormItems: this.applicationFormItems,
      fakeId: this.idCounter--,
    };

    const dialog = this.dialog.open(AddApplicationFormItemDialogComponent, config);
    dialog.afterClosed().subscribe(success => {
      // success is field contains of two items: first is applicationFormItems with new item in it,
      // second item is new Application Form Item
      if (success) {
        this.applicationFormItems = Object.assign([], success[0]);

        config = getDefaultDialogConfig();
        config.width = '600px';
        config.height = '600px';
        config.data = {
          voId: this.voId,
          groupId: this.groupId,
          applicationFormItem: success[1],
          theme: 'group-theme',
          allItems: this.applicationFormItems
        };

        this.dialog.open(EditApplicationFormItemDialogComponent, config);
        this.itemsChanged = true;
      }
    });
  }

  copy() {
    const config = getDefaultDialogConfig();
    config.width = '500px';
    config.data = { voId: this.voId, groupId: this.groupId, theme: 'group-theme' };

    const dialog = this.dialog.open(ApplicationFormCopyItemsDialogComponent, config);
    dialog.afterClosed().subscribe(copyFrom => {
      if (copyFrom) {
        this.updateFormItems();
      }
    });
  }

  settings() {
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      entity: "group",
      applicationForm: this.applicationForm,
      theme: 'group-theme'
    };

    const dialog = this.dialog.open(UpdateApplicationFormDialogComponent, config);
    dialog.afterClosed().subscribe(newForm => {
      if (newForm) {
        this.translate.get('GROUP_DETAIL.SETTINGS.APPLICATION_FORM.CHANGE_SETTINGS_SUCCESS').subscribe(successMessage => {
          this.notificator.showSuccess(successMessage);
        });
        this.applicationForm = newForm;
      }
    });
  }

  preview() {
    this.router.navigate(['/organizations', this.voId, 'groups', this.groupId, 'settings', 'applicationForm', 'preview'],
      { queryParams: { applicationFormItems: JSON.stringify(this.applicationFormItems) } });
  }

  updateFormItems() {
    this.loading = true;
    this.registrarManager.getFormItemsForGroup(this.groupId).subscribe(formItems => {
      this.applicationFormItems = formItems;
      this.itemsChanged = false;
      this.loading = false;
    });
  }

  changeItems() {
    this.itemsChanged = true;
  }

  createEmptyApplicationForm() {
    this.registrarManager.createApplicationFormInGroup(this.groupId).subscribe(() => {
      this.noApplicationForm = false;
      this.ngOnInit();
    });
  }

  save() {
    let i = 0;
    for (const item of this.applicationFormItems) {
      item.ordnum = i;
      if (!item.forDelete) {
        i++;
      }
    }
    // @ts-ignore
    // TODO reimplement this
    this.registrarManager.updateFormItemsForGroup({
      group: this.groupId,
      items: this.applicationFormItems
    }).subscribe(() => {
      this.translate.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.CHANGE_APPLICATION_FORM_ITEMS_SUCCESS')
        .subscribe(successMessage => {
          this.notificator.showSuccess(successMessage);
        });
      this.updateFormItems();
    });
  }

  clear() {
    this.applicationFormItems = [];
    this.itemsChanged = true;
  }

  updateAutoRegistration() {
    this.autoRegToggle.setDisabledState(true);
    if (this.autoRegistrationEnabled) {
      this.groupsManager.deleteGroupsFromAutoRegistration([this.group.id]).subscribe(() => {
        this.autoRegistrationEnabled = !this.autoRegistrationEnabled;
        this.translate.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.CHANGE_SETTINGS_SUCCESS')
          .subscribe(successMessage => {
            this.notificator.showSuccess(successMessage);
          });
        this.autoRegToggle.setDisabledState(false)
      }, () => this.autoRegToggle.setDisabledState(false));
    } else {
      this.groupsManager.addGroupsToAutoRegistration([this.group.id]).subscribe(() => {
        this.autoRegistrationEnabled = !this.autoRegistrationEnabled;
        this.translate.get('VO_DETAIL.SETTINGS.APPLICATION_FORM.CHANGE_SETTINGS_SUCCESS')
          .subscribe(successMessage => {
            this.notificator.showSuccess(successMessage);
          });
        this.autoRegToggle.setDisabledState(false)
      }, () => this.autoRegToggle.setDisabledState(false));
    }
  }
}
