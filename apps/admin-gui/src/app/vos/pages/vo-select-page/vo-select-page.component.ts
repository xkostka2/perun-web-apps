import { Component, OnInit } from '@angular/core';
import {SideMenuService} from '../../../core/services/common/side-menu.service';
import { Vo, VosManagerService } from '@perun-web-apps/perun/openapi';
import { getDefaultDialogConfig, getRecentlyVisited, getRecentlyVisitedIds } from '@perun-web-apps/perun/utils';
import {
  ApiRequestConfigurationService,
  GuiAuthResolver, InitAuthService,
  NotificatorService
} from '@perun-web-apps/perun/services';
import { MatDialog } from '@angular/material/dialog';
import { RemoveVoDialogComponent } from '../../../shared/components/dialogs/remove-vo-dialog/remove-vo-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { CreateVoDialogComponent } from '../../../shared/components/dialogs/create-vo-dialog/create-vo-dialog.component';
import { TABLE_VO_SELECT, TableConfigService } from '@perun-web-apps/config/table-config';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-vo-select-page',
  templateUrl: './vo-select-page.component.html',
  styleUrls: ['./vo-select-page.component.scss']
})
export class VoSelectPageComponent implements OnInit {

  constructor(
    private sideMenuService: SideMenuService,
    private voService: VosManagerService,
    private guiAuthResolver: GuiAuthResolver,
    private tableConfigService: TableConfigService,
    private dialog: MatDialog,
    private notificator: NotificatorService,
    private apiRequest: ApiRequestConfigurationService,
    private initAuthService: InitAuthService
  ) { }

  vos: Vo[] = [];
  recentIds = [];
  loading: boolean;
  filterValue = '';

  createAuth: boolean;
  deleteAuth: boolean;

  selection: SelectionModel<Vo>;

  displayedColumns: string[];
  tableId = TABLE_VO_SELECT;
  pageSize: number;

  ngOnInit() {
    this.loading = true;
    this.pageSize = this.tableConfigService.getTablePageSize(this.tableId);
    this.selection = new SelectionModel<Vo>(false, []);
    this.createAuth = this.guiAuthResolver.isAuthorized('createVo_Vo_policy', []);
    this.deleteAuth = this.guiAuthResolver.isAuthorized('deleteVo_Vo_policy', []);
    this.displayedColumns = this.deleteAuth ? ['checkbox', 'id', 'highestRole', 'shortName', 'name'] : ['id', 'highestRole', 'shortName', 'name'];
    this.sideMenuService.setAccessMenuItems([]);
    this.refreshTable();
  }

  refreshTable() {
    this.loading = true;
    this.selection.clear();
    this.apiRequest.dontHandleErrorForNext();
    this.voService.getMyVos().subscribe(vos => {
      this.vos = getRecentlyVisited('vos', vos);
      this.recentIds = getRecentlyVisitedIds('vos');
      this.loading = false;
    }, error => {
      if (error.error.name === 'PrivilegeException') {
        this.vos = [];
        this.loading = false;
      } else {
        this.notificator.showRPCError(error);
      }
    });
  }

  applyFilter(filterValue: string) {
    this.filterValue = filterValue;
  }

  onCreateVo() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = { theme: 'vo-theme'};

    const dialogRef = this.dialog.open(CreateVoDialogComponent, config);

    dialogRef.afterClosed().subscribe( isVoCreated => {
      if (isVoCreated){
        this.loading = true;
        this.initAuthService.loadPrincipal().then(() => this.refreshTable());
      }
    });
  }

  onRemoveVo() {
    const config = getDefaultDialogConfig();
    config.width = '600px';
    config.data = { theme: 'vo-theme', vos: this.selection.selected};

    const dialogRef = this.dialog.open(RemoveVoDialogComponent, config);

    dialogRef.afterClosed().subscribe( isVoRemoved => {
      if (isVoRemoved){
        this.refreshTable();
      }
    });
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.tableConfigService.setTablePageSize(this.tableId, event.pageSize);
  }
}
