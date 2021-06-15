import { Component, Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Attribute,
  AttributesManagerService,
  Group, GroupsManagerService,
  InputCreateSponsoredMemberFromCSV,
  MembersManagerService, NamespaceRules, RichGroup
} from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver, NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { formatDate } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { Urns } from '@perun-web-apps/perun/urns';
import { TABLE_VO_GROUPS, TableConfigService } from '@perun-web-apps/config/table-config';
import { downloadData } from '@perun-web-apps/perun/utils';

export interface GenerateSponsoredMembersDialogData {
  voId: number;
  theme: string,
}

@Component({
  selector: 'app-generate-sponsored-members-dialog',
  templateUrl: './generate-sponsored-members-dialog.component.html',
  styleUrls: ['./generate-sponsored-members-dialog.component.scss']
})
export class GenerateSponsoredMembersDialogComponent implements OnInit {

  theme: string;
  loading = false;
  functionalityNotSupported = false;

  emailRegx = /^(([^<>+()\[\]\\.,;:\s@"-#$%&=]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;

  namespaceOptions: string[] = [];
  namespaceRules: NamespaceRules[] = [];
  usersInfoFormGroup: FormGroup;

  passwordReset = 'generate';
  groupAssignment = null;
  expiration = 'never';

  createGroupAuth: boolean;
  assignableGroups: Group[] = [];
  allVoGroups: Group[] = [];
  selection = new SelectionModel<Group>(true, []);
  manualMemberAddingBlocked = false;

  name = '';
  description = '';
  asSubGroup = false;
  parentGroup: Group = null;
  groupIds: number[] = [];

  submitDisabled = false;

  filterValue = '';
  tableId = TABLE_VO_GROUPS;
  pageSize: number;

  private groupAttrNames = [
    Urns.GROUP_SYNC_ENABLED,
    Urns.GROUP_BLOCK_MANUAL_MEMBER_ADDING
  ];

  constructor(private dialogRef: MatDialogRef<GenerateSponsoredMembersDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: GenerateSponsoredMembersDialogData,
              private store: StoreService,
              private membersService: MembersManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService,
              private guiAuthResolver: GuiAuthResolver,
              private groupsService: GroupsManagerService,
              private attributesService: AttributesManagerService,
              private formBuilder: FormBuilder,
              private tableConfigService: TableConfigService) { }

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.createGroupAuth = this.guiAuthResolver.isAuthorized('createGroup_Vo_Group_policy', [{id: this.data.voId , beanName: 'Vo'}]);
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.usersInfoFormGroup = this.formBuilder.group({
      namespace: ['', Validators.required],
      sponsoredMembers: ['', [Validators.required, this.userInputValidator()]]
    });
    this.usersInfoFormGroup.controls['namespace'].valueChanges.subscribe({
      next: () => {
        this.usersInfoFormGroup.controls['sponsoredMembers'].updateValueAndValidity();
      }
    });

    this.attributesService.getVoAttributes(this.data.voId).subscribe(attributes => {
      this.manualMemberAddingBlocked = this.hasAttributeEnabled(attributes, 'blockManualMemberAdding')
      if(this.manualMemberAddingBlocked !== true){
        this.groupsService.getAllRichGroupsWithAttributesByNames(this.data.voId, this.groupAttrNames).subscribe(grps => {
          this.allVoGroups = grps.filter(grp => grp.name !== 'members');
          this.assignableGroups = this.filterAssignableGroups(grps);
          this.membersService.getAllNamespacesRules().subscribe(rules => {
            if (this.store.get('allow_empty_sponsor_namespace')) {
              this.namespaceRules.push({
                namespaceName: 'No namespace',
                csvGenHeader: 'firstname;lastname;urn:perun:user:attribute-def:def:preferredMail',
                csvGenPlaceholder: 'John;Doe;john@mail.cz',
                csvGenHeaderDescription: 'First name;Last name;Email'
              });
            }

            this.namespaceRules = this.namespaceRules.concat(rules);
            this.namespaceRules.forEach(item => this.namespaceOptions.push(item.namespaceName));
            if (this.namespaceOptions.length === 0) {
              this.functionalityNotSupported = true;
            } else {
              this.usersInfoFormGroup.setValue({namespace: this.namespaceOptions[0], sponsoredMembers: ''})
            }
            this.loading = false;
          });
        }, () => this.loading = false);
      } else {
        this.loading = false;
      }
    }, () => this.loading = false);
  }

  private filterAssignableGroups(groups: RichGroup[]) {
    const assignableGroups = [];
    for (const grp of groups) {
      if (!(this.hasAttributeEnabled(grp.attributes, 'synchronizationEnabled') ||
        this.hasAttributeEnabled(grp.attributes, 'blockManualMemberAdding')) &&
        this.guiAuthResolver.isAuthorized('addMembers_Group_List<Member>_policy', [grp])) {
        assignableGroups.push(grp);
      }
    }
    return assignableGroups;
  }

  hasAttributeEnabled(attr: Attribute[], attName: string) {
    return attr.some( att =>
      att.friendlyName === attName && att.value !== null && att.value.toString() === "true");
  }

  createOutputObjects(data: {[p: string]: {[p: string]: string}}) {
    let name = '';
    let status = '';
    let login = '';
    let password = '';
    const output = [];

    for (const memberName of Object.keys(data)) {
      name = memberName.replace(';', ' ').split(';')[0];
      for (const memberData of Object.keys(data[memberName])) {
        switch (memberData) {
          case 'status': {
            status = data[memberName][memberData];
            break;
          }
          case 'login': {
            login = data[memberName][memberData];
            break;
          }
          case 'password': {
            password = data[memberName][memberData];
            break;
          }
          default:
            break;
        }
      }
      output.push({
        name: name,
        status: status,
        login: login,
        password: password
      });
    }

    return output;
  }

  onGenerate(){
    this.loading = true;
    const listOfMembers = this.usersInfoFormGroup.get('sponsoredMembers').value.split("\n");
    const header = this.getSelectedNamespaceRules().csvGenHeader;
    const generatedMemberNames: string[] = [];
    for (const line of listOfMembers){
      const parsedLine = this.parseMemberLine(line);
      if (parsedLine !== 'format' && parsedLine !== 'email') {
        if (parsedLine !== '') {
          generatedMemberNames.push(parsedLine);
        }
      } else {
        this.loading = false;
        return;
      }
    }

    const inputSponsoredMembersFromCSV: InputCreateSponsoredMemberFromCSV = {
      data: generatedMemberNames,
      header: header,
      namespace: '',
      sponsor: this.store.getPerunPrincipal().userId,
      vo: this.data.voId,
      sendActivationLinks: this.passwordReset === "reset"
    }

    if (this.groupAssignment !== 'none') {
      inputSponsoredMembersFromCSV.groups = this.groupIds;
    }

    if(this.expiration !== 'never'){
      inputSponsoredMembersFromCSV.validityTo = formatDate(this.expiration,'yyyy-MM-dd','en-GB');
    }

    if (this.usersInfoFormGroup.get('namespace').value !== 'No namespace') {
      inputSponsoredMembersFromCSV.namespace = this.usersInfoFormGroup.get('namespace').value;
    }

    this.membersService.createSponsoredMembersFromCSV(inputSponsoredMembersFromCSV).subscribe(logins => {
      downloadData(this.createOutputObjects(logins), 'csv', 'member-logins')
      this.notificator.showSuccess(this.translate.instant('DIALOGS.GENERATE_SPONSORED_MEMBERS.SUCCESS'));
      this.dialogRef.close(true);
    }, () => this.loading = false);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  parseMemberLine(line: string): string{
    const trimLine = line.trim();
    if (trimLine === '') {
      return '';
    }
    const memberAttributes = trimLine.split(';');
    const arrayOfAttributes = this.getSelectedNamespaceRules().csvGenHeader.split(';');
    if (memberAttributes.length !== arrayOfAttributes.length) {      //check if all attributes are filled
      return 'format';
    }
    //now we expect that mail is always on the same index - third position
    if (arrayOfAttributes[2].slice(arrayOfAttributes[2].length - 4).toLowerCase() === 'mail') { //check if the third attribute is mail
      if (!memberAttributes[2].trim().match(this.emailRegx)) {      //check if the email is valid email
        return 'email';
      }
    }
    //login must be non empty and we are expecting him in forth position
    if (arrayOfAttributes[3] === 'login') {  //check if the forth attribute is login
      if (memberAttributes[3].trim() === '') {      //check if login is nonempty
        return 'login';
      }
    }
    let finalString = '';
    for (const memberAttribute of memberAttributes) {
      finalString += memberAttribute.trim() + ';';
    }
    return finalString.slice(0, -1);
  }

  userInputValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const listOfMembers = control.value.split("\n");
      for (const line of listOfMembers){
        const parsedLine = this.parseMemberLine(line);
        if (parsedLine === 'format') {
          return {invalidFormat: {value: line}};
        }
        if (parsedLine === 'email') {
          return {invalidEmail: {value: line}};
        }
        if (parsedLine === 'login') {
          return {invalidLogin: {value: line}};
        }
      }

      return null;
    };
  }

  setExpiration(newExpiration) {
    if(newExpiration === 'never'){
      this.expiration = 'never';
    } else {
      this.expiration = formatDate(newExpiration,'yyyy-MM-dd','en-GB');
    }
  }

  groupTablePageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  groupAssigmentChanged() {
    this.selection.clear();

    this.name = '';
    this.description = '';
    this.asSubGroup = false;
    this.parentGroup = null;
  }

  onSubmit() {
    this.loading = true;
    if (this.groupAssignment === "new") {
      if (this.asSubGroup) {
        this.groupsService.createGroupWithParentGroupNameDescription(this.parentGroup.id, this.name, this.description).subscribe(group => {
          this.groupIds.push(group.id);
          this.onGenerate();
        }, () => this.loading = false);
      } else {
        this.groupsService.createGroupWithVoNameDescription(this.data.voId, this.name, this.description).subscribe(group => {
          this.groupIds.push(group.id);
          this.onGenerate();
        }, () => this.loading = false);
      }
    } else {
      if (this.groupAssignment === 'existing') {
        this.groupIds = this.selection.selected.map(grp => grp.id);
      }
      this.onGenerate();
    }
  }

  getSelectedNamespaceRules(): NamespaceRules {
    return this.namespaceRules.find(item => item.namespaceName === this.usersInfoFormGroup.get('namespace').value);
  }
}
