import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges, OnInit, Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Group, RichGroup, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import {
  customDataSourceFilterPredicate, customDataSourceSort, downloadData, getDataForExport,
  getDefaultDialogConfig,
  getGroupExpiration,
  parseDate,
  TABLE_ITEMS_COUNT_OPTIONS
} from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { ChangeExpirationDialogComponent, GroupSyncDetailDialogComponent } from '@perun-web-apps/perun/dialogs';
import { GuiAuthResolver, TableCheckbox } from '@perun-web-apps/perun/services';
import {
  EditFacilityResourceGroupVoDialogComponent,
  EditFacilityResourceGroupVoDialogOptions
} from '@perun-web-apps/perun/dialogs';
import { formatDate } from '@angular/common';


@Component({
  selector: 'perun-web-apps-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.scss']
})
export class GroupsListComponent implements OnInit, AfterViewInit, OnChanges {

  displayButtons = window.innerWidth > 800;

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @Input()
  theme = 'group-theme';

  constructor(private dialog: MatDialog,
              private authResolver: GuiAuthResolver,
              private voService: VosManagerService,
              private tableCheckbox: TableCheckbox) { }

  @Output()
  moveGroup = new EventEmitter<Group>();

  @Input()
  groups: Group[] | RichGroup[] = [];

  @Input()
  selection = new SelectionModel<Group>(true, []);

  private sort: MatSort;
  private hasMembersGroup = false;

  @Input()
  hideColumns: string[] = [];

  @Input()
  disableMembers: boolean;

  @Input()
  disableGroups: boolean;

  @Input()
  groupsToDisable: Set<number> = new Set<number>();

  @Input()
  pageSize = 10;

  @Input()
  filter = '';

  @Input()
  disableHeadCheckbox: boolean;

  @Input()
  parentGroup: Group;

  @Input()
  disableRouting = false;

  @Input()
  authType: string;

  @Input()
  memberId: number;

  @Input()
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  @Input()
  recentIds: number[] = [];

  @Output()
  page = new EventEmitter<PageEvent>();

  @Output()
  refreshTable = new EventEmitter<void>();

  displayedColumns: string[] = ['select', 'id', 'recent', 'vo', 'name', 'description', 'expiration', 'menu'];
  dataSource: MatTableDataSource<Group | RichGroup>;

  disabledRouting = false;

  vo: Vo;
  voIds: Set<number> = new Set<number>();
  voNames: Map<number, string> = new Map<number, string>();

  removeAuth: boolean;

  private paginator: MatPaginator;

  @ViewChild(MatPaginator, { static: true }) set matPaginator(pg: MatPaginator) {
    this.paginator = pg;
  };

  @HostListener('window:resize', ['$event'])
  shouldHideButtons() {
    this.displayButtons = window.innerWidth > 800;
  }

