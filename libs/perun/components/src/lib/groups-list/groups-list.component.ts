import {
  AfterViewInit,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges, Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Group, RichGroup, Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig, TABLE_ITEMS_COUNT_OPTIONS } from '@perun-web-apps/perun/utils';
import { MatDialog } from '@angular/material/dialog';
import { ChangeExpirationDialogComponent, GroupSyncDetailDialogComponent } from '@perun-web-apps/perun/dialogs';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import {
  EditFacilityResourceGroupVoDialogComponent,
  EditFacilityResourceGroupVoDialogOptions
} from '@perun-web-apps/perun/dialogs';


@Component({
  selector: 'perun-web-apps-groups-list',
  templateUrl: './groups-list.component.html',
  styleUrls: ['./groups-list.component.scss']
})
export class GroupsListComponent implements  AfterViewInit, OnChanges {

  displayButtons = window.innerWidth > 800;

  @ViewChild(MatSort, { static: true }) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSource();
  }

  @Input()
  theme = 'group-theme';

  constructor(private dialog: MatDialog,
              private authResolver: GuiAuthResolver,
              private voService: VosManagerService) { }

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

  @Output()
  page = new EventEmitter<PageEvent>();

  @Output()
  refreshTable = new EventEmitter<void>();

  displayedColumns: string[] = ['select', 'id', 'vo', 'name', 'description','expiration', 'menu'];
  dataSource: MatTableDataSource<Group | RichGroup>;

  exporting = false;
  disabledRouting = false;

  vo: Vo;
  voIds: Set<number> = new Set<number>();
  voNames: Map<number, string> = new Map<number, string>();

  removeAuth: boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  pageSizeOptions = TABLE_ITEMS_COUNT_OPTIONS;

  @HostListener('window:resize', ['$event'])
  shouldHideButtons() {
    this.displayButtons = window.innerWidth > 800;
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

  setDataSource() {
    this.displayedColumns = this.displayedColumns.filter(x => !this.hideColumns.includes(x));
    if (!!this.dataSource) {
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'vo' :{
            if (item.voId) {
              return this.voNames.get(item.voId).toLowerCase();
            }
            break;
          }
          default: return item[property];
        }
      };
      this.dataSource.sort = this.sort;
      this.dataSource.filterPredicate = (data: Group, filter: string) => {
        filter = filter.toLowerCase();
        const dataStr = (data.id.toString() + this.voNames.get(data.voId) + data.name + data.description).toLowerCase();
        return dataStr.indexOf(filter) !== -1;
      };
      this.dataSource.filter = this.filter;
      this.dataSource.paginator = this.paginator;
    }
  }

  canBeSelected(group: Group) {
    return (group.name !== 'members' || !this.disableMembers) && !this.disableSelect(group);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.filter(grp => this.canBeSelected(grp)).length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => {
        if (this.canBeSelected(row)) {
          this.selection.select(row);
        }
      });

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
}
