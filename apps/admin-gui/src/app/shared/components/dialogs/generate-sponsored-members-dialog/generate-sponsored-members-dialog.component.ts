import { AfterViewInit, Component, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  InputCreateSponsoredMemberFromCSV,
  MembersManagerService
} from '@perun-web-apps/perun/openapi';
import { NotificatorService, StoreService } from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableExporterDirective } from 'mat-table-exporter';
import { formatDate } from '@angular/common';

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
  namespace: FormControl = new FormControl('', Validators.required);
  sponsoredMembers: FormControl = new FormControl('', [Validators.required, Validators.pattern(this.notEmptyRegex)]);

  passwordReset = false;

  expiration = 'never';

  constructor(private dialogRef: MatDialogRef<GenerateSponsoredMembersDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: GenerateSponsoredMembersDialogData,
              private store: StoreService,
              private membersService: MembersManagerService,
              private notificator: NotificatorService,
              private translate: TranslateService) { }

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.parseNamespace();
    if (this.namespaceOptions.length === 0) {
      this.functionalityNotSupported = true;
    }
    this.loading = false;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
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
    const listOfMembers = this.sponsoredMembers.value.split("\n");
    const header = 'firstname;lastname;urn:perun:user:attribute-def:def:preferredMail;urn:perun:user:attribute-def:def:note';
    const generatedMemberNames: string[] = [];
    for (const line of listOfMembers){
      const parsedLine = this.parseMemberLine(line);
      if (parsedLine !== 'error') {
        if (parsedLine !== '') {
          generatedMemberNames.push(parsedLine);
        }
      } else {
        this.loading = false;
        return;
      }
    }
    // For testing purposes
    // const fakeExportData = {
    //   'meno1': {'status': 'ok', 'login': '123', 'password': '456'},
    //   'meno2': {'status': 'ok', 'login': 'abc', 'password': 'wqeq'},
    // }
    // const fakeExportData = {"guest Zeman":{"password":"tmY@xwAz1D+L","login":"9137983","status":"OK"},
    //   "guest Japonec":{"password":"tmY@xwAz1D+L","login":"9137983","status":"OK"},
    // };
    // console.log(fakeExportData);
    //this.exportData(fakeExportData);

    const inputSponsoredMembersFromCSV: InputCreateSponsoredMemberFromCSV = {
      data: generatedMemberNames,
      header: header,
      namespace: this.namespace.value,
      sponsor: this.store.getPerunPrincipal().userId,
      vo: this.data.voId,
      sendActivationLink: this.passwordReset
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
      this.notificator.showError(this.translate.instant('DIALOGS.GENERATE_SPONSORED_MEMBERS.ERROR_FORMAT') + ': ' + trimLine);
      return 'error';
    }
    if (!memberAttributes[2].trim().match(this.emailRegx)) {      //check if the email is valid email
      this.notificator.showError(this.translate.instant('DIALOGS.GENERATE_SPONSORED_MEMBERS.ERROR_EMAIL') + ': ' + memberAttributes[2]);
      return 'error';
    }
    return memberAttributes[0].trim() + ';' + memberAttributes[1].trim() + ';' + memberAttributes[2].trim() + ';' + memberAttributes[3].trim();
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

}
