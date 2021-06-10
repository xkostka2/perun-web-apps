import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { RichUser, Candidate, MemberCandidate, Attribute, Group} from '@perun-web-apps/perun/openapi';
import {
  getCandidateEmail,
  getExtSourceNameOrOrganizationColumn,
  parseUserEmail,
  parseVo,
  TABLE_ITEMS_COUNT_OPTIONS,
  customDataSourceFilterPredicate,
  customDataSourceSort,
  downloadData,
  getDataForExport, parseFullName
} from '@perun-web-apps/perun/utils';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';

@Component({
  selector: 'app-members-candidates-list',
  templateUrl: './members-candidates-list.component.html',
  styleUrls: ['./members-candidates-list.component.scss']
})
export class MembersCandidatesListComponent implements OnChanges, AfterViewInit {

  constructor(private guiAuthResolver: GuiAuthResolver) {
  }

  private sort: MatSort;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  public paginator: MatPaginator;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  };

  @Input()
  members: MemberCandidate[];

  @Input()
  selection: SelectionModel<MemberCandidate>;

  @Input()
  type: string;

  @Input()
  pageSize = 10;

  @Input()
  group: Group;

  @Output()
  page = new EventEmitter<PageEvent>();

  displayedColumns: string[] = ['checkbox', 'status', 'fullName', 'voExtSource', 'email', 'logins', 'alreadyMember', 'local'];
  dataSource: MatTableDataSource<MemberCandidate>;

  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  addAuth = false;

  getDataForColumn(data: MemberCandidate, column: string, outerThis: MembersCandidatesListComponent): string{
    switch (column) {
      case 'status':
        return data.member ? data.member.status ?? '' : '';
      case 'fullName':
        const user = data.richUser ? data.richUser : data.candidate
        return user.lastName ? user.lastName : user.firstName ?? ''
      case 'voExtSource':
        return data.richUser ? parseVo(data.richUser) : getExtSourceNameOrOrganizationColumn(data.candidate);
      case 'email':
        if (data.richUser || data.member) {
          return parseUserEmail(data.richUser);
        }
        return outerThis.getEmail(data);
      case 'logins':
        return outerThis.getLogins(data);
      case 'alreadyMember':
        return outerThis.getAlreadyMember(data);
      case 'local':
        return data.richUser ? "Local" : "External identity"
      default:
        return data[column];
    }
  }

  getExportDataForColumn(data: MemberCandidate, column: string, outerThis: MembersCandidatesListComponent): string{
    switch (column) {
      case 'status':
        return data.member ? data.member.status ?? '' : '';
      case 'fullName':
        const user = data.richUser ? data.richUser : data.candidate
        return parseFullName(user);
      case 'voExtSource':
        return data.richUser ? parseVo(data.richUser) : getExtSourceNameOrOrganizationColumn(data.candidate);
      case 'email':
        if (data.richUser || data.member) {
          return parseUserEmail(data.richUser);
        }
        return outerThis.getEmail(data);
      case 'logins':
        return outerThis.getLogins(data);
      case 'alreadyMember':
        return outerThis.getAlreadyMember(data);
      case 'local':
        return data.richUser ? "Local" : "External identity"
      default:
        return data[column];
    }
  }

  exportData(format: string){
    downloadData(getDataForExport(this.dataSource.filteredData, this.displayedColumns, this.getExportDataForColumn, this), format);
  }

  setDataSource() {
    if (!!this.dataSource) {
      this.dataSource.sort = this.sort;

      this.dataSource.filterPredicate = (data: MemberCandidate, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: MemberCandidate[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getDataForColumn, this);
      };
      this.dataSource.paginator = this.paginator;
    }
  }

  ngAfterViewInit(): void {
    this.setDataSource();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.dataSource = new MatTableDataSource<MemberCandidate>(this.members);

    this.setDataSource();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
    this.setAddAuth();
  }

  getEmail(memberCandidate: MemberCandidate): string {
    let email: Attribute;
    if (memberCandidate.richUser) {
      for (const attribute of memberCandidate.richUser.userAttributes) {
        if (attribute.namespace + ':' + attribute.friendlyName === 'urn:perun:user:attribute-def:def:preferredMail') {
          email = attribute;
          break;
        }
      }
      if (email != null && email.value != null && !('null' === email.value.toString().toLowerCase())) {
        return email.value.toString().replace(',', ' ');
      }
      return '';
    } else {
      return getCandidateEmail(memberCandidate.candidate);
    }

  }

  getOrganization(candidate: Candidate): string {
    return getExtSourceNameOrOrganizationColumn(candidate);
  }

  /**
   * Gets all logins stored in user attributes
   *
   * @return users logins
   */
  getLogins(memberCandidate: MemberCandidate): string {
    if (memberCandidate.richUser) {
      return this.getLoginsForRichUser(memberCandidate.richUser);
    } else {
      let logins = this.getLoginsForCandidate(memberCandidate.candidate);
      if (logins == null || logins === '') {
        logins = memberCandidate.candidate.userExtSource.login;
      }
      return logins;
    }
  }

  getLoginsForRichUser(user: RichUser): string {
    let logins = '';
    for (const userAttribute of user.userAttributes) {
      if (userAttribute.friendlyName.startsWith('login-namespace')) {
        // process only logins which are not null
        if (userAttribute.value != null) {
          // append comma
          if (logins.length > 0) {
            logins += ', ';
          }
          // parse login namespace
          const parsedNamespace = userAttribute.friendlyName.substring(16);
          logins += parsedNamespace + ': ' + userAttribute.value;
        }
      }
    }
    return logins;
  }

  getLoginsForCandidate(candidate: Candidate): string {
    const attributesNamespace = 49;
    let logins = '';
    for (const prop in candidate.attributes) {
      if (candidate.attributes.hasOwnProperty(prop)) {
        if (prop.indexOf('urn:perun:user:attribute-def:def:login-namespace:') !== -1) {
          if (candidate.attributes[prop] != null) {
            if (logins.length > 0) {
              logins += ', ';
            }
            // parse login namespace
            const parsedNamespace = prop.substring(attributesNamespace);
            logins += parsedNamespace + ': ' + candidate.attributes[prop];
          }
        }
      }
    }
    return logins;
  }

  getAlreadyMember(memberCandidate: MemberCandidate): string {
    if (this.type === 'vo') {
      if (memberCandidate.member != null) return 'Member of VO';
    } else {
      if (memberCandidate.member != null &&
        memberCandidate.member.sourceGroupId !== 0 &&
        memberCandidate.member.membershipType === 'DIRECT') return 'Member of Group';
      if (memberCandidate.member != null &&
        memberCandidate.member.sourceGroupId !== 0 &&
        memberCandidate.member.membershipType === 'INDIRECT') return 'Indirect member of Group';
      if (memberCandidate.member != null) return 'Member of VO';
    }
    return '';
  }

  isCheckboxDisabled(memberCandidate: MemberCandidate): boolean {
    if (this.type === 'vo') {
      return memberCandidate.member != null;
    } else {
      if (memberCandidate.member) {
        return memberCandidate.member.sourceGroupId !== 0 &&
          memberCandidate.member.membershipType === 'DIRECT';
      }
    }
    return false;
  }

  pageChanged(event: PageEvent) {
    this.paginator.pageSize = event.pageSize;
    this.paginator.pageIndex = event.pageIndex;
    this.page.emit(event);
    this.paginator.page.emit(event);
  }

  setAddAuth() {
    if (this.group !== undefined && this.selection.selected.length !== 0) {
      if (this.selection.selected[0].member) {
        this.addAuth = true;
      } else {
        this.addAuth = this.guiAuthResolver.isAuthorized('createMember_Vo_User_List<Group>_policy', [this.group]) &&
          this.guiAuthResolver.isAuthorized('createMember_Vo_Candidate_List<Group>_policy', [this.group]);
      }
    }
  }

  itemSelectionToggle(item: MemberCandidate) {
    this.selection.toggle(item);
    this.setAddAuth();
  }
}
