import { AfterViewInit, Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Attribute,
  AttributesManagerService,
  AuthzResolverService, Group, GroupsManagerService,
  InputCreateSponsoredMemberFromCSV,
  MembersManagerService, RichGroup
} from '@perun-web-apps/perun/openapi';
import { GuiAuthResolver, NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { formatDate } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { Urns } from '@perun-web-apps/perun/urns';
import { TABLE_VO_GROUPS, TableConfigService } from '@perun-web-apps/config/table-config';

export interface GenerateSponsoredMembersDialogData {
  voId: number;
  theme: string,
}

@Component({
  selector: 'app-generate-sponsored-members-dialog',
  templateUrl: './generate-sponsored-members-dialog.component.html',
  styleUrls: ['./generate-sponsored-members-dialog.component.scss']
})
export class GenerateSponsoredMembersDialogComponent implements OnInit, AfterViewInit {

  @ViewChild('exporter', {})
  exporter: MatTableExporterDirective;

  @Output()
  page = new EventEmitter<PageEvent>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  theme: string;
  loading = false;
  dataSource: MatTableDataSource<{name: string, status: string, login: string, passwd: string}> =
    new MatTableDataSource<{name: string; status: string; login: string; passwd: string}>();
  outputColumns = ['name', 'status', 'login', 'password'];
  functionalityNotSupported = false;

  notEmptyRegex = /.*\S.*/;
  emailRegx = /^(([^<>+()\[\]\\.,;:\s@"-#$%&=]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;

  namespaceOptions: string[] = [];
  usersInfoFormGroup: FormGroup;

  passwordReset = null;
  groupAssignment = null;
  expiration = null;

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
    this.parseNamespace();
    if (this.namespaceOptions.length === 0) {
      this.functionalityNotSupported = true;
    }
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.usersInfoFormGroup = this.formBuilder.group({
      namespace: ['', Validators.required],
      sponsoredMembers: ['', [Validators.required, this.userInputValidator()]]
    });

    this.attributesService.getVoAttributes(this.data.voId).subscribe(attributes => {
      this.manualMemberAddingBlocked = this.hasAttributeEnabled(attributes, 'blockManualMemberAdding')
      if(this.manualMemberAddingBlocked !== true){
        this.groupsService.getAllRichGroupsWithAttributesByNames(this.data.voId, this.groupAttrNames).subscribe(grps => {
          this.allVoGroups = grps.filter(grp => grp.name !== 'members');
          this.assignableGroups = this.filterAssignableGroups(grps);
          this.loading = false;
        }, () => this.loading = false);
      } else {
        this.loading = false;
      }
    }, () => this.loading = false);
  }

  parseNamespace(){
    const namespaces = this.store.get('sponsor_namespace_attributes');
    for(const namespace of namespaces){
      const index = namespace.lastIndexOf(':');
      if(index !== -1){
        this.namespaceOptions.push(namespace.substring(index + 1, namespace.length));
      }
    }
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

  exportData(data) {
    this.dataSource.data = this.createOutputObjects(data);
    this.exporter.exportTable('xlsx', {fileName: 'member-logins'});
  }

  onGenerate(){
    this.loading = true;
    const listOfMembers = this.usersInfoFormGroup.get('sponsoredMembers').value.split("\n");
    const header = 'firstname;lastname;urn:perun:user:attribute-def:def:preferredMail;urn:perun:user:attribute-def:def:note';
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
      namespace: this.usersInfoFormGroup.get('namespace').value,
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

    this.membersService.createSponsoredMembersFromCSV(inputSponsoredMembersFromCSV).subscribe(logins => {
      this.exportData(logins);
      this.notificator.showSuccess(this.translate.instant('DIALOGS.GENERATE_SPONSORED_MEMBERS.SUCCESS'));
      this.dialogRef.close(true);
    }, err => this.loading = false);
  }

  onCancel() {
    this.dialogRef.close(false);
  }

  parseMemberLine(line: string):string {
    const trimLine = line.trim();
    if (trimLine === '') {
      return '';
    }
    const memberAttributes = trimLine.split(';');
    if (memberAttributes.length !== 4) {      //check if all attributes are filled
      return 'format';
    }
    if (!memberAttributes[2].trim().match(this.emailRegx)) {      //check if the email is valid email
      return 'email';
    }
    return memberAttributes[0].trim() + ';' + memberAttributes[1].trim() + ';' + memberAttributes[2].trim() + ';' + memberAttributes[3].trim();
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
      }

      return null;
    };
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  pageChanged(event: PageEvent) {
    this.page.emit(event);
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

}