  ngOnInit(): void {
    this.shouldHideButtons();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.authResolver.isPerunAdmin()){
      this.displayedColumns = this.displayedColumns.filter(column => column !== 'id');
    }
    this.disabledRouting = this.disableRouting;
    this.hasMembersGroup = this.checkIfHasMembersGroup();
    this.updateVoNames();
    this.dataSource = new MatTableDataSource<Group>(this.groups);
    this.setDataSource();
    if (this.authType) {
      this.removeAuth = this.setAuth();
    }
  }

  checkIfHasMembersGroup(): boolean {
    for (const group of this.groups) {
      if (group.name === 'members') {
        return true;
      }
    }
    return false;
  }

  getDataForColumn(data: Group | RichGroup, column: string, otherThis: GroupsListComponent): string{
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'vo':
        return this.voNames.get(data.voId);
      case 'name':
        return data.name;
      case 'description':
        return  data.description;
      case 'expiration':
        const expirationStr = getGroupExpiration(data);
        return parseDate(expirationStr);
      case 'recent':
        return '';
      default:
        return data[column];
    }
  }

  getSortDataForColumn(data: Group | RichGroup, column: string, otherThis: GroupsListComponent): string{
    switch (column) {
      case 'id':
        return data.id.toString();
      case 'vo':
        return this.voNames.get(data.voId);
      case 'name':
        return data.name;
      case 'description':
        return  data.description;
      case 'expiration':
        const expirationStr = getGroupExpiration(data);
        if(!expirationStr || expirationStr.toLowerCase() === 'never'){
          return expirationStr;
        }
        return formatDate(expirationStr, 'yyyy.MM.dd', 'en');
      case 'recent':
        if (otherThis.recentIds) {
          if (otherThis.recentIds.indexOf(data.id) > -1) {
            return '#'.repeat(otherThis.recentIds.indexOf(data.id));
          }
        }
        return data['name'];
      default:
        return data[column];
    }
  }

  exportData(format: string){
    downloadData(getDataForExport(this.dataSource.filteredData, this.displayedColumns, this.getDataForColumn, this), format);
  }

  setDataSource() {
    this.displayedColumns = this.displayedColumns.filter(x => !this.hideColumns.includes(x));
    if (!!this.dataSource) {
      this.dataSource.filterPredicate = (data: Group|RichGroup, filter: string) => {
        return customDataSourceFilterPredicate(data, filter, this.displayedColumns, this.getDataForColumn, this)
      };
      this.dataSource.sortData = (data: Group[] | RichGroup[], sort: MatSort) => {
        return customDataSourceSort(data, sort, this.getSortDataForColumn, this);
      };
      this.dataSource.sort = this.sort;
      this.dataSource.filter = this.filter;
      this.dataSource.paginator = this.paginator;
    }
  }

  canBeSelected = (group: Group): boolean => {
     return (group.name !== 'members' || !this.disableMembers) && !this.disableSelect(group);
  }

  isAllSelected() {
    return this.tableCheckbox.isAllSelectedWithDisabledCheckbox(this.selection.selected.length, this.filter, this.pageSize, this.paginator.hasNextPage(), this.paginator.pageIndex, this.dataSource, this.sort, this.canBeSelected);
  }

  masterToggle() {
    this.tableCheckbox.masterToggle(this.isAllSelected(), this.selection, this.filter, this.dataSource, this.sort, this.pageSize, this.paginator.pageIndex,true, this.canBeSelected);

    if(this.authType){
      this.removeAuth = this.setAuth();
    }
  }

  checkboxLabel(row?: Group): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  disableSelect(grp: Group): boolean {
    return this.disableGroups && (this.groupsToDisable.has(grp.id) || this.isSynchronized(grp));
  }

  ngAfterViewInit(): void {
    if(this.vo === undefined && this.groups.length !== 0) {
      this.vo  = {
        id: this.groups[0].voId,
        beanName: "Vo"
      };
    }

    this.dataSource.paginator = this.paginator;
  }

  onMoveGroup(group: Group) {
    this.moveGroup.emit(group);
  }

  onSyncDetail(rg: RichGroup) {
    const config = getDefaultDialogConfig();
    config.data = {
      groupId: rg.id,
      theme: this.theme
    };
    this.dialog.open(GroupSyncDetailDialogComponent, config);
  }

  onChangeNameDescription(rg: RichGroup) {
    const config = getDefaultDialogConfig();
    config.data = {
      theme: 'group-theme',
      group: rg,
      dialogType: EditFacilityResourceGroupVoDialogOptions.GROUP
    };
    const dialogRef = this.dialog.open(EditFacilityResourceGroupVoDialogComponent, config);

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.refreshTable.emit();
      }
    });
  }

  pageChanged(event: PageEvent) {
    this.page.emit(event);
  }

  setAuth(): boolean {
    if (this.authType === 'group-subgroups') {
      return this.selection.selected.reduce((acc, grp) => acc &&
        this.authResolver.isAuthorized('deleteGroup_Group_boolean_policy', [grp]), true);
    } else if (this.authType === 'group-relations') {
      return this.selection.selected.reduce((acc, grp) => acc &&
        this.authResolver.isAuthorized('removeGroupUnion_Group_Group_policy', [this.parentGroup, grp]), true);
    } else if (this.authType === 'vo-groups') {
      return this.selection.selected.reduce((acc, grp) => acc &&
        this.authResolver.isAuthorized('deleteGroup_Group_boolean_policy', [this.vo, grp]), true);
    } else if (this.authType === 'member-groups') {
      return this.selection.selected.reduce((acc, grp) => acc &&
        this.authResolver.isAuthorized('removeMember_Member_List<Group>_policy', [grp]), true);
    } else if (this.authType === 'application-form-manage-groups') {
      return this.selection.selected.reduce((acc, grp) => acc &&
        this.authResolver.isAuthorized('deleteGroupsFromAutoRegistration_List<Group>_policy', [this.vo, grp]), true);
    }
  }

  itemSelectionToggle(item: Group) {
    this.selection.toggle(item);
    this.removeAuth = this.setAuth();
  }

  isSynchronized(grp: RichGroup) {
    if (grp.attributes){
      return grp.attributes.some(att =>
        att.friendlyName === "synchronizationEnabled" && att.value !== null && att.value.toString() === "true");
    }
    return false;
  }

  getCheckboxTooltipMessage(row: Group | RichGroup) {
    if (this.authType === 'create-relation-dialog'){
      return 'SHARED_LIB.PERUN.COMPONENTS.GROUPS_LIST.CREATE_RELATION_AUTH_TOOLTIP';
    } else if (this.isSynchronized(row)){
      return 'SHARED_LIB.PERUN.COMPONENTS.GROUPS_LIST.SYNCHRONIZED_GROUP';
    } else {
      return 'SHARED_LIB.PERUN.COMPONENTS.GROUPS_LIST.ALREADY_MEMBER_TOOLTIP';
    }
  }

  updateVoNames() {
    if (!this.hideColumns.includes('vo')){
        this.groups.forEach(grp => {
          if(!this.voIds.has(grp.voId)){
            this.voIds.add(grp.voId);
            this.voService.getVoById(grp.voId).subscribe(vo => {
              this.voNames.set(grp.voId, vo.name);
            });
          }
        });
      }
  }

  changeExpiration(group: RichGroup) {
    const expirationAtt = group.attributes.find(att => att.baseFriendlyName === 'groupMembershipExpiration');
    const config = getDefaultDialogConfig();
    config.width = '400px';
    config.data = {
      memberId: this.memberId,
      groupId: group.id,
      expirationAttr: expirationAtt,
      mode: 'group'
    }

    const dialogRef = this.dialog.open(ChangeExpirationDialogComponent, config);
    dialogRef.afterClosed().subscribe(success => {
      if (success){
        this.refreshTable.emit();
      }
    });
  }

  canManageGroup(group: Group): boolean {
    return this.authResolver.isThisGroupAdmin(group.id) || this.authResolver.isThisVoAdmin(group.voId);
  }
}
