import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import {
  Group,
  GroupsManagerService,
  RegistrarManagerService,
  Vo,
  VosManagerService
} from '@perun-web-apps/perun/openapi';
import { ApiRequestConfigurationService, GuiAuthResolver, NotificatorService } from '@perun-web-apps/perun/services';

export interface ApplicationFormCopyItemsDialogData {
  voId: number;
  groupId: number;
  theme: string;
}

@Component({
  selector: 'app-application-form-copy-items-dialog',
  templateUrl: './application-form-copy-items-dialog.component.html',
  styleUrls: ['./application-form-copy-items-dialog.component.scss']
})
export class ApplicationFormCopyItemsDialogComponent implements OnInit {

  successMessage: string;

  vos: Vo[] = [];
  groups: Group[] = [];
  fakeGroup: Group;
  selectedVo: Vo;
  selectedGroup: Group;
  privilegeMessage: string;
  noFormMessage: string;
  theme: string;
  loading = false;

  constructor(private dialogRef: MatDialogRef<ApplicationFormCopyItemsDialogComponent>,
              private voService: VosManagerService,
              private groupService: GroupsManagerService,
              private translateService: TranslateService,
              private registrarManager: RegistrarManagerService,
              private notificatorService: NotificatorService,
              private apiRequest: ApiRequestConfigurationService,
              @Inject(MAT_DIALOG_DATA) public data: ApplicationFormCopyItemsDialogData) {
    translateService.get('DIALOGS.APPLICATION_FORM_COPY_ITEMS.SUCCESS').subscribe(res => this.successMessage = res);
    translateService.get('DIALOGS.APPLICATION_FORM_COPY_ITEMS.PRIVILEGE').subscribe(res => this.privilegeMessage = res);
    translateService.get('DIALOGS.APPLICATION_FORM_COPY_ITEMS.NO_FORM').subscribe(res => this.noFormMessage = res);
  }

  ngOnInit() {
    this.loading = true;
    this.theme = this.data.theme;
    this.translateService.get('DIALOGS.APPLICATION_FORM_COPY_ITEMS.NO_GROUP_SELECTED').subscribe( text => {
      this.fakeGroup = {
        id: -1,
        name: text,
        voId: 0,
        parentGroupId: 0,
        shortName: '',
        description: '',
        beanName: 'Group'
      };

      this.voService.getMyVos().subscribe(vos => {

        this.vos = vos.sort(((vo1, vo2) => {
          if (vo1.name > vo2.name) {
            return 1;
          }

          if (vo1.name < vo2.name) {
            return -1;
          }

          return 0;
        }));
        this.loading = false;
      }, () => this.loading = false);
    }, () => this.loading = false);
  }

  cancel() {
    this.dialogRef.close(false);
  }

  submit() {
    this.apiRequest.dontHandleErrorForNext();
    this.loading = true;
    if (this.data.groupId) { // checking if the dialog is for group or Vo
      if (this.selectedGroup === this.fakeGroup) {   // no group selected
        this.registrarManager.copyFormFromVoToGroup(this.selectedVo.id, this.data.groupId).subscribe(() => {
          this.notificatorService.showSuccess(this.successMessage);
          this.dialogRef.close(true);
        }, error => {
          if (error.error.name === "FormNotExistsException"){
            this.notificatorService.showError(this.noFormMessage);
          }
          if (error.error.name === "PrivilegeException"){
            this.notificatorService.showError(this.privilegeMessage);
          }
          this.loading = false;
        });
      } else {
        this.registrarManager.copyFormFromGroupToGroup(this.selectedGroup.id, this.data.groupId).subscribe(() => {
          this.notificatorService.showSuccess(this.successMessage);
          this.dialogRef.close(true);
        }, error => {
          if (error.error.name === "FormNotExistsException"){
            this.notificatorService.showError(this.noFormMessage);
          }
          if (error.error.name === "PrivilegeException"){
            this.notificatorService.showError(this.privilegeMessage);
          }
          this.loading = false;
        });
      }
    } else {
      if (this.selectedGroup === this.fakeGroup) {       // no group selected
        this.registrarManager.copyFormFromVoToVo(this.selectedVo.id, this.data.voId).subscribe(() => {
          this.notificatorService.showSuccess(this.successMessage);
          this.dialogRef.close(true);
        }, error => {
          if (error.error.name === "FormNotExistsException"){
            this.notificatorService.showError(this.noFormMessage);
          }
          if (error.error.name === "PrivilegeException"){
            this.notificatorService.showError(this.privilegeMessage);
          }
          this.loading = false;
        });
      } else {
        this.registrarManager.copyFormFromGroupToVo(this.selectedGroup.id, this.data.voId).subscribe(() => {
          this.notificatorService.showSuccess(this.successMessage);
          this.dialogRef.close(true);
        }, error => {
          if (error.error.name === "FormNotExistsException"){
            this.notificatorService.showError(this.noFormMessage);
          }
          if (error.error.name === "PrivilegeException"){
            this.notificatorService.showError(this.privilegeMessage);
          }
          this.loading = false;
        });
      }
    }
  }

  voSelected(vo: Vo) {
    this.selectedVo = vo;
    this.getGroups();
  }

  getGroups() {
    if (this.selectedVo !== undefined) {
      this.groupService.getAllGroups(this.selectedVo.id).subscribe(groups => {
        this.groups = [this.fakeGroup].concat(groups);
      });
    } else {
      this.groups = [this.fakeGroup];
    }
    this.selectedGroup = this.fakeGroup;
  }

}
